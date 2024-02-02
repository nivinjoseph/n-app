import type { NavigationService } from "./navigation-service.js";
import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import { Utils } from "../../core/utils.js";
import type { Router } from "vue-router";


export class DefaultNavigationService implements NavigationService
{
    private readonly _vueRouter: Router;


    public get currentRoutePath(): string { return this._vueRouter.currentRoute.value.path; }
    public get currentRouteFullPath(): string { return this._vueRouter.currentRoute.value.fullPath; }
    public get currentRouteHash(): string | null { return this._getHash(); }


    public constructor(vueRouter: Router)
    {
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


    public navigate(route: string, params?: object | null, replaceHistory?: boolean): void
    {
        const url = Utils.generateUrl(route, params ?? undefined);
        if (replaceHistory)
            this._vueRouter.replace(url).catch(e => console.error(e));
        else
            this._vueRouter.push(url).catch(e => console.error(e));
    }

    public navigateBack(): void
    {
        this._vueRouter.back();
    }

    public navigateForward(): void
    {
        this._vueRouter.forward();
    }


    public navigateSiteSameTab(url: string, replaceHistory?: boolean): void
    {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();

        if (replaceHistory)
            window.location.replace(url);
        else
            window.location.href = url;
    }

    public navigateSiteNewTab(url: string): void
    {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();

        window.open(url);
    }

    public navigateSitePostSameTab(url: string, value: object): void
    {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();

        const form = this._createForm(url, value);
        form.submit();
    }

    public navigateSitePostNewTab(url: string, value: object): void
    {
        given(url, "url").ensureHasValue().ensureIsString();
        url = url.trim();

        const form = this._createForm(url, value);
        const view = "view" + "_" + Math.floor((Math.random() * 9999999) + 1);
        form.setAttribute("target", view); // to open in a new Tab
        window.open("", view); // to open in new tab
        form.submit();
    }

    public getSiteQueryParam(key: string): string
    {
        given(key, "key").ensureHasValue().ensureIsString();

        // eslint-disable-next-line no-useless-escape
        key = key.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
        const regex = new RegExp("[\\?&]" + key + "=([^&#]*)");
        const results = regex.exec(location.search);
        return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
    }


    private _createForm(url: string, value?: Record<string, any>): HTMLFormElement
    {
        const form = document.createElement("form");
        form.setAttribute("method", "post");
        form.setAttribute("action", url);

        if (value != null)
        {
            for (const key in value)
            {
                if (Object.prototype.hasOwnProperty.call(value, key) && typeof value[key] !== "function")
                {
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

    private _getHash(): string | null
    {
        let hash = this._vueRouter.currentRoute.value.hash;
        if (!hash || hash.isEmptyOrWhiteSpace())
            return null;

        hash = hash.trim();
        if (hash.startsWith("#"))
            hash = hash.substr(1);

        return hash.isEmptyOrWhiteSpace() ? null : hash;
    }
}