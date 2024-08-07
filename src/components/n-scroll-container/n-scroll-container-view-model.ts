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
export class NScrollContainerViewModel extends ComponentViewModel
{
    private _sb: SimpleBar | null = null;

    private get _hugBottom(): boolean { return !!TypeHelper.parseBoolean(this.getBound("hugBottom")); }
    private get _hugRight(): boolean { return !!TypeHelper.parseBoolean(this.getBound("hugRight")); }

    public get isHorizontalOnly(): boolean { return !!TypeHelper.parseBoolean(this.getBound("onlyX")); }
    public get isVerticalOnly(): boolean { return !!TypeHelper.parseBoolean(this.getBound("onlyY")); }
    public get myRenderKey(): number { return this.getBound<number | null>("renderKey") ?? 0; }


    protected override onCreate(): void
    {
        given(this, "this").ensure(t => !(t.isHorizontalOnly === true && t.isVerticalOnly === true),
            "only-x and only-y cannot both be true");

        super.onCreate();
    }

    protected override onMount(element: HTMLElement): void
    {
        super.onMount(element);

        const SimpleBarCtor = (<any>SimpleBar).default;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        this._sb = new SimpleBarCtor(element.querySelector(".simple-scroll-viewer-scroll-container"), { autoHide: true });

        this._calculateScroll();

        this.watch("myRenderKey", (v, ov) =>
        {
            if (v == null || v === ov)
                return;

            this._sb!.recalculate();
            setTimeout(() =>
            {
                this._calculateScroll();
            }, 500);
        });
    }

    protected override onDestroy(): void
    {
        if (this._sb != null)
        {
            // this._sb.unMount();
            this._sb = null;
        }

        this.unWatch("myRenderKey");

        super.onDestroy();
    }

    private _calculateScroll(): void
    {
        if (this._sb == null)
            return;

        if (this._hugBottom)
        {
            const scrollElement = this._sb.getScrollElement();
            $(scrollElement).animate({ scrollTop: scrollElement.scrollHeight + "px" });

            // this._sb.getScrollElement().scrollTop = this._sb.getScrollElement().scrollHeight;
        }
        if (this._hugRight)
        {
            const scrollElement = this._sb.getScrollElement();
            $(scrollElement).animate({ scrollLeft: scrollElement.scrollWidth + "px" });

            // this._sb.getScrollElement().scrollLeft = this._sb.getScrollElement().scrollWidth;
        }
    }
}