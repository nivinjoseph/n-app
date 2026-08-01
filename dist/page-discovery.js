import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { createElement } from "react";
import { PageViewModel } from "./page-view-model.js";
/**
 * Pairs PageViewModel subclasses from an eager `import.meta.glob` record with
 * their sibling view modules (`<name>-view-model.ts` -> `<name>.tsx`, view
 * export named after the class minus the `ViewModel` suffix — looked up by
 * name, never by function shape, since `observer()` returns a `React.memo`
 * object). The glob calls must live in app source (Vite does not expand globs
 * inside prebuilt workspace deps). Misconfigurations fail here, before
 * container bootstrap, with the offending module path(s) in the message.
 * A class whose name starts with `_` is a deliberate opt-out and is skipped.
 * Validation semantics mirror component-discovery.ts — keep the two in sync.
 */
export function discoverPageDetails(viewModelModules, viewModules) {
    given(viewModelModules, "viewModelModules")
        .ensureHasValue()
        .ensureIsObject();
    given(viewModules, "viewModules").ensureHasValue().ensureIsObject();
    const seen = new Map();
    const discovered = [];
    for (const [path, mod] of Object.entries(viewModelModules)) {
        const viewModels = typeof mod === "object" && mod != null
            ? Object.values(mod).filter(isPageViewModelClass)
            : [];
        if (viewModels.length === 0)
            throw new ApplicationException(`Page discovery: '${path}' matched the page glob but exports no PageViewModel subclass.`);
        for (const viewModel of viewModels) {
            if (viewModel.name.startsWith("_"))
                continue;
            if (!viewModel.name.endsWith("ViewModel"))
                throw new ApplicationException(`Page discovery: '${viewModel.name}' in '${path}' violates ViewModel naming convention.`);
            const existing = seen.get(viewModel.name);
            if (existing != null) {
                if (existing.viewModel === viewModel)
                    continue;
                throw new ApplicationException(`Page discovery: view models in '${existing.path}' and '${path}' both resolve to name '${viewModel.name}'; registration is keyed on class.name, so names must be unique per app.`);
            }
            const view = pairView(viewModel, path, viewModules);
            seen.set(viewModel.name, { viewModel, path });
            discovered.push({ viewModel, view });
        }
    }
    return discovered;
}
function pairView(viewModel, viewModelPath, viewModules) {
    const viewPath = viewModelPath.replace(/-view-model\.ts$/, ".tsx");
    const viewModule = viewModules[viewPath];
    if (typeof viewModule !== "object" || viewModule == null)
        throw new ApplicationException(`Page discovery: no view module '${viewPath}' found for page view model '${viewModel.name}' in '${viewModelPath}' — the page view glob must match the sibling .tsx file.`);
    const exportName = viewModel.name.slice(0, -"ViewModel".length);
    const viewExport = viewModule[exportName];
    if (viewExport == null)
        throw new ApplicationException(`Page discovery: '${viewPath}' does not export '${exportName}' (the page view export must be named after '${viewModel.name}' minus the 'ViewModel' suffix).`);
    return createElement(viewExport);
}
function isPageViewModelClass(value) {
    return (typeof value === "function" && value.prototype instanceof PageViewModel);
}
//# sourceMappingURL=page-discovery.js.map