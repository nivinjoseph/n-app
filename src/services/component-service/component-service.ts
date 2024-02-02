import type { ComponentOptions } from "./component-options.js";

// public
export interface ComponentService
{
    compile(componentViewModelClass: Function, cache?: boolean): ComponentOptions;
}