import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import { metaSymbol } from "./meta.js";
import { RouteInfo } from "./route-info.js";
import { appRouteSymbol } from "./route.js";
import { titleSymbol } from "./title.js";
import { ViewModelRegistration } from "./view-model-registration.js";
import { pagesSymbol } from "./pages.js";
import { resolveSymbol } from "./resolve.js";
import { ComponentRegistration } from "./component-registration.js";
import { componentsSymbol } from "./components.js";
export class PageRegistration extends ViewModelRegistration {
    _route;
    _redirect;
    _title;
    _metadata;
    _resolvers = null;
    _pages = null;
    _localComponentRegistrations = new Array();
    _resolvedValues = null;
    get route() { return this._route; }
    get redirect() { return this._redirect; }
    get title() { return this._title; }
    get metadata() { return this._metadata; }
    get resolvers() { return this._resolvers; }
    get pages() { return this._pages; }
    get localComponentRegistrations() { return this._localComponentRegistrations; }
    get resolvedValues() { return this._resolvedValues; }
    set resolvedValues(value) { this._resolvedValues = value; }
    constructor(page, defaultPageTitle, defaultPageMetas) {
        given(page, "page").ensureHasValue().ensureIsFunction();
        given(defaultPageTitle, "defaultPageTitle").ensureIsString();
        given(defaultPageMetas, "defaultPageMetas").ensureIsArray();
        super(page);
        const metadata = page[Symbol.metadata];
        const routeData = metadata[appRouteSymbol];
        if (routeData == null)
            throw new ApplicationException(`PageViewModel '${this.name}' does not have @route applied.`);
        this._route = new RouteInfo(routeData.route);
        this._redirect = routeData.redirect ?? null;
        let title = metadata[titleSymbol];
        if (title == null)
            title = defaultPageTitle ?? undefined;
        this._title = title ?? null;
        const allMeta = defaultPageMetas ? [...defaultPageMetas] : [];
        const metas = metadata[metaSymbol];
        if (metas != null)
            allMeta.push(...metas);
        this._metadata = allMeta;
        const resolvers = metadata[resolveSymbol];
        if (resolvers != null)
            this._resolvers = resolvers;
        const pages = metadata[pagesSymbol];
        if (pages != null)
            this._pages = pages;
        const components = metadata[componentsSymbol];
        if (components != null && components.isNotEmpty) {
            components.forEach(component => {
                const registration = new ComponentRegistration(component);
                if (this._localComponentRegistrations.some(t => t.name === registration.name))
                    throw new ApplicationException(`Duplicate Local Component registration with name '${registration.name}' for Page '${this.name}'.`);
                if (this._localComponentRegistrations.some(t => t.element === registration.element))
                    throw new ApplicationException(`Duplicate Local Component registration with element '${registration.element}' for Page '${this.name}'`);
                this._localComponentRegistrations.push(registration);
            });
        }
    }
}
//# sourceMappingURL=page-registration.js.map