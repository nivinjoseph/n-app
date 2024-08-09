import type { Observable } from "@nivinjoseph/n-util";
import { DisplayType } from "./display-type.js";
export interface DisplayService {
    /**
   * @description The type of display used; 1 - Desktop, 2 - Tablet, 3 - Phone.
   */
    get currentDisplayType(): DisplayType;
    /**
     * @description The current display width.
     */
    get currentDisplayWidth(): number;
    /**
    * @description The current display height.
    */
    get currentDisplayHeight(): number;
    /**
    * @description An observable, that can be subscribed to to get window resizing updates.
    */
    get windowResizeObservable(): Observable<void>;
}
//# sourceMappingURL=display-service.d.ts.map