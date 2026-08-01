import type { ClassHierarchy } from "@nivinjoseph/n-util";
import type { ReactNode } from "react";
import type { ComponentViewModel } from "./component-view-model.js";
import type { PageViewModel } from "./page-view-model.js";

export type ComponentDetails = {
    // biome-ignore lint/suspicious/noExplicitAny: variance-free base for registration
    viewModel: ClassHierarchy<ComponentViewModel<any>>;
};

export type PageDetails = {
    view: ReactNode;
    // biome-ignore lint/suspicious/noExplicitAny: variance-free base for registration
    viewModel: ClassHierarchy<PageViewModel<any>>;
};
