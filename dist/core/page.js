import { given } from "@nivinjoseph/n-defensive";
import { PageRegistration } from "./page-registration.js";
import { PageComponentFactory } from "./page-component-factory.js";
export class Page {
    _segment;
    _parent = null;
    _children = new Array();
    _registration = null;
    get segment() { return this._segment; }
    get parent() { return this._parent; }
    get children() { return this._children.map(t => t); }
    get registration() { return this._registration; }
    constructor(segment, parent) {
        given(segment, "segment").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        this._segment = segment;
        given(parent, "parent").ensureIsType(Page);
        if (parent)
            this.changeParent(parent);
    }
    attachRegistration(registration) {
        given(registration, "registration").ensureHasValue().ensureIsType(PageRegistration);
        given(this, "this").ensure(t => t._registration == null, "already has registration");
        this._registration = registration;
    }
    addChild(childPage) {
        given(childPage, "childPage").ensureHasValue();
        this._children.push(childPage);
    }
    removeChild(childPage) {
        given(childPage, "childPage").ensureHasValue().ensureIsType(Page)
            .ensure(t => this._children.contains(t), "child not present");
        this._children.remove(childPage);
    }
    changeParent(parent) {
        if (this._parent)
            this._parent.removeChild(this);
        this._parent = parent;
        if (this._parent)
            this._parent.addChild(this);
    }
    createVueRouterRoute() {
        // let factory = new PageComponentFactory(container);
        const factory = new PageComponentFactory();
        given(this, "this").ensure(t => t._registration != null, "no registration present");
        const component = factory.create(this.registration);
        const vueRouterRoute = {
            name: this._registration.name,
            path: this._createRoute(),
            component,
            children: []
        };
        if (this._registration.redirect) {
            vueRouterRoute.redirect = (to) => {
                // we can do this because redirect has to be a nested route
                return to.path + this._registration.redirect.replace(this._registration.route.route, "");
            };
        }
        if (this._children.length > 0)
            vueRouterRoute.children = this._children.map(t => t.createVueRouterRoute());
        return vueRouterRoute;
    }
    _createRoute() {
        let route = this._registration.route.vueRoute;
        if (!this._parent)
            return route;
        route = route.replace(this._parent.registration.route.vueRoute, "");
        if (route.startsWith("/"))
            route = route.substr(1);
        return route;
    }
}
//# sourceMappingURL=page.js.map