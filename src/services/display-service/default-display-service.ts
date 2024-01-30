import type { DisplayService } from "./display-service.js";
import { DisplayType } from "./display-type.js";
import { type Observable, Observer } from "@nivinjoseph/n-util";


export class DefaultDisplayService implements DisplayService
{
    private readonly _windowResizeObserver = new Observer<void>("windowResized");
    private _currentDisplayType!: DisplayType;
    private _currentDisplayWidth!: number;
    private _currentDisplayHeight!: number;


    public get currentDisplayType(): DisplayType { return this._currentDisplayType; }
    public get currentDisplayWidth(): number { return this._currentDisplayWidth; }
    public get currentDisplayHeight(): number { return this._currentDisplayHeight; }
    
    public get windowResizeObservable(): Observable<void> { return this._windowResizeObserver; }
    


    public constructor()
    {
        this._calculateCurrentDisplayType();
        $(window).on("resize", () =>
        {
            this._calculateCurrentDisplayType();
            this._windowResizeObserver.notify();
        });
    }


    private _calculateCurrentDisplayType(): void
    {
        const displayHeight = $(window).height()!;
        if (this._currentDisplayHeight !== displayHeight)
            this._currentDisplayHeight = displayHeight;   
        
        const displayWidth = $(window).width()!;
        if (this._currentDisplayWidth !== displayWidth)
            this._currentDisplayWidth = displayWidth;

        let displayType = DisplayType.desktop;
        if (displayWidth < 1024) displayType = DisplayType.tablet;
        if (displayWidth < 769) displayType = DisplayType.phone;
        this._currentDisplayType = displayType;
    }
}