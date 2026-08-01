import type { ServiceLocator } from "@nivinjoseph/n-ject";
export type RootScope = ServiceLocator & {
    readonly __brand: "root";
};
export declare const RootContext: import("react").Context<RootScope | null>;
export declare function useRootContext(): RootScope;
//# sourceMappingURL=root-context.d.ts.map