import type { Validator } from "@nivinjoseph/n-validate";
import { computed, observable, runInAction } from "mobx";

const PATCHED = Symbol.for("@nivinjoseph/n-app.validator-observable");

interface ValidatorRuntime<T> {
    isEnabled: boolean;
    enable(): void;
    disable(): void;
    validate(value: T): void;
    [PATCHED]?: boolean;
}

/**
 * Makes an n-validate `Validator` reactive: its `errors` / `isValid` / `hasErrors`
 * can be read directly in an observer view (or a VM computed) and recompute
 * whenever `target`'s observable fields change — no forceRefresh / onObservableChanged
 * needed in the view model.
 *
 * The result getters are redefined on the instance to read a MobX computed that
 * re-runs `validate(target)`; doing so reads `target`'s observable fields, which
 * registers them as the computed's dependencies. `validate()` mutates only the
 * validator's own (non-observable) fields, so this is "pure" from MobX's view.
 * `enable()`/`disable()` flip an observable box so the result also recomputes when
 * no field changed (e.g. enabling validation on submit).
 */
export function makeValidatorObservable<T extends object>(
    validator: Validator<T>,
    target: T,
): Validator<T> {
    const runtime = validator as unknown as ValidatorRuntime<T>;
    if (runtime[PATCHED] === true) return validator;
    runtime[PATCHED] = true;

    const proto = Object.getPrototypeOf(validator) as object;
    const realErrors = Object.getOwnPropertyDescriptor(proto, "errors")?.get;
    const realIsValid = Object.getOwnPropertyDescriptor(proto, "isValid")?.get;
    if (realErrors == null || realIsValid == null)
        throw new Error(
            "makeValidatorObservable: unexpected Validator shape (missing errors/isValid getters).",
        );

    const enabled = observable.box(runtime.isEnabled);

    const result = computed(() => {
        enabled.get();
        runtime.validate(target);
        return {
            errors: {
                ...(realErrors.call(validator) as Record<string, unknown>),
            },
            isValid: realIsValid.call(validator) as boolean,
        };
    });

    Object.defineProperty(validator, "errors", {
        configurable: true,
        get: () => result.get().errors,
    });
    Object.defineProperty(validator, "isValid", {
        configurable: true,
        get: () => result.get().isValid,
    });
    Object.defineProperty(validator, "hasErrors", {
        configurable: true,
        get: () => !result.get().isValid,
    });

    const originalEnable = runtime.enable.bind(runtime);
    const originalDisable = runtime.disable.bind(runtime);
    runtime.enable = (): void => {
        originalEnable();
        runInAction(() => enabled.set(true));
    };
    runtime.disable = (): void => {
        originalDisable();
        runInAction(() => enabled.set(false));
    };

    return validator;
}
