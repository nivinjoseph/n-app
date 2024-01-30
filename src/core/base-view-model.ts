import { given } from "@nivinjoseph/n-defensive";
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { CreateComponentPublicInstance, WatchStopHandle } from "vue";


export abstract class BaseViewModel
{
    private readonly _watches: Record<string, WatchStopHandle | undefined> = {};
    private _executeOnCreate: (() => void) | null = null;
    private _executeOnDestroy: (() => void) | null = null;
    private _domElement!: HTMLElement;


    protected get domElement(): HTMLElement { return this._domElement; }
    protected get ctx(): CreateComponentPublicInstance
    {
        return (<any>this)["_ctx"] as CreateComponentPublicInstance;
    }


    /** Override */
    protected onCreate(): void
    {
        if (this._executeOnCreate)
            this._executeOnCreate();
    }

    /** Override */
    protected onMount(element: HTMLElement): void
    {
        given(element, "element").ensureHasValue().ensureIsObject();
        this._domElement = element;
    }

    /** Override */
    protected onDismount(): void
    {
        // deliberate empty
    }

    /** Override */
    protected onDestroy(): void
    {
        for (const key in this._watches)
        {
            const unwatch = this._watches[key];
            if (unwatch != null)
            {
                unwatch();
                this._watches[key] = undefined;
            }
        }

        if (this._executeOnDestroy)
            this._executeOnDestroy();
    }

    protected executeOnCreate(funcToExecute: () => void): void
    {
        given(funcToExecute, "funcToExecute").ensureHasValue();
        this._executeOnCreate = funcToExecute;
    }

    protected executeOnDestroy(funcToExecute: () => void): void
    {
        given(funcToExecute, "funcToExecute").ensureHasValue();
        this._executeOnDestroy = funcToExecute;
    }

    protected watch<T>(propertyName: string, callback: (value: T, oldValue: T) => void): void
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        given(this, "this").ensure(t => t.ctx != null, "cannot invoke in the constructor");

        given(propertyName, "propertyName").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        propertyName = propertyName.trim();

        if (this._watches[propertyName])
            throw new ApplicationException(`Watch already defined for property '${propertyName}'.`);

        this._watches[propertyName] = this.ctx.$watch(propertyName,
            function (newVal: any, oldVal: any)
            {
                callback(newVal, oldVal);
            }, { deep: true });
    }

    protected unWatch(propertyName: string): void
    {
        given(propertyName, "propertyName").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        propertyName = propertyName.trim();

        const unwatch = this._watches[propertyName];
        if (unwatch != null)
        {
            unwatch();
            this._watches[propertyName] = undefined;
        }
    }
}