import { given } from "@nivinjoseph/n-defensive";
import { PageRegistration } from "./page-registration.js";
import type { RouteRecordRaw, RouteRecordRedirect, RouteRecordSingleViewWithChildren } from "vue-router";
import { PageComponentFactory } from "./page-component-factory.js";


export class Page
{
    private readonly _segment: string;
    private _parent: Page | null = null;
    private readonly _children = new Array<Page>();
    private _registration: PageRegistration | null = null;


    public get segment(): string { return this._segment; }
    public get parent(): Page | null { return this._parent; }
    public get children(): ReadonlyArray<Page> { return this._children.map(t => t); }
    public get registration(): PageRegistration | null { return this._registration; }


    public constructor(segment: string, parent: Page | null)
    {
        given(segment, "segment").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._segment = segment;

        given(parent, "parent").ensureIsType(Page);
        if (parent)
            this.changeParent(parent);
    }


    public attachRegistration(registration: PageRegistration): void
    {
        given(registration, "registration").ensureHasValue().ensureIsType(PageRegistration);
        given(this, "this").ensure(t => t._registration == null, "already has registration");
        this._registration = registration;
    }

    public addChild(childPage: Page): void
    {
        given(childPage, "childPage").ensureHasValue();
        this._children.push(childPage);
    }

    public removeChild(childPage: Page): void
    {
        given(childPage, "childPage").ensureHasValue().ensureIsType(Page)
            .ensure(t => this._children.contains(t), "child not present");

        this._children.remove(childPage);
    }

    public changeParent(parent: Page | null): void
    {
        if (this._parent)
            this._parent.removeChild(this);

        this._parent = parent;

        if (this._parent)
            this._parent.addChild(this);
    }

    public createVueRouterRoute(): RouteRecordRaw
    {
        // let factory = new PageComponentFactory(container);
        const factory = new PageComponentFactory();

        given(this, "this").ensure(t => t._registration != null, "no registration present");

        const component = factory.create(this.registration!);
        const vueRouterRoute: RouteRecordRaw = {
            name: this._registration!.name,
            path: this._createRoute(),
            component,
            children: []
        };

        if (this._registration!.redirect)
        {
            (vueRouterRoute as unknown as RouteRecordRedirect).redirect = (to): string =>
            {
                // we can do this because redirect has to be a nested route
                return to.path + this._registration!.redirect!.replace(this._registration!.route.route, "");
            };
        }

        if (this._children.length > 0)
            (vueRouterRoute as unknown as RouteRecordSingleViewWithChildren).children = this._children.map(t => t.createVueRouterRoute());

        return vueRouterRoute;
    }


    private _createRoute(): string
    {
        let route = this._registration!.route.vueRoute;
        if (!this._parent)
            return route;

        route = route.replace(this._parent.registration!.route.vueRoute, "");
        if (route.startsWith("/"))
            route = route.substr(1);

        return route;
    }
}