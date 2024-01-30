import { template } from "../../core/template.js";
import { element } from "../../core/element.js";
import { bind } from "../../core/bind.js";
import { ComponentViewModel } from "../../core/component-view-model.js";
import { TypeHelper } from "@nivinjoseph/n-util";
import "./n-expanding-container-view.scss";


@template(require("./n-expanding-container-view.html"))
@element("n-expanding-container")
@bind({
    "constrainX?": "boolean",
    "renderKey?": "number"
})
export class NExpandingContainerViewModel extends ComponentViewModel
{
    public get _constrainHorizontal(): boolean { return !!TypeHelper.parseBoolean(this.getBound("constrainX")); }

    public get myRenderKey(): number { return this.getBound<number | null>("renderKey") ?? 0; }


    protected override onMount(element: HTMLElement): void
    {
        super.onMount(element);

        this._recalculate(element);

        this.watch("myRenderKey", (v, ov) =>
        {
            if (v == null || v === ov)
                return;

            this._recalculate(element);
        });
    }

    protected override onDestroy(): void
    {
        this.unWatch("myRenderKey");

        super.onDestroy();
    }

    private _recalculate(element: HTMLElement): void
    {
        if (this._constrainHorizontal)
            this._doHorizontal(element);

        this._doVertical(element);
    }

    private _doHorizontal(element: HTMLElement): void
    {
        let constrainedWidth = 0;

        $(element).siblings().each(function (this: HTMLElement)
        {
            const width = $(this).outerWidth(true) ?? 0;
            constrainedWidth += width;
        });

        $(element).width(`calc(100% - ${constrainedWidth}px)`);
    }

    private _doVertical(element: HTMLElement): void
    {
        let constrainedHeight = 0;

        $(element).siblings().each(function (this: HTMLElement)
        {
            const height = $(this).outerHeight(true) ?? 0;
            constrainedHeight += height;
        });

        $(element).height(`calc(100% - ${constrainedHeight}px)`);
    }
}