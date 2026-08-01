import type { Validator } from "@nivinjoseph/n-validate";
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
export declare function makeValidatorObservable<T extends object>(validator: Validator<T>, target: T): Validator<T>;
//# sourceMappingURL=make-validator-observable.d.ts.map