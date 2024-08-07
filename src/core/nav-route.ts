// public
/**
 * Representation of vue-router Route Object (https://router.vuejs.org/api/interfaces/RouteLocationNormalized.html)
 */
export interface NavRoute
{
    path: string;
    params: Record<string, any>;
    query: Record<string, any>;
    hash: string;
    fullPath: string;
    name?: string | symbol | null;
    redirectedFrom?: NavRoute;
}