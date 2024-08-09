import type { StorageService } from "./storage-service.js";
export declare class DefaultStorageService implements StorageService {
    persist(key: string, value: unknown): void;
    persistInSession(key: string, value: unknown): void;
    retrieve(key: string): unknown;
    retrieveFromSession(key: string): unknown;
    remove(key: string): void;
    removeFromSession(key: string): void;
}
//# sourceMappingURL=default-storage-service.d.ts.map