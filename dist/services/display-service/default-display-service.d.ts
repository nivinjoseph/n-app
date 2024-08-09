import type { DisplayService } from "./display-service.js";
import { DisplayType } from "./display-type.js";
import { type Observable } from "@nivinjoseph/n-util";
export declare class DefaultDisplayService implements DisplayService {
    private readonly _windowResizeObserver;
    private _currentDisplayType;
    private _currentDisplayWidth;
    private _currentDisplayHeight;
    get currentDisplayType(): DisplayType;
    get currentDisplayWidth(): number;
    get currentDisplayHeight(): number;
    get windowResizeObservable(): Observable<void>;
    constructor();
    private _calculateCurrentDisplayType;
}
//# sourceMappingURL=default-display-service.d.ts.map