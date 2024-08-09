import { DisplayType } from "./display-type.js";
import { Observer } from "@nivinjoseph/n-util";
export class DefaultDisplayService {
    _windowResizeObserver = new Observer("windowResized");
    _currentDisplayType;
    _currentDisplayWidth;
    _currentDisplayHeight;
    get currentDisplayType() { return this._currentDisplayType; }
    get currentDisplayWidth() { return this._currentDisplayWidth; }
    get currentDisplayHeight() { return this._currentDisplayHeight; }
    get windowResizeObservable() { return this._windowResizeObserver; }
    constructor() {
        this._calculateCurrentDisplayType();
        $(window).on("resize", () => {
            this._calculateCurrentDisplayType();
            this._windowResizeObserver.notify();
        });
    }
    _calculateCurrentDisplayType() {
        const displayHeight = $(window).height();
        if (this._currentDisplayHeight !== displayHeight)
            this._currentDisplayHeight = displayHeight;
        const displayWidth = $(window).width();
        if (this._currentDisplayWidth !== displayWidth)
            this._currentDisplayWidth = displayWidth;
        let displayType = DisplayType.desktop;
        if (displayWidth < 1024)
            displayType = DisplayType.tablet;
        if (displayWidth < 769)
            displayType = DisplayType.phone;
        this._currentDisplayType = displayType;
    }
}
//# sourceMappingURL=default-display-service.js.map