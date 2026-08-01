import type { PageViewModel } from "./page-view-model.js";
export declare const appRouteSymbol: unique symbol;
export interface AppRouteMetadata {
    readonly route: string;
    readonly redirect: string | undefined;
}
export declare function route(route: string, redirect?: string): <T extends abstract new (...args: Array<any>) => PageViewModel<any>>(target: T, context: ClassDecoratorContext<T>) => void;
//# sourceMappingURL=route.d.ts.map