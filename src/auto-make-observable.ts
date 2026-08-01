import {
    type AnnotationsMap,
    action,
    computed,
    makeObservable,
    observable,
} from "mobx";

const SKIP_KEYS = new Set<PropertyKey>(["constructor"]);
const REFRESH_WRAPPED = Symbol.for("@nivinjoseph/n-app.refresh-wrapped");

export function autoMakeObservable<T extends object>(target: T): T {
    const annotations: Record<PropertyKey, unknown> = {};

    let proto: object | null = Object.getPrototypeOf(target);
    while (proto !== null && proto !== Object.prototype) {
        for (const key of Reflect.ownKeys(proto)) {
            if (SKIP_KEYS.has(key)) continue;
            if (key in annotations) continue;

            const desc = Object.getOwnPropertyDescriptor(proto, key);
            if (desc === undefined) continue;

            if (desc.get !== undefined) {
                ensureGetterObservesRefresh(proto, key, desc);
                annotations[key] = computed;
            } else if (typeof desc.value === "function")
                annotations[key] = action.bound;
        }
        proto = Object.getPrototypeOf(proto);
    }

    for (const key of Reflect.ownKeys(target)) {
        if (key in annotations) continue;
        annotations[key] = observable;
    }

    proto = Object.getPrototypeOf(target);
    while (proto !== null && proto !== Object.prototype) {
        // biome-ignore lint/suspicious/noExplicitAny: framework helper reads opt-in static
        const Ctor = (proto as { constructor?: any }).constructor;
        if (Ctor !== undefined && Object.hasOwn(Ctor, "$mobxOverrides")) {
            const overrides = Ctor.$mobxOverrides as Record<string, unknown>;
            for (const k of Object.keys(overrides)) {
                const v = overrides[k];
                if (v === false) delete annotations[k];
                else annotations[k] = v;
            }
        }
        proto = Object.getPrototypeOf(proto);
    }

    return makeObservable(target, annotations as AnnotationsMap<T, never>);
}

function ensureGetterObservesRefresh(
    proto: object,
    key: PropertyKey,
    desc: PropertyDescriptor,
): void {
    const originalGet = desc.get;
    if (originalGet === undefined) return;

    const marker = originalGet as { [REFRESH_WRAPPED]?: boolean };
    if (marker[REFRESH_WRAPPED] === true) return;

    // biome-ignore lint/nursery/useExplicitReturnType: framework
    const wrappedGet = function (this: { _$observeRefresh?(): void }) {
        this._$observeRefresh?.();
        return originalGet.call(this);
    };
    (wrappedGet as { [REFRESH_WRAPPED]?: boolean })[REFRESH_WRAPPED] = true;

    Object.defineProperty(proto, key, {
        ...desc,
        get: wrappedGet,
    });
}
