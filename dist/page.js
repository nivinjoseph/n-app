import { jsx as _jsx } from "react/jsx-runtime";
import { given } from "@nivinjoseph/n-defensive";
import { Navigate } from "react-router";
import { PageRegistration } from "./page-registration.js";
export class Page {
    _segment;
    _parent = null;
    _children = [];
    _registration = null;
    get segment() {
        return this._segment;
    }
    get parent() {
        return this._parent;
    }
    get children() {
        return this._children.map((t) => t);
    }
    get registration() {
        return this._registration;
    }
    constructor(segment, parent) {
        given(segment, "segment")
            .ensureHasValue()
            .ensure((t) => !t.isEmptyOrWhiteSpace());
        this._segment = segment;
        given(parent, "parent").ensureIsType(Page);
        if (parent)
            this.changeParent(parent);
    }
    attachRegistration(registration) {
        given(registration, "registration")
            .ensureHasValue()
            .ensureIsType(PageRegistration);
        given(this, "this").ensure((t) => t._registration == null, "already has registration");
        this._registration = registration;
    }
    addChild(childPage) {
        given(childPage, "childPage").ensureHasValue();
        this._children.push(childPage);
    }
    removeChild(childPage) {
        given(childPage, "childPage")
            .ensureHasValue()
            .ensureIsType(Page)
            .ensure((t) => this._children.contains(t), "child not present");
        this._children.remove(childPage);
    }
    changeParent(parent) {
        if (this._parent)
            this._parent.removeChild(this);
        this._parent = parent;
        if (this._parent)
            this._parent.addChild(this);
    }
    // public createVueRouterRoute(): object {
    //     // let factory = new PageComponentFactory(container);
    //     // let factory = new PageComponentFactory();
    //     given(this, "this").ensure(
    //         (t) => t._registration != null,
    //         "no registration present",
    //     );
    //     const vueRouterRoute: any = {
    //         name: this._registration!.name.replace("ViewModel", ""),
    //         path: this._createRoute(),
    //         // component: factory.create(this._registration)
    //         component: (<any>this._registration!.viewModel).___componentOptions,
    //     };
    //     if (this._registration!.redirect) {
    //         vueRouterRoute.redirect = (to: any): string => {
    //             // we can do this because redirect has to be a nested route
    //             return (
    //                 to.path +
    //                 this._registration!.redirect!.replace(
    //                     this._registration!.route.route,
    //                     "",
    //                 )
    //             );
    //         };
    //     }
    //     if (this._children.length > 0)
    //         vueRouterRoute.children = this._children.map((t) =>
    //             t.createVueRouterRoute(),
    //         );
    //     return vueRouterRoute as object;
    // }
    createReactRouterRoute(defaultErrorElement) {
        given(this, "this").ensure((t) => t._registration != null, "no registration present");
        const reactRouterRoute = {
            // name: this._registration!.name.replace("ViewModel", ""),
            path: this._createRoute(),
            // component: factory.create(this._registration)
            // component: (<any>this._registration!.viewModel).___componentOptions,
            element: this._registration.view,
            errorElement: defaultErrorElement,
        };
        if (this._registration.redirect) {
            if (reactRouterRoute.children == null)
                reactRouterRoute.children = [];
            let redirectValue = this._registration.redirect.replace(this._registration.route.route, "");
            if (redirectValue.startsWith("/"))
                redirectValue = redirectValue.slice(1);
            reactRouterRoute.children.push({
                index: true,
                element: _jsx(Navigate, { to: redirectValue, replace: true }),
            });
        }
        if (this._children.length > 0) {
            if (reactRouterRoute.children == null)
                reactRouterRoute.children = [];
            reactRouterRoute.children.push(...this._children.map((t) => t.createReactRouterRoute(defaultErrorElement)));
        }
        return reactRouterRoute;
    }
    _createRoute() {
        let route = this._registration.route.reactRoute;
        if (!this._parent)
            return route;
        route = route.replace(this._parent.registration.route.reactRoute, "");
        if (route.startsWith("/"))
            route = route.substr(1);
        return route;
    }
}
//# sourceMappingURL=page.js.map