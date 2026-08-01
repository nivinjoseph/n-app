import type { ClassHierarchy } from "@nivinjoseph/n-util";
import { ComponentViewModel } from "./component-view-model.js";
export type ComponentViewModelClass = ClassHierarchy<ComponentViewModel<any>> & {
    name: string;
};
/**
 * Extracts ComponentViewModel subclasses from an eager `import.meta.glob`
 * record. The glob call must live in app source (Vite does not expand globs
 * inside prebuilt workspace deps); the app hands the resulting record to
 * `ClientApp.discoverComponents`. Misconfigurations fail here, before
 * container bootstrap, with the offending module path(s) in the message.
 * A class whose name starts with `_` is a deliberate opt-out and is skipped.
 */
export declare function discoverComponentViewModels(modules: Record<string, unknown>): Array<ComponentViewModelClass>;
//# sourceMappingURL=component-discovery.d.ts.map