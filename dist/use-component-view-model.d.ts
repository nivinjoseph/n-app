import type { ClassDefinition } from "@nivinjoseph/n-util";
import type { ComponentViewModel } from "./component-view-model.js";
export interface UseComponentViewModelResult<T extends ComponentViewModel<any>> {
    readonly vm: T;
}
type PropsArg<TVm> = TVm extends ComponentViewModel<infer P> ? [P] extends [never] ? [] : [props: P] : never;
export declare function useComponentViewModel<T extends ComponentViewModel<any>>(componentViewModelType: ClassDefinition<T>, ...props: PropsArg<T>): UseComponentViewModelResult<T>;
export {};
//# sourceMappingURL=use-component-view-model.d.ts.map