import type { ClassHierarchy } from "@nivinjoseph/n-util";
import type { ReactNode } from "react";
import type { PageViewModel } from "./page-view-model.js";
import { RouteInfo } from "./route-info.js";
import { ComponentRegistration } from "./view-model-registration.js";
type PageViewModelCtor = abstract new (...args: Array<any>) => PageViewModel<any>;
export declare class PageRegistration extends ComponentRegistration {
    private static readonly _registry;
    static find(viewModel: PageViewModelCtor): PageRegistration | null;
    private readonly _view;
    private readonly _route;
    private readonly _redirect;
    get view(): ReactNode;
    get route(): RouteInfo;
    get redirect(): string | null;
    constructor(viewModel: ClassHierarchy<PageViewModel<any>>, view: ReactNode);
}
export {};
//# sourceMappingURL=page-registration.d.ts.map