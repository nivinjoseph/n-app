import { given } from "@nivinjoseph/n-defensive";
import { inject } from "@nivinjoseph/n-ject";
import { ComponentViewModel, element, EventAggregator, FileInfo, template } from "../../../../../../src";
import "./file-uploader-view.scss";


@template(require("./file-uploader-view.html"))
@element("file-uploader")
@inject("EventAggregator")
export class FileUploaderViewModel extends ComponentViewModel
{
    private readonly _eventAggregator: EventAggregator;


    private _file: FileInfo | null = null;
    private _isProcessing = false;


    public get file(): FileInfo | null { return this._file; }
    public get isProcessing(): boolean { return this._isProcessing; }


    public constructor(eventAggregator: EventAggregator)
    {
        super();

        given(eventAggregator, "eventAggregator").ensureHasValue().ensureIsObject();
        this._eventAggregator = eventAggregator;
    }


    public uploadFile(): void
    {
        this._eventAggregator.publish("openFileSelect", "fileField");
    }

    public onFileSelected(val: FileInfo): void
    {
        console.log("File data", val);

        this._file = val;
    }

    public onProcessing(): void
    {
        this._isProcessing = true;
    }

    public onProcessed(): void
    {
        this._isProcessing = false;
    }
}