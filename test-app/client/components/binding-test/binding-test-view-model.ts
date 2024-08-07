import { element, bind, ComponentViewModel, template } from "./../../../../src/index.js";
import "./binding-test-view.scss";


@template(require("./binding-test-view.html"))
@element("binding-test")
@bind({
    "model": "string",
    "anyVal": "any"
})
export class BindingTestViewModel extends ComponentViewModel
{
    public get fooVal(): string { return this.getBoundModel(); }
    public set fooVal(value: string) { this.setBoundModel(value); }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    public get anyValue(): any { return this.getBound("anyVal"); }


    protected override onCreate(): void
    {
        console.log("binding test on create");

        super.onCreate();
        console.log(this.ctx);
    }
}