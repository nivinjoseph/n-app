export interface NavigationService 
{
    /**
     * The current route path.
     */
    currentRoutePath: string;
    /**
     * The current route hash.
     */
    currentRouteHash: string;
    
    /**
     * 
     * Navigates to a specific route sending in any params with it.
     * 
     * @param route - The specific route.
     * @param params - The value which is sent to another page.
     * @param replaceHistory - Optional: Used to replace history.
     */
    navigate(route: string, params?: object | null, replaceHistory?: boolean): void;
    /**
     * Navigates back a page.
     */
    navigateBack(): void;
    /**
     * Navigates forward a page.
     */
    navigateForward(): void;
    
    /**
     * 
     * Navigates to a url within the same tab.
     * 
     * @param url - The url to navigate to.
     * @param replaceHistory - Optional: Used to replace history.
     */
    navigateSiteSameTab(url: string, replaceHistory?: boolean): void;
    /**
     * 
     * Navigates to a url within a new tab.
     * 
     * @param url - The url to navigate to.
     */
    navigateSiteNewTab(url: string): void;
    /**
     * 
     * Navigate to a url using a POST within the same tab.
     * 
     * @param url - The url to navigate to.
     * @param value - The value being POST to the url.
     */
    navigateSitePostSameTab(url: string, value: object): void;
    /**
     * 
     * Navigate to a url using a POST within a new tab.
     * 
     * @param url - The url to navigate to.
     * @param value - The value being POST to the url.
     */
    navigateSitePostNewTab(url: string, value: object): void;
    /**
     * 
     * Returns the site query parameters.
     * 
     * @param key - FIXME: What is this param?
     */
    getSiteQueryParam(key: string): string;
}