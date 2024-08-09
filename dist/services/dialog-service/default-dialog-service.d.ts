import "../../../vendor/toastr.js";
import "../../../vendor/topbar.js";
import "../../../vendor/spin.js";
declare global {
    interface Window {
        topbar: {
            config(config: {
                barThickness: number;
                barColors: Record<string, string>;
            }): void;
            show(): void;
            hide(): void;
        };
        Spinner: ClassDefinition<any>;
        toastr: any;
    }
}
import { type DialogService, type DialogServiceOptions } from "./dialog-service.js";
import type { ClassDefinition } from "@nivinjoseph/n-util";
export declare class DefaultDialogService implements DialogService {
    private readonly _accentColor;
    private readonly _toastr;
    private readonly _loadingScreenType;
    private _loadingScreenCount;
    private _loadingScreen;
    private _spinner;
    constructor(options?: DialogServiceOptions);
    showLoadingScreen(): void;
    hideLoadingScreen(): void;
    showMessage(message: string, title?: string): void;
    showSuccessMessage(message: string, title?: string): void;
    showWarningMessage(message: string, title?: string): void;
    showErrorMessage(message: string, title?: string): void;
    clearMessages(): void;
    private _showSpinner;
    private _hideSpinner;
    private _showTopBar;
    private _hideTopBar;
    private _createLoadingScreen;
}
//# sourceMappingURL=default-dialog-service.d.ts.map