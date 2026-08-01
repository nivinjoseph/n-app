import { given } from "@nivinjoseph/n-defensive";

export interface StorageService {
    persist(key: string, value: unknown): void;
    persistInSession(key: string, value: unknown): void;
    retrieve(key: string): unknown;
    retrieveFromSession(key: string): unknown;
    remove(key: string): void;
    removeFromSession(key: string): void;
}

export class BrowserStorageService implements StorageService {
    public persist(key: string, value: unknown): void {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();

        if (value == null) {
            // biome-ignore lint/suspicious/noExplicitAny: nivin move
            localStorage.setItem(key, null as any);
            return;
        }

        const storeValue = { item: value };
        localStorage.setItem(key, JSON.stringify(storeValue));
    }

    public persistInSession(key: string, value: unknown): void {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();

        if (value == null) {
            // biome-ignore lint/suspicious/noExplicitAny: nivin move
            sessionStorage.setItem(key, null as any);
            return;
        }

        const storeValue = { item: value };
        sessionStorage.setItem(key, JSON.stringify(storeValue));
    }

    public retrieve(key: string): unknown {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();

        const value = localStorage.getItem(key);
        if (value == null) return null;

        const parsedValue = JSON.parse(value);
        return parsedValue.item;
    }

    public retrieveFromSession(key: string): unknown {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();

        const value = sessionStorage.getItem(key);
        if (value == null) return null;

        const parsedValue = JSON.parse(value);
        return parsedValue.item;
    }

    public remove(key: string): void {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();

        localStorage.removeItem(key);
    }

    public removeFromSession(key: string): void {
        given(key, "key")
            .ensureHasValue()
            .ensure((t) => !t.isEmptyOrWhiteSpace());
        key = key.trim();

        sessionStorage.removeItem(key);
    }
}
