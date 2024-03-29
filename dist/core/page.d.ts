import { PageRegistration } from "./page-registration";
export declare class Page {
    private readonly _segment;
    private _parent;
    private readonly _children;
    private _registration;
    get segment(): string;
    get parent(): Page | null;
    get children(): ReadonlyArray<Page>;
    get registration(): PageRegistration | null;
    constructor(segment: string, parent: Page | null);
    attachRegistration(registration: PageRegistration): void;
    addChild(childPage: Page): void;
    removeChild(childPage: Page): void;
    changeParent(parent: Page | null): void;
    createVueRouterRoute(): object;
    private _createRoute;
}
