import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";

export type RawParams = Readonly<Record<string, string | null>>;

export interface NavigationService {
    retrieveRawPathParams(): RawParams;
    retrieveRawQueryParams(): RawParams;
    goTo(path: string, options?: { replace?: boolean }): void;
    goBack(): void;
}

export function useNavigation(): NavigationService {
    const navigate = useNavigate();
    const navParams = useParams();
    const [searchParams] = useSearchParams();

    return useMemo<NavigationService>(
        () => ({
            retrieveRawPathParams: () => toRawParams(navParams),
            retrieveRawQueryParams: () => searchParamsToRaw(searchParams),
            goTo: (path, options) => {
                void navigate(path, options);
            },
            goBack: () => {
                void navigate(-1);
            },
        }),
        [navigate, navParams, searchParams],
    );
}

function toRawParams(
    source: Readonly<Record<string, string | undefined>>,
): RawParams {
    const out: Record<string, string | null> = {};
    for (const key of Object.keys(source)) out[key] = source[key] ?? null;
    return out;
}

function searchParamsToRaw(searchParams: URLSearchParams): RawParams {
    const out: Record<string, string | null> = {};
    for (const [key, value] of searchParams.entries()) out[key] = value;
    return out;
}
