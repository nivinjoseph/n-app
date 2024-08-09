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
export class NExpandingContainerViewModel extends ComponentViewModel {
    get _constrainHorizontal() { return !!TypeHelper.parseBoolean(this.getBound("constrainX")); }
    get myRenderKey() { return this.getBound("renderKey") ?? 0; }
    onMount(element) {
        super.onMount(element);
        this._recalculate(element);
        this.watch("myRenderKey", (v, ov) => {
            if (v == null || v === ov)
                return;
            this._recalculate(element);
        });
    }
    onDestroy() {
        this.unWatch("myRenderKey");
        super.onDestroy();
    }
    _recalculate(element) {
        if (this._constrainHorizontal)
            this._doHorizontal(element);
        this._doVertical(element);
    }
    _doHorizontal(element) {
        let constrainedWidth = 0;
        $(element).siblings().each(function () {
            const width = $(this).outerWidth(true) ?? 0;
            constrainedWidth += width;
        });
        $(element).width(`calc(100% - ${constrainedWidth}px)`);
    }
    _doVertical(element) {
        let constrainedHeight = 0;
        $(element).siblings().each(function () {
            const height = $(this).outerHeight(true) ?? 0;
            constrainedHeight += height;
        });
        $(element).height(`calc(100% - ${constrainedHeight}px)`);
    }
}
//# sourceMappingURL=n-expanding-container-view-model.js.map