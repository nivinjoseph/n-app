import { element, bind, ComponentViewModel, template } from "./../../../../src/index";
import "./binding-test-view.scss";


@template(require("./binding-test-view.html"))
@element("binding-test")
@bind("value")   
export default class BindingTestViewModel extends ComponentViewModel
{
    public get fooVal(): string { return this.getBoundModel(); }
    public set fooVal(value: string) { this.setBoundModel(value); }
}