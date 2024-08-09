import { template } from "../../core/template.js";
import { element } from "../../core/element.js";
import { bind } from "../../core/bind.js";
import { ComponentViewModel } from "../../core/component-view-model.js";
import { inject } from "@nivinjoseph/n-ject";
import type { DialogService } from "../../services/dialog-service/dialog-service.js";
import type { EventAggregator } from "../../services/event-aggregator/event-aggregator.js";
import { given } from "@nivinjoseph/n-defensive";
// import * as $ from "jquery";
import { events } from "../../core/events.js";
import { Deferred, TypeHelper } from "@nivinjoseph/n-util";

// public
export interface FileInfo
{
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    fileMime: string;
    fileDataUrl: string;
    nativeFile: File;
}

@template(require("./n-file-select-view.html"))
@element("n-file-select")
@bind({
    id: "string",
    mimeTypes: "string",
    "maxFileSize?": "number",
    "multiple?": "boolean"
})
@events("select", "processingStarted", "processingCompleted")
@inject("DialogService", "EventAggregator")
export class NFileSelectViewModel extends ComponentViewModel
{
    private readonly _dialogService: DialogService;
    private readonly _eventAggregator: EventAggregator;
    private readonly _inputTemplate = `<input type="file" accept="{0}" style="display: none" />`;
    private readonly _inputTemplateMultiple = `<input type="file" accept="{0}" multiple style="display: none" />`;
    private _inputElement!: JQuery<HTMLElement>;
    private _maxFileSizeBytes: number | null = null;


    private get _mimeTypesList(): string { return this.getBound("mimeTypes"); }
    private get _maxFileSizeValue(): number | null { return TypeHelper.parseNumber(this.getBound("maxFileSize")); }
    private get _isMultiple(): boolean { return this.getBound("multiple") != null && this.getBound("multiple") === true; }


    public constructor(dialogService: DialogService, eventAggregator: EventAggregator)
    {
        super();

        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;

        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        this._eventAggregator = eventAggregator;

        this.executeOnCreate(() =>
        {
            const id = this.getBound<string>("id");
            given(id, "id").ensureHasValue().ensureIsString();

            const sub = this._eventAggregator.subscribe("openFileSelect", (identifier) =>
            {
                if (identifier !== id)
                    return;

                this._inputElement.click();
            });

            this.executeOnDestroy(() => sub.unsubscribe());
        });
    }


    protected override onCreate(): void
    {
        super.onCreate();

        given(this._mimeTypesList, "mimeTypesList")
            .ensure(t => t.split(",").every(mime =>
            {
                mime = mime.trim();
                return (mime.startsWith(".") && !mime.contains("/"))
                    || (!mime.startsWith(".") && mime.contains("/"));
            }));
    }

    protected override onMount(element: HTMLElement): void
    {
        this._initializeMaxFileSizeBytes();

        const inputText = this._isMultiple
            ? this._inputTemplateMultiple.format(this._mimeTypesList) : this._inputTemplate.format(this._mimeTypesList);

        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const fchange = function (this: any): void
        {
            that._processFiles(this.files);

            $(this).off("change");
            $(this).remove();
            that._inputElement = $(inputText);
            that._inputElement.change(fchange).appendTo($(element));
        };

        this._inputElement = $(inputText);
        this._inputElement.change(fchange).appendTo($(element));
    }


    private _processFiles(files: FileList | null): void
    {
        if (files == null || files.length === 0)
            return;

        this.emit("processingStarted");

        const promises = new Array<Promise<FileInfo>>();

        for (let i = 0; i < files.length; i++)
            promises.push(this._createFileInfo(files.item(i)!));

        Promise.all(promises)
            .then((results) =>
            {
                const processedFiles = new Array<FileInfo>();
                const sizeRestrictionFailedFiles = new Array<FileInfo>();
                const fileMimeRestrictionFailedFiles = new Array<FileInfo>();

                results.forEach(t =>
                {
                    if (!this._ensureFileSizeIsAllowed(t))
                        sizeRestrictionFailedFiles.push(t);
                    else if (!this._ensureFileTypeIsAllowed(t))
                        fileMimeRestrictionFailedFiles.push(t);
                    else
                        processedFiles.push(t);
                });

                sizeRestrictionFailedFiles.forEach(t => this._dialogService.showWarningMessage(
                    "File {0} exceeded the file size limit of {1} MB.".format(t.fileName, this._maxFileSizeValue)));

                fileMimeRestrictionFailedFiles.forEach(t => this._dialogService.showWarningMessage(
                    `File ${t.fileName} is of invalid type`
                ));

                if (processedFiles.length > 0)
                    this.emit("select", this._isMultiple ? processedFiles : processedFiles[0]);

                this.emit("processingCompleted");
            })
            .catch((e) =>
            {
                console.error(e);
                this._dialogService.showErrorMessage("An error occurred while processing the files.", "ERROR");

                this.emit("processingCompleted");
            });
    }

    private _createFileInfo(file: File): Promise<FileInfo>
    {
        const fileInfo = {} as FileInfo;
        fileInfo.nativeFile = file;
        fileInfo.fileName = file.name;
        fileInfo.fileType = file.type;
        fileInfo.fileSize = file.size;

        const deferred = new Deferred<FileInfo>();

        // if (fileInfo.fileType == null || fileInfo.fileType.isEmptyOrWhiteSpace())
        // {
        //     if (fileInfo.fileName.contains("."))
        //     {
        //         const splitted = fileInfo.fileName.trim().split(".");
        //         fileInfo.fileType = "." + splitted[splitted.length - 1].trim();
        //     }
        // }

        const reader = new FileReader();
        reader.onload = function (e: any): void
        {
            fileInfo.fileDataUrl = e.target.result;
            const splitted = (e.target.result as string).split(",");
            fileInfo.fileMime = splitted[0].trim().split(";")[0].substr(5);
            fileInfo.fileData = splitted[1];
            deferred.resolve(fileInfo);
        };

        reader.onerror = function (e: any): void
        {
            deferred.reject(e);
        };

        reader.readAsDataURL(file);

        return deferred.promise;
    }

    private _ensureFileSizeIsAllowed(fileInfo: FileInfo): boolean
    {
        return this._maxFileSizeBytes != null ? fileInfo.fileSize <= this._maxFileSizeBytes : true;
    }

    // this is a weak check. because this doesn't validate the file correctly if file ext is modified,
    // the ideal way to do this would be evaluating file headers
    private _ensureFileTypeIsAllowed(fileInfo: FileInfo): boolean
    {
        return this._mimeTypesList.split(",").some(t =>
        {
            t = t.trim();

            if (t.startsWith("."))
            {
                const jpegExt = ["jpg", "jpeg"];
                const ext = fileInfo.fileName.split(".").takeLast();

                if (jpegExt.contains(t.substring(1)))
                    return jpegExt.contains(ext);

                return ext === t.substring(1);
            }
            else
            {
                if (t.endsWith("*"))
                    return fileInfo.fileMime.startsWith(t.slice(0, -1));
                else
                {
                    const jpegMimeTypes = ["image/jpg", "image/jpeg"];

                    if (jpegMimeTypes.contains(t))
                        return jpegMimeTypes.contains(fileInfo.fileMime);

                    return fileInfo.fileMime === t;
                }
            }
        });
    }

    private _initializeMaxFileSizeBytes(): void
    {
        this._maxFileSizeBytes = this._maxFileSizeValue != null ? Number.parseInt(this._maxFileSizeValue.toString()) * 1024 * 1024 : null;
    }
}