import { Page } from "./page.js";
import { PageRegistration } from "./page-registration.js";
export declare class PageTreeBuilder {
    private readonly _root;
    private readonly _registrations;
    constructor(root: Page, pageRegistrations: ReadonlyArray<PageRegistration>);
    build(): ReadonlyArray<Page>;
    private _buildTree;
    private _shakeTree;
}
//# sourceMappingURL=page-tree-builder.d.ts.map