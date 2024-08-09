import "simplebar/dist/simplebar.css";
import { ComponentViewModel } from "../../core/component-view-model.js";
import "./n-scroll-container-view.scss";
export declare class NScrollContainerViewModel extends ComponentViewModel {
    private _sb;
    private get _hugBottom();
    private get _hugRight();
    get isHorizontalOnly(): boolean;
    get isVerticalOnly(): boolean;
    get myRenderKey(): number;
    protected onCreate(): void;
    protected onMount(element: HTMLElement): void;
    protected onDestroy(): void;
    private _calculateScroll;
}
//# sourceMappingURL=n-scroll-container-view-model.d.ts.map