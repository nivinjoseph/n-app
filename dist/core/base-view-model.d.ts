import type { CreateComponentPublicInstance } from "vue";
export declare abstract class BaseViewModel {
    private readonly _watches;
    private _executeOnCreate;
    private _executeOnDestroy;
    private _domElement;
    protected get domElement(): HTMLElement;
    protected get ctx(): CreateComponentPublicInstance;
    /** Override */
    protected onCreate(): void;
    /** Override */
    protected onMount(element: HTMLElement): void;
    /** Override */
    protected onDismount(): void;
    /** Override */
    protected onDestroy(): void;
    protected executeOnCreate(funcToExecute: () => void): void;
    protected executeOnDestroy(funcToExecute: () => void): void;
    protected watch<T>(propertyName: string, callback: (value: T, oldValue: T) => void): void;
    protected unWatch(propertyName: string): void;
}
//# sourceMappingURL=base-view-model.d.ts.map