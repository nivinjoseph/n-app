import { template } from "../../core/template";
import { element } from "../../core/element";
import { bind } from "../../core/bind";
import { ComponentViewModel } from "../../core/component-view-model";
import { TypeHelper } from "@nivinjoseph/n-util";
import "./n-expanding-container-view.scss";


@template(require("./n-expanding-container-view.html"))
@element("n-expanding-container")
@bind("constrainX", "renderKey")
export class NExpandingContainerViewModel extends ComponentViewModel
{
    public get _constrainHorizontal(): boolean { return !!TypeHelper.parseBoolean(this.getBound("constrainX")); }
    
    public get myRenderKey(): any { return this.getBound("renderKey"); }
    
    
    protected override onMount(element: HTMLElement): void
    {
        super.onMount(element);

        this.recalculate(element);
        
        this.watch("myRenderKey", (v, ov) =>
        {
            if (v == null || v === ov)
                return;

            this.recalculate(element);
        });
    }
    
    protected override onDestroy(): void
    {
        this.unWatch("myRenderKey");
        
        super.onDestroy();
    }
    
    private recalculate(element: HTMLElement): void
    {
        if (this._constrainHorizontal)
            this.doHorizontal(element);

        this.doVertical(element);
    }
    
    private doHorizontal(element: HTMLElement): void
    {        
        let constrainedWidth = 0;

        $(element).siblings().each(function ()
        {
            const width = $(this).outerWidth(true) ?? 0;
            constrainedWidth += width;
        });

        $(element).width(`calc(100% - ${constrainedWidth}px)`);
    }

    private doVertical(element: HTMLElement): void
    {
        let constrainedHeight = 0;

        $(element).siblings().each(function ()
        {
            const height = $(this).outerHeight(true) ?? 0;
            constrainedHeight += height;
        });

        $(element).height(`calc(100% - ${constrainedHeight}px)`);
    }
}