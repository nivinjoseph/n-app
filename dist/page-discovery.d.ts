import type { PageDetails } from "./component.js";
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
export declare function discoverPageDetails(viewModelModules: Record<string, unknown>, viewModules: Record<string, unknown>): Array<PageDetails>;
//# sourceMappingURL=page-discovery.d.ts.map