import { given } from "@nivinjoseph/n-defensive";
export class DefaultStorageService {
    persist(key, value) {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();
        if (value == null) {
            localStorage.setItem(key, null);
            return;
        }
        const storeValue = { item: value };
        localStorage.setItem(key, JSON.stringify(storeValue));
    }
    persistInSession(key, value) {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();
        if (value == null) {
            sessionStorage.setItem(key, null);
            return;
        }
        const storeValue = { item: value };
        sessionStorage.setItem(key, JSON.stringify(storeValue));
    }
    retrieve(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();
        const value = localStorage.getItem(key);
        if (value == null)
            return null;
        const parsedValue = JSON.parse(value);
        return parsedValue.item;
    }
    retrieveFromSession(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();
        const value = sessionStorage.getItem(key);
        if (value == null)
            return null;
        const parsedValue = JSON.parse(value);
        return parsedValue.item;
    }
    remove(key) {
        given(key, "key").ensureHasValue().ensureIsString();
        key = key.trim();
        localStorage.removeItem(key);
    }
    removeFromSession(key) {
        given(key, "key").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        key = key.trim();
        sessionStorage.removeItem(key);
    }
}
//# sourceMappingURL=default-storage-service.js.map