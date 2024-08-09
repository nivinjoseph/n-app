import "simplebar/dist/simplebar.css";
import * as SimpleBar from "simplebar";
import { template } from "../../core/template.js";
import { element } from "../../core/element.js";
import { bind } from "../../core/bind.js";
import { ComponentViewModel } from "../../core/component-view-model.js";
import "./n-scroll-container-view.scss";
import { TypeHelper } from "@nivinjoseph/n-util";
import { given } from "@nivinjoseph/n-defensive";
@template(require("./n-scroll-container-view.html"))
@element("n-scroll-container")
@bind({
    "onlyX?": "boolean",
    "onlyY?": "boolean",
    "renderKey?": "number",
    "hugBottom?": "boolean",
    "hugRight?": "boolean"
})
export class NScrollContainerViewModel extends ComponentViewModel {
    _sb = null;
    get _hugBottom() { return !!TypeHelper.parseBoolean(this.getBound("hugBottom")); }
    get _hugRight() { return !!TypeHelper.parseBoolean(this.getBound("hugRight")); }
    get isHorizontalOnly() { return !!TypeHelper.parseBoolean(this.getBound("onlyX")); }
    get isVerticalOnly() { return !!TypeHelper.parseBoolean(this.getBound("onlyY")); }
    get myRenderKey() { return this.getBound("renderKey") ?? 0; }
    onCreate() {
        given(this, "this").ensure(t => !(t.isHorizontalOnly === true && t.isVerticalOnly === true), "only-x and only-y cannot both be true");
        super.onCreate();
    }
    onMount(element) {
        super.onMount(element);
        const SimpleBarCtor = SimpleBar.default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._sb = new SimpleBarCtor(element.querySelector(".simple-scroll-viewer-scroll-container"), { autoHide: true });
        this._calculateScroll();
        this.watch("myRenderKey", (v, ov) => {
            if (v == null || v === ov)
                return;
            this._sb.recalculate();
            setTimeout(() => {
                this._calculateScroll();
            }, 500);
        });
    }
    onDestroy() {
        if (this._sb != null) {
            // this._sb.unMount();
            this._sb = null;
        }
        this.unWatch("myRenderKey");
        super.onDestroy();
    }
    _calculateScroll() {
        if (this._sb == null)
            return;
        if (this._hugBottom) {
            const scrollElement = this._sb.getScrollElement();
            $(scrollElement).animate({ scrollTop: scrollElement.scrollHeight + "px" });
            // this._sb.getScrollElement().scrollTop = this._sb.getScrollElement().scrollHeight;
        }
        if (this._hugRight) {
            const scrollElement = this._sb.getScrollElement();
            $(scrollElement).animate({ scrollLeft: scrollElement.scrollWidth + "px" });
            // this._sb.getScrollElement().scrollLeft = this._sb.getScrollElement().scrollWidth;
        }
    }
}
//# sourceMappingURL=n-scroll-container-view-model.js.map