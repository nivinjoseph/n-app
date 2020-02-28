// import { template } from "../core/template";
import { element } from "../core/element";
import { bind } from "../core/bind";
import { ComponentViewModel } from "../core/component-viewmodel";
import { inject } from "@nivinjoseph/n-ject";
import { DialogService } from "../services/dialog-service/dialog-service";
import { EventAggregator } from "../services/event-aggregator/event-aggregator";
import { given } from "@nivinjoseph/n-defensive";
import * as $ from "jquery";
import { ArgumentException } from "@nivinjoseph/n-exception";
import { template } from "../core/template";
import "./file-select-view.scss";

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


@template(require("./file-select-view.html"))
@element("file-select")
@bind("id", "mimeTypes", "maxFileSize", "multiple", "onSelection")
@inject("DialogService", "EventAggregator")    
export default class FileSelectViewModel extends ComponentViewModel
{
    private readonly _dialogService: DialogService;
    private readonly _eventAggregator: EventAggregator;
    private readonly _inputTemplate = `<input type="file" accept="{0}" style="display: none" />`;
    private readonly  _inputTemplateMultiple = `<input type="file" accept="{0}" multiple style="display: none" />`;
    private _inputElement: any;
    private _maxFileSizeBytes: number;

    
    private get mimeTypesList(): string { return this.getBound("mimeTypes"); }
    private get maxFileSizeValue(): number { return parseInt(this.getBound("maxFileSize")); }
    private get isMultiple(): boolean { return this.getBound("multiple") != null && this.getBound("multiple") === "true"; }

    
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
            if (id == null || typeof (id) !== "string" || id.isEmptyOrWhiteSpace())
                throw new ArgumentException("id", "id not specified for file-select");
            
            const sub = this._eventAggregator.subscribe("openFileSelect", (identifier) =>
            {
                if (identifier !== id)
                    return;
                
                this._inputElement.click();
            });
            
            this.executeOnDestroy(() => sub.unsubscribe());
        });
    }
    
    
    protected onMount(element: HTMLElement): void
    {         
        this.initializeMaxFileSizeBytes();

        const inputText = this.isMultiple
            ? this._inputTemplateMultiple.format(this.mimeTypesList) : this._inputTemplate.format(this.mimeTypesList);

        const that = this;
        const fchange = function ()
        {
            that.processFiles(this.files);
            $(this).off("change");
            $(this).remove();
            that._inputElement = $(inputText);
            that._inputElement.change(fchange).appendTo($(element));
        };

        this._inputElement = $(inputText);
        this._inputElement.change(fchange).appendTo($(element));
    }


    private processFiles(files: FileList): void
    {
        this._dialogService.showLoadingScreen();

        const promises = new Array<Promise<FileInfo>>();

        if (files == null || files.length === 0) return;

        for (let i = 0; i < files.length; i++)
        {
            const file = files[i];
            const fileInfo = {} as FileInfo;
            fileInfo.nativeFile = file;
            fileInfo.fileName = file.name;
            fileInfo.fileType = file.type;
            fileInfo.fileSize = file.size;
            
            // if (fileInfo.fileType == null || fileInfo.fileType.isEmptyOrWhiteSpace())
            // {
            //     if (fileInfo.fileName.contains("."))
            //     {
            //         const splitted = fileInfo.fileName.trim().split(".");
            //         fileInfo.fileType = "." + splitted[splitted.length - 1].trim();
            //     }
            // }

            const reader = new FileReader();
            const promise = new Promise<FileInfo>((resolve, reject) =>
            {
                reader.onload = function (fi: FileInfo, res: any)
                {
                    return function (e: any)
                    {
                        fi.fileDataUrl = (<any>e).target.result;
                        const splitted: string[] = (<any>e).target.result.split(",");
                        fi.fileMime = splitted[0].trim().split(";")[0].substr(5);
                        fi.fileData = splitted[1];
                        res(fi);
                    };
                }(fileInfo, resolve);
                
                reader.onerror = function (rej: any)
                {
                    return function (e: any)
                    {
                        rej(e);
                    };
                }(reject);
            });
            
            reader.readAsDataURL(file);

            promises.push(promise);
        }
        
        Promise.all(promises)
            .then((results) =>
            {
                const processedFiles = new Array<FileInfo>();
                const failedFiles = new Array<FileInfo>();

                results.forEach(t =>
                {
                    if (this.ensureFileSizeIsAllowed(t))
                        processedFiles.push(t);
                    else
                        failedFiles.push(t);
                });

                failedFiles.forEach(t => this._dialogService.showWarningMessage(
                    "File {0} exceeded the file size limit of {1} MB.".format(t.fileName, this.maxFileSizeValue)));

                if (processedFiles.length > 0)
                {
                    this.getBound<Function>("onSelection")(this.isMultiple ? processedFiles : processedFiles[0]);
                }
                
                this._dialogService.hideLoadingScreen();
            })
            .catch((e) =>
            {
                console.log(e);
                this._dialogService.showErrorMessage("An error occurred while processing the files.", "ERROR");
                this._dialogService.hideLoadingScreen();
            });
    }

    private ensureFileSizeIsAllowed(fileInfo: FileInfo): boolean
    {
        return this._maxFileSizeBytes != null ? fileInfo.fileSize <= this._maxFileSizeBytes : true;
    }

    private initializeMaxFileSizeBytes(): void
    {
        this._maxFileSizeBytes = this.maxFileSizeValue != null ? this.maxFileSizeValue * 1024 * 1024 : null;
    }
}