import type { EventAggregator, EventSubscription } from "./event-aggregator.js";
import { given } from "@nivinjoseph/n-defensive";


export class DefaultEventAggregator implements EventAggregator
{
    private _subscriptions: Record<string, Array<DefaultEventSubscriptionInternal> | null> = {};


    public subscribe(event: string, handler: (...eventArgs: Array<any>) => void): EventSubscription
    {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        given(handler, "handler").ensureHasValue();
        
        event = event.trim();
        
        if (!this._subscriptions[event])
            this._subscriptions[event] = new Array<DefaultEventSubscriptionInternal>();

        const eventSubscriptions = this._subscriptions[event]!;

        const existingRegistration = eventSubscriptions.find(t => t.handler === handler);
        if (existingRegistration)
            return existingRegistration.subscription;

        const eventSubscriptionInternal = new DefaultEventSubscriptionInternal();
        eventSubscriptionInternal.handler = handler;
        eventSubscriptionInternal.subscription = new DefaultEventSubscription(event, this, eventSubscriptionInternal);
        eventSubscriptions.push(eventSubscriptionInternal);

        return eventSubscriptionInternal.subscription;
    }

    public publish(event: string, ...eventArgs: Array<any>): void
    {
        given(event, "event").ensureHasValue().ensureIsString();
        event = event.trim();
        
        given(eventArgs, "eventArgs").ensureHasValue().ensureIsArray();
        
        if (!this._subscriptions[event])
            return;

        this._subscriptions[event]!.forEach(t => t.handler(...eventArgs));
    }

    
    private _unsubscribe(event: string, subscription: any): void
    {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());

        event = event.trim();
        
        if (!this._subscriptions[event])
            return;

        this._subscriptions[event]!.remove(subscription);
    }
}

class DefaultEventSubscription implements EventSubscription
{
    private readonly _event: string;
    private readonly _eventManager: DefaultEventAggregator;
    private readonly _subscription: DefaultEventSubscriptionInternal;
    private _isUnsubscribed = false;


    public get event(): string { return this._event; }


    public constructor(event: string, eventManager: DefaultEventAggregator, subscription: DefaultEventSubscriptionInternal)
    {
        given(event, "event").ensureHasValue().ensureIsString();
        this._event = event;
        
        given(eventManager, "eventManager").ensureHasValue().ensureIsType(DefaultEventAggregator);
        this._eventManager = eventManager;
        
        given(subscription, "subscription").ensureHasValue().ensureIsType(DefaultEventSubscriptionInternal);
        this._subscription = subscription;
    }


    public unsubscribe(): void
    {
        if (this._isUnsubscribed) return;

        // @ts-expect-error: deliberately calling inaccessible private method
        this._eventManager._unsubscribe(this._event, this._subscription);
        this._isUnsubscribed = true;
    }
}

class DefaultEventSubscriptionInternal
{
    public handler!: (...eventArgs: Array<any>) => void;
    public subscription!: EventSubscription;
}