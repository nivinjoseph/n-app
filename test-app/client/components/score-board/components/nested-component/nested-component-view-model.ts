import "./nested-component-view.scss";
import { ComponentViewModel, template, element, bind } from "../../../../../../src/index.js";


@template(require("./nested-component-view.html"))
@element("nested-component")
@bind({
    name: "string"
})
export class NestedComponentViewModel extends ComponentViewModel
{
    public get nameValue(): string { return this.getBound("name"); }
}
