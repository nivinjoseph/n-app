import { template } from "../../core/template.js";
import { element } from "../../core/element.js";
import { bind } from "../../core/bind.js";
import { ComponentViewModel } from "../../core/component-view-model.js";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
// import * as $ from "jquery";
import { events } from "../../core/events.js";
import { Deferred, TypeHelper } from "@nivinjoseph/n-util";
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
export class NFileSelectViewModel extends ComponentViewModel {
    _dialogService;
    _eventAggregator;
    _inputTemplate = `<input type="file" accept="{0}" style="display: none" />`;
    _inputTemplateMultiple = `<input type="file" accept="{0}" multiple style="display: none" />`;
    _inputElement;
    _maxFileSizeBytes = null;
    get _mimeTypesList() { return this.getBound("mimeTypes"); }
    get _maxFileSizeValue() { return TypeHelper.parseNumber(this.getBound("maxFileSize")); }
    get _isMultiple() { return this.getBound("multiple") != null && this.getBound("multiple") === true; }
    constructor(dialogService, eventAggregator) {
        super();
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;
        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        this._eventAggregator = eventAggregator;
        this.executeOnCreate(() => {
            const id = this.getBound("id");
            given(id, "id").ensureHasValue().ensureIsString();
            const sub = this._eventAggregator.subscribe("openFileSelect", (identifier) => {
                if (identifier !== id)
                    return;
                this._inputElement.click();
            });
            this.executeOnDestroy(() => sub.unsubscribe());
        });
    }
    onCreate() {
        super.onCreate();
        given(this._mimeTypesList, "mimeTypesList")
            .ensure(t => t.split(",").every(mime => {
            mime = mime.trim();
            return (mime.startsWith(".") && !mime.contains("/"))
                || (!mime.startsWith(".") && mime.contains("/"));
        }));
    }
    onMount(element) {
        this._initializeMaxFileSizeBytes();
        const inputText = this._isMultiple
            ? this._inputTemplateMultiple.format(this._mimeTypesList) : this._inputTemplate.format(this._mimeTypesList);
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const that = this;
        const fchange = function () {
            that._processFiles(this.files);
            $(this).off("change");
            $(this).remove();
            that._inputElement = $(inputText);
            that._inputElement.change(fchange).appendTo($(element));
        };
        this._inputElement = $(inputText);
        this._inputElement.change(fchange).appendTo($(element));
    }
    _processFiles(files) {
        if (files == null || files.length === 0)
            return;
        this.emit("processingStarted");
        const promises = new Array();
        for (let i = 0; i < files.length; i++)
            promises.push(this._createFileInfo(files.item(i)));
        Promise.all(promises)
            .then((results) => {
            const processedFiles = new Array();
            const sizeRestrictionFailedFiles = new Array();
            const fileMimeRestrictionFailedFiles = new Array();
            results.forEach(t => {
                if (!this._ensureFileSizeIsAllowed(t))
                    sizeRestrictionFailedFiles.push(t);
                else if (!this._ensureFileTypeIsAllowed(t))
                    fileMimeRestrictionFailedFiles.push(t);
                else
                    processedFiles.push(t);
            });
            sizeRestrictionFailedFiles.forEach(t => this._dialogService.showWarningMessage("File {0} exceeded the file size limit of {1} MB.".format(t.fileName, this._maxFileSizeValue)));
            fileMimeRestrictionFailedFiles.forEach(t => this._dialogService.showWarningMessage(`File ${t.fileName} is of invalid type`));
            if (processedFiles.length > 0)
                this.emit("select", this._isMultiple ? processedFiles : processedFiles[0]);
            this.emit("processingCompleted");
        })
            .catch((e) => {
            console.error(e);
            this._dialogService.showErrorMessage("An error occurred while processing the files.", "ERROR");
            this.emit("processingCompleted");
        });
    }
    _createFileInfo(file) {
        const fileInfo = {};
        fileInfo.nativeFile = file;
        fileInfo.fileName = file.name;
        fileInfo.fileType = file.type;
        fileInfo.fileSize = file.size;
        const deferred = new Deferred();
        // if (fileInfo.fileType == null || fileInfo.fileType.isEmptyOrWhiteSpace())
        // {
        //     if (fileInfo.fileName.contains("."))
        //     {
        //         const splitted = fileInfo.fileName.trim().split(".");
        //         fileInfo.fileType = "." + splitted[splitted.length - 1].trim();
        //     }
        // }
        const reader = new FileReader();
        reader.onload = function (e) {
            fileInfo.fileDataUrl = e.target.result;
            const splitted = e.target.result.split(",");
            fileInfo.fileMime = splitted[0].trim().split(";")[0].substr(5);
            fileInfo.fileData = splitted[1];
            deferred.resolve(fileInfo);
        };
        reader.onerror = function (e) {
            deferred.reject(e);
        };
        reader.readAsDataURL(file);
        return deferred.promise;
    }
    _ensureFileSizeIsAllowed(fileInfo) {
        return this._maxFileSizeBytes != null ? fileInfo.fileSize <= this._maxFileSizeBytes : true;
    }
    // this is a weak check. because this doesn't validate the file correctly if file ext is modified,
    // the ideal way to do this would be evaluating file headers
    _ensureFileTypeIsAllowed(fileInfo) {
        return this._mimeTypesList.split(",").some(t => {
            t = t.trim();
            if (t.startsWith(".")) {
                const jpegExt = ["jpg", "jpeg"];
                const ext = fileInfo.fileName.split(".").takeLast();
                if (jpegExt.contains(t.substring(1)))
                    return jpegExt.contains(ext);
                return ext === t.substring(1);
            }
            else {
                if (t.endsWith("*"))
                    return fileInfo.fileMime.startsWith(t.slice(0, -1));
                else {
                    const jpegMimeTypes = ["image/jpg", "image/jpeg"];
                    if (jpegMimeTypes.contains(t))
                        return jpegMimeTypes.contains(fileInfo.fileMime);
                    return fileInfo.fileMime === t;
                }
            }
        });
    }
    _initializeMaxFileSizeBytes() {
        this._maxFileSizeBytes = this._maxFileSizeValue != null ? Number.parseInt(this._maxFileSizeValue.toString()) * 1024 * 1024 : null;
    }
}
//# sourceMappingURL=n-file-select-view-model.js.map