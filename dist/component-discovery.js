import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { ComponentViewModel } from "./component-view-model.js";
/**
 * Extracts ComponentViewModel subclasses from an eager `import.meta.glob`
 * record. The glob call must live in app source (Vite does not expand globs
 * inside prebuilt workspace deps); the app hands the resulting record to
 * `ClientApp.discoverComponents`. Misconfigurations fail here, before
 * container bootstrap, with the offending module path(s) in the message.
 * A class whose name starts with `_` is a deliberate opt-out and is skipped.
 */
export function discoverComponentViewModels(modules) {
    given(modules, "modules").ensureHasValue().ensureIsObject();
    const seen = new Map();
    const discovered = [];
    for (const [path, mod] of Object.entries(modules)) {
        const viewModels = typeof mod === "object" && mod != null
            ? Object.values(mod).filter(isComponentViewModelClass)
            : [];
        if (viewModels.length === 0)
            throw new ApplicationException(`Component discovery: '${path}' matched the component glob but exports no ComponentViewModel subclass.`);
        for (const viewModel of viewModels) {
            if (viewModel.name.startsWith("_"))
                continue;
            if (!viewModel.name.endsWith("ViewModel"))
                throw new ApplicationException(`Component discovery: '${viewModel.name}' in '${path}' violates ViewModel naming convention.`);
            const existing = seen.get(viewModel.name);
            if (existing != null) {
                if (existing.viewModel === viewModel)
                    continue;
                throw new ApplicationException(`Component discovery: view models in '${existing.path}' and '${path}' both resolve to name '${viewModel.name}'; registration is keyed on class.name, so names must be unique per app.`);
            }
            seen.set(viewModel.name, { viewModel, path });
            discovered.push(viewModel);
        }
    }
    return discovered;
}
function isComponentViewModelClass(value) {
    return (typeof value === "function" &&
        value.prototype instanceof ComponentViewModel);
}
//# sourceMappingURL=component-discovery.js.map