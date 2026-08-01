import type { ClassHierarchy } from "@nivinjoseph/n-util";
import type { ReactNode } from "react";
import type { ComponentViewModel } from "./component-view-model.js";
import type { PageViewModel } from "./page-view-model.js";
export type ComponentDetails = {
    viewModel: ClassHierarchy<ComponentViewModel<any>>;
};
export type PageDetails = {
    view: ReactNode;
    viewModel: ClassHierarchy<PageViewModel<any>>;
};
//# sourceMappingURL=component.d.ts.map