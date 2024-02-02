import { given } from "@nivinjoseph/n-defensive";
import "@nivinjoseph/n-ext";
import type { ComponentViewModel, ComponentViewModelClass } from "./component-view-model.js";


export const eventsSymbol = Symbol("events");

// public
export function events<This extends ComponentViewModel>(...events: readonly [string, ...ReadonlyArray<string>]): EventsComponentViewModelDecorator<This>
{
    const initChars = "abcdefghijklmnopqrstuvwxyz".split("");

    given(events, "events")
        .ensureHasValue()
        .ensure(t => t.length > 0, "cannot be empty")
        .ensure(t => t.length === t.distinct().length, "duplicate events")
        .ensure(t => t.every(u => u.trim().toLowerCase() !== "input"), "event cannot be reserved event input")
        .ensure(t => t.every(u => initChars.contains(u.trim()[0].toLowerCase())), "event name has to start with alphabet");

    const decorator: EventsComponentViewModelDecorator<This> = (_, context) =>
    {
        given(context, "context")
            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            .ensure(t => t.kind === "class", "events decorator should only be used on a class");

        const className = context.name!;
        given(className, className).ensureHasValue().ensureIsString();

        context.metadata[eventsSymbol] = events;
    };

    return decorator;
}



export type EventsComponentViewModelDecorator<This extends ComponentViewModel> = (
    target: ComponentViewModelClass<This>,
    context: ClassDecoratorContext<ComponentViewModelClass<This>>
) => void;