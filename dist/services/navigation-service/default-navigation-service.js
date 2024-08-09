import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { Utils } from "../../core/utils.js";
export class DefaultNavigationService {
    _vueRouter;
    get currentRoutePath() { return this._vueRouter.currentRoute.value.path; }
    get currentRouteFullPath() { return this._vueRouter.currentRoute.value.fullPath; }
    get currentRouteHash() { return this._getHash(); }
    constructor(vueRouter) {
        given(vueRouter, "vueRouter").ensureHasValue().ensureIsObject();
        this._vueRouter = vueRouter;
        // // the code below is a hack to deal with following error
        // // Error: Navigation cancelled from "/runtime/dashboard" to "/runtime/appType/apd_cafdb74cf103485db2a6a2bcfd65ee8d" with a new navigation.
        // // Solve an error
        // const originalPush = this._vueRouter.push;
        // const originalReplace = this._vueRouter.replace;
        // // push
        // this._vueRouter.push = function push(location: any, onResolve: any, onReject: any)
        // {
        //     if (onResolve || onReject) return originalPush.call(this, location, onResolve, onReject);
        //     return originalPush.call(this, location).catch((err: any) =>
        //     {
        //         console.log(err);
        //         vueRouter.push(location);
        //     });
        // };
        // // replace
        // this._vueRouter.replace = function push(location: any, onResolve: any, onReject: any)
        // {
        //     if (onResolve || onReject) return originalReplace.call(this, location, onResolve, onReject);
        //     return originalReplace.call(this, location).catch((err: any) =>
        //     {
        //         console.log(err);
        //         vueRouter.replace(location);
        //     });
        // };
    }
    navigate(route, params, replaceHistory) {
        const url = Utils.generateUrl(route, params ?? undefined);
        if (replaceHistory)
            this._vueRouter.replace(url).catch(e => console.error(e));
        else
            this._vueRouter.push(url).catch(e => console.error(e));
    }
    navigateBack() {
        this._vueRouter.back();
    }
    navigateForward() {
        this._vueRouter.forward();
    }
    navigateSiteSameTab(url, replaceHistory) {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();
        if (replaceHistory)
            window.location.replace(url);
        else
            window.location.href = url;
    }
    navigateSiteNewTab(url) {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();
        window.open(url);
    }
    navigateSitePostSameTab(url, value) {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();
        const form = this._createForm(url, value);
        form.submit();
    }
    navigateSitePostNewTab(url, value) {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();
        const form = this._createForm(url, value);
        const view = "view" + "_" + Math.floor((Math.random() * 9999999) + 1);
        form.setAttribute("target", view); // to open in a new Tab
        window.open("", view); // to open in new tab
        form.submit();
    }
    getSiteQueryParam(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        // eslint-disable-next-line no-useless-escape
        key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        const results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }
    _createForm(url, value) {
        const form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", url);
        if (value != null) {
            for (const key in value) {
                if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] !== "function") {
                    const val = value[key];
                    const hiddenField = document.createElement("input");
                    hiddenField.setAttribute("type", "hidden");
                    hiddenField.setAttribute("name", key);
                    hiddenField.setAttribute("value", val);
                    form.appendChild(hiddenField);
                }
            }
        }
        document.body.appendChild(form);
        return form;
    }
    _getHash() {
        let hash = this._vueRouter.currentRoute.value.hash;
        if (!hash || hash.isEmptyOrWhiteSpace())
            return null;
        hash = hash.trim();
        if (hash.startsWith("#"))
            hash = hash.substr(1);
        return hash.isEmptyOrWhiteSpace() ? null : hash;
    }
}
//# sourceMappingURL=default-navigation-service.js.map