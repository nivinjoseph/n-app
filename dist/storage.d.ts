export interface StorageService {
    persist(key: string, value: unknown): void;
    persistInSession(key: string, value: unknown): void;
    retrieve(key: string): unknown;
    retrieveFromSession(key: string): unknown;
    remove(key: string): void;
    removeFromSession(key: string): void;
}
export declare class BrowserStorageService implements StorageService {
    persist(key: string, value: unknown): void;
    persistInSession(key: string, value: unknown): void;
    retrieve(key: string): unknown;
    retrieveFromSession(key: string): unknown;
    remove(key: string): void;
    removeFromSession(key: string): void;
}
//# sourceMappingURL=storage.d.ts.map