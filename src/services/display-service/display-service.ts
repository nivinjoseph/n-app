import { DisplayType } from "./display-type";


export interface DisplayService
{
    /**
     * The type of display used; 1 - Desktop, 2 - Tablet, 3 - Phone.
     */
    CurrentDisplayType: DisplayType;
    /**
     * The current display width.
     */
    CurrentDisplayWidth: number;
    /**
     * The current display height.
     */
    CurrentDisplayHeight: number;
}