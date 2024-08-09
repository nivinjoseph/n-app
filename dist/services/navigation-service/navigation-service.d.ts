/**
 * @description Used to navigate between different pages of the app or to redirect to an external one.
 */
export interface NavigationService {
    /**
     * The current route path.
     */
    readonly currentRoutePath: string;
    /**
     * The current route path including query string.
     */
    readonly currentRouteFullPath: string;
    /**
     * The current route hash.
     */
    readonly currentRouteHash: string | null;
    /**
     * @description Navigates to a specific route sending in any params with it.
     *
     * @example
     * ```ts
     * navigate("/foo", { key: value });
     * ```
     * If a parameter has been passed, then the resulting link will have a query param. `/foo?key=value`.
     *
     * @param route - The specific route.
     * @param params - The value which is sent to another page.
     * @param replaceHistory - Optional: Used to replace history.
     */
    navigate(route: string, params?: object | null, replaceHistory?: boolean): void;
    /**
     * @description Navigates to the previous page.
     */
    navigateBack(): void;
    /**
     * @description Navigates forward a page.
     */
    navigateForward(): void;
    /**
     *
     * @description Navigates to a url within the same tab.
     *
     * @param url - The url to navigate to.
     * @param replaceHistory - Optional: Used to replace history.
     */
    navigateSiteSameTab(url: string, replaceHistory?: boolean): void;
    /**
     * @description Navigates to a url within a new tab.
     *
     * @param url - The url to navigate to.
     */
    navigateSiteNewTab(url: string): void;
    /**
     * @description Navigate to a url using a POST within the same tab.
     *
     * @param url - The url to navigate to.
     * @param value - The value being POST to the url.
     */
    navigateSitePostSameTab(url: string, value: object): void;
    /**
     * @description Navigate to a url using a POST within a new tab.
     *
     * @param url - The url to navigate to.
     * @param value - The value being POST to the url.
     */
    navigateSitePostNewTab(url: string, value: object): void;
    /**
     * @description Gets the site query parameter.
     *
     * Suppose you have a link: `test.com/?id=foo`. Calling
     * ```ts
     * getSiteQueryParam("id");
     * ```
     * will return "foo".
     *
     * @param key - What query parameter key to look for.
     * @returns The value of the query parameter.
     */
    getSiteQueryParam(key: string): string;
}
//# sourceMappingURL=navigation-service.d.ts.map