import { useMemo } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router";
export function useNavigation() {
    const navigate = useNavigate();
    const navParams = useParams();
    const [searchParams] = useSearchParams();
    return useMemo(() => ({
        retrieveRawPathParams: () => toRawParams(navParams),
        retrieveRawQueryParams: () => searchParamsToRaw(searchParams),
        goTo: (path, options) => {
            void navigate(path, options);
        },
        goBack: () => {
            void navigate(-1);
        },
    }), [navigate, navParams, searchParams]);
}
function toRawParams(source) {
    const out = {};
    for (const key of Object.keys(source))
        out[key] = source[key] ?? null;
    return out;
}
function searchParamsToRaw(searchParams) {
    const out = {};
    for (const [key, value] of searchParams.entries())
        out[key] = value;
    return out;
}
//# sourceMappingURL=navigation.js.map