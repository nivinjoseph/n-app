export interface DialogService {
    /**
     * @description Displays a loading screen. Called sequentially before hideLoadingScreen.
     */
    showLoadingScreen(): void;
    /**
     * @description Hides a loading screen. Called sequentially after showLoadingScreen.
     */
    hideLoadingScreen(): void;
    /**
     * @description Displays a message to the user.
     *
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showMessage(message: string, title?: string): void;
    /**
     * @description Displays a "success" themed message to the user.
     *
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showSuccessMessage(message: string, title?: string): void;
    /**
     * @description Displays a "warning" themed message to the user.
     *
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showWarningMessage(message: string, title?: string): void;
    /**
     * @description Displays a "error" themed message to the user.
     *
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showErrorMessage(message: string, title?: string): void;
    /**
     * @description Clears all the message in the message stack.
     */
    clearMessages(): void;
}
export interface DialogServiceOptions {
    accentColor?: string;
    dialogLocation?: DialogLocation;
    newestOnTop?: boolean;
    enableCloseButton?: boolean;
    loadingScreen?: "spinner" | "topbar";
}
export declare enum DialogLocation {
    topLeft = "toast-top-left",
    topRight = "toast-top-right",
    topCenter = "toast-top-center",
    topFullWidth = "toast-top-full-width",
    bottomLeft = "toast-bottom-left",
    bottomRight = "toast-bottom-right",
    bottomCenter = "toast-bottom-center",
    bottomFullWidth = "toast-bottom-full-width"
}
//# sourceMappingURL=dialog-service.d.ts.map