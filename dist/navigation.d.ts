export type RawParams = Readonly<Record<string, string | null>>;
export interface NavigationService {
    retrieveRawPathParams(): RawParams;
    retrieveRawQueryParams(): RawParams;
    goTo(path: string, options?: {
        replace?: boolean;
    }): void;
    goBack(): void;
}
export declare function useNavigation(): NavigationService;
//# sourceMappingURL=navigation.d.ts.map