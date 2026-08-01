import { given } from "@nivinjoseph/n-defensive";

/**
 * @description Used to propagate app-specific events throughout the App. ViewModels and services can consume the events published.
 */
export interface EventAggregator {
    /**
     * @description Subscribe to a specific event given `event` which executes `handler` when
     * an event is publish. To prevent memory leaks call the `unsubscribe()` method on the
     * EventSubscription.
     *
     * @param event - The specified event name.
     * @param handler - The event handler given the event arguments.
     * @returns The Event Subscription.
     */
    subscribe(
        event: string,
        // biome-ignore lint/suspicious/noExplicitAny: nivin move
        handler: (...eventArgs: Array<any>) => void,
    ): EventSubscription;
    /**
     * @description Publishes an event.
     *
     * @param event - The specified event name.
     * @param eventArgs - Arguments sent to the event subscription.
     */

    // biome-ignore lint/suspicious/noExplicitAny: nivin move
    publish(event: string, ...eventArgs: Array<any>): void;
}

// public
export interface EventSubscription {
    event: string;
    /**
     * @description Unsubscribes from the EventSubscription.
     */
    unsubscribe(): void;
}

export class DefaultEventAggregator implements EventAggregator {
    private readonly _subscriptions: Record<
        string,
        Array<DefaultEventSubscriptionInternal> | null
    > = {};

    public subscribe(
        event: string,
        // biome-ignore lint/suspicious/noExplicitAny: nivin  move
        handler: (...eventArgs: Array<any>) => void,
    ): EventSubscription {
        given(event, "event")
            .ensureHasValue()
            .ensure((t) => !t.isEmptyOrWhiteSpace());
        given(handler, "handler").ensureHasValue();

        event = event.trim();

        if (!this._subscriptions[event])
            this._subscriptions[event] =
                new Array<DefaultEventSubscriptionInternal>();

        const eventSubscriptions = this._subscriptions[event]!;

        const existingRegistration = eventSubscriptions.find(
            (t) => t.handler === handler,
        );
        if (existingRegistration) return existingRegistration.subscription;

        const eventSubscriptionInternal =
            new DefaultEventSubscriptionInternal();
        eventSubscriptionInternal.handler = handler;
        eventSubscriptionInternal.subscription = new DefaultEventSubscription(
            event,
            this,
            eventSubscriptionInternal,
        );
        eventSubscriptions.push(eventSubscriptionInternal);

        return eventSubscriptionInternal.subscription;
    }

    // biome-ignore lint/suspicious/noExplicitAny: nivin move
    public publish(event: string, ...eventArgs: Array<any>): void {
        given(event, "event").ensureHasValue().ensureIsString();
        event = event.trim();

        given(eventArgs, "eventArgs").ensureHasValue().ensureIsArray();

        if (!this._subscriptions[event]) return;

        this._subscriptions[event]!.forEach((t) => t.handler(...eventArgs));
    }

    // biome-ignore lint/correctness/noUnusedPrivateClassMembers: accessed under the hood by the subscription
    // biome-ignore lint/suspicious/noExplicitAny: nivin move
    private _unsubscribe(event: string, subscription: any): void {
        given(event, "event")
            .ensureHasValue()
            .ensure((t) => !t.isEmptyOrWhiteSpace());

        event = event.trim();

        if (!this._subscriptions[event]) return;

        this._subscriptions[event]!.remove(subscription);
    }
}

class DefaultEventSubscription implements EventSubscription {
    private readonly _event: string;
    private readonly _eventManager: DefaultEventAggregator;
    private readonly _subscription: DefaultEventSubscriptionInternal;
    private _isUnsubscribed = false;

    public get event(): string {
        return this._event;
    }

    public constructor(
        event: string,
        eventManager: DefaultEventAggregator,
        subscription: DefaultEventSubscriptionInternal,
    ) {
        given(event, "event").ensureHasValue().ensureIsString();
        this._event = event;

        given(eventManager, "eventManager")
            .ensureHasValue()
            .ensureIsType(DefaultEventAggregator);
        this._eventManager = eventManager;

        given(subscription, "subscription")
            .ensureHasValue()
            .ensureIsType(DefaultEventSubscriptionInternal);
        this._subscription = subscription;
    }

    public unsubscribe(): void {
        if (this._isUnsubscribed) return;

        // @ts-expect-error: deliberately calling inaccessible private method
        this._eventManager._unsubscribe(this._event, this._subscription);
        this._isUnsubscribed = true;
    }
}

class DefaultEventSubscriptionInternal {
    // biome-ignore lint/suspicious/noExplicitAny: nivin move
    public handler!: (...eventArgs: Array<any>) => void;
    public subscription!: EventSubscription;
}
