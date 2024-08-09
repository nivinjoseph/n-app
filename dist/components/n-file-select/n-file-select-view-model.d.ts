import { ComponentViewModel } from "../../core/component-view-model.js";
import type { DialogService } from "../../services/dialog-service/dialog-service.js";
import type { EventAggregator } from "../../services/event-aggregator/event-aggregator.js";
export interface FileInfo {
    fileName: string;
    fileType: string;
    fileSize: number;
    fileData: string;
    fileMime: string;
    fileDataUrl: string;
    nativeFile: File;
}
export declare class NFileSelectViewModel extends ComponentViewModel {
    private readonly _dialogService;
    private readonly _eventAggregator;
    private readonly _inputTemplate;
    private readonly _inputTemplateMultiple;
    private _inputElement;
    private _maxFileSizeBytes;
    private get _mimeTypesList();
    private get _maxFileSizeValue();
    private get _isMultiple();
    constructor(dialogService: DialogService, eventAggregator: EventAggregator);
    protected onCreate(): void;
    protected onMount(element: HTMLElement): void;
    private _processFiles;
    private _createFileInfo;
    private _ensureFileSizeIsAllowed;
    private _ensureFileTypeIsAllowed;
    private _initializeMaxFileSizeBytes;
}
//# sourceMappingURL=n-file-select-view-model.d.ts.map