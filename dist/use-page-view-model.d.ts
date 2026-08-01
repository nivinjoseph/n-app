import type { ClassDefinition } from "@nivinjoseph/n-util";
import type { PageScope } from "./page-context.js";
import type { PageViewModel } from "./page-view-model.js";
export interface UsePageViewModelResult<T extends PageViewModel<any>> {
    readonly vm: T;
    readonly ctx: PageScope;
}
export declare function usePageViewModel<T extends PageViewModel<any>>(pageViewModelType: ClassDefinition<T>): UsePageViewModelResult<T>;
//# sourceMappingURL=use-page-view-model.d.ts.map