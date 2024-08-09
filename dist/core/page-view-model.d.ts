import { BaseViewModel } from "./base-view-model.js";
import "@nivinjoseph/n-ext";
import type { ClassDefinition } from "@nivinjoseph/n-util";
export declare class PageViewModel extends BaseViewModel {
    protected get currentRoute(): string;
    protected get pathArgs(): Object | null;
    protected get queryArgs(): Object | null;
    protected onEnter(...params: Array<any>): void;
    protected onLeave(): void;
}
export type PageViewModelClass<This extends PageViewModel> = ClassDefinition<This>;
//# sourceMappingURL=page-view-model.d.ts.map