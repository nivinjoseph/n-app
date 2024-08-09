import { given } from "@nivinjoseph/n-defensive";
import { InvalidOperationException } from "@nivinjoseph/n-exception";
import { BaseViewModel } from "./base-view-model.js";
import type { ClassDefinition } from "@nivinjoseph/n-util";


// public
export abstract class ComponentViewModel extends BaseViewModel
{
    private get _myBindings(): ReadonlyArray<string> { return (<any>this)["_bindings"] as Array<string>; }
    private get _myEvents(): ReadonlyArray<string> { return (<any>this)["_events"] as Array<string>; }

    private get _myProps(): Record<string, any> { return this.ctx.$props; }


    protected getBound<T>(propertyName: string): T
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling getBound() in the constructor");

        given(propertyName, "propertyName").ensureHasValue()
            .ensure(t => this._myBindings.contains(t), `No binding with the name '${propertyName}' found`);

        return this._myProps[propertyName] as T;
    }

    protected getBoundModel<T>(): T
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling getBoundModel() in the constructor");

        if (!this._myBindings.contains("model"))
            throw new InvalidOperationException("calling getBoundModel() without defining 'model' in bind");

        return this._myProps["modelValue"] as T;
    }

    protected setBoundModel(value: unknown): void
    {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        if (!this.ctx)
            throw new InvalidOperationException("calling setBoundModel() in the constructor");

        if (!this._myBindings.contains("model"))
            throw new InvalidOperationException("calling setBoundModel() without defining 'model' in bind");

        this.ctx.$emit("update:modelValue", value);
    }

    protected emit(event: string, ...eventArgs: Array<any>): void
    {
        given(event, "event").ensureHasValue().ensureIsString()
            .ensure(t => this._myEvents.contains(t.trim()), "undeclared event");

        event = this._camelCaseToKebabCase(event);

        this.ctx.$emit(event, ...eventArgs);
    }

    private _camelCaseToKebabCase(value: string): string
    {
        let eventName = value.trim();
        const re = /[A-Z]/g;

        let index = eventName.search(re);
        while (index !== -1)
        {
            const char = eventName[index];
            const replacement = "-" + char.toLowerCase();
            eventName = eventName.replace(char, replacement);

            index = eventName.search(re);
        }

        return eventName;
    }

    // Shrey implementation
    // private camelToKebab(value: string): string
    // {
    //     given(value, "value").ensureHasValue().ensure(t => t.isNotEmptyOrWhiteSpace())
    //         .ensure(t => t.trim()[0].toUpperCase() !== t.trim()[0])
    //         .ensure(t => !t.contains(" "));

    //     return value.trim().split("").reduce((acc, t) =>
    //     {
    //         if (t.toUpperCase() === t)
    //         {
    //             acc = acc + "-" + t.toLowerCase();
    //         }
    //         else
    //         {
    //             acc += t;
    //         }
    //         return acc;
    //     }, "");
    // }
}

export type ComponentViewModelClass<T extends ComponentViewModel> = ClassDefinition<T>;