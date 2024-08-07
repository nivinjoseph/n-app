import { given } from "@nivinjoseph/n-defensive";
import { bind, ComponentViewModel, element, template } from "../../../../../../src/index.js";
import "./non-reorderable-list-view.scss";

// type OnReorderCallback = (fromIndex: number, toIndex: number) => void;

@element("non-reorderable-list")
@template(require("./non-reorderable-list-view.html"))
@bind({
    "listItems": ["object"]
})
export class NonReorderableListViewModel extends ComponentViewModel
{
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    public get items(): Array<any> { return this.getBound<Array<any>>("listItems"); }


    protected override onCreate(): void
    {
        super.onCreate();

        given(this.items, "items").ensureHasValue().ensureIsArray();
    }

    protected override onMount(element: HTMLElement): void
    {
        super.onMount(element);
    }
}