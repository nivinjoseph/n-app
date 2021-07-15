export interface DialogService
{
    /**
     * Displays a loading screen. Called sequentially before hideLoadingScreen.
     */
    showLoadingScreen(): void;
    /**
     * Hides a loading screen. Called sequentially after showLoadingScreen.
     */
    hideLoadingScreen(): void;

    /**
     * 
     * Displays a message to the user.
     * 
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showMessage(message: string, title?: string): void;
    /**
     * 
     * Displays a "success" themed message to the user.
     * 
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showSuccessMessage(message: string, title?: string): void;
    /**
     * 
     * Displays a "warning" themed message to the user.
     * 
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showWarningMessage(message: string, title?: string): void;
    /**
     * 
     * Displays a "error" themed message to the user.
     * 
     * @param message - The message which is displayed to the user.
     * @param title - The title of the message also displayed to the user.
     */
    showErrorMessage(message: string, title?: string): void;

    /**
     * Clears all the message in the message stack.
     */
    clearMessages(): void;
}

