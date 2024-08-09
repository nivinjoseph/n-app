import { given } from "@nivinjoseph/n-defensive";
export class DefaultEventAggregator {
    _subscriptions = {};
    subscribe(event, handler) {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        given(handler, "handler").ensureHasValue();
        event = event.trim();
        if (!this._subscriptions[event])
            this._subscriptions[event] = new Array();
        const eventSubscriptions = this._subscriptions[event];
        const existingRegistration = eventSubscriptions.find(t => t.handler === handler);
        if (existingRegistration)
            return existingRegistration.subscription;
        const eventSubscriptionInternal = new DefaultEventSubscriptionInternal();
        eventSubscriptionInternal.handler = handler;
        eventSubscriptionInternal.subscription = new DefaultEventSubscription(event, this, eventSubscriptionInternal);
        eventSubscriptions.push(eventSubscriptionInternal);
        return eventSubscriptionInternal.subscription;
    }
    publish(event, ...eventArgs) {
        given(event, "event").ensureHasValue().ensureIsString();
        event = event.trim();
        given(eventArgs, "eventArgs").ensureHasValue().ensureIsArray();
        if (!this._subscriptions[event])
            return;
        this._subscriptions[event].forEach(t => t.handler(...eventArgs));
    }
    _unsubscribe(event, subscription) {
        given(event, "event").ensureHasValue().ensure(t => !t.isEmptyOrWhiteSpace());
        event = event.trim();
        if (!this._subscriptions[event])
            return;
        this._subscriptions[event].remove(subscription);
    }
}
class DefaultEventSubscription {
    _event;
    _eventManager;
    _subscription;
    _isUnsubscribed = false;
    get event() { return this._event; }
    constructor(event, eventManager, subscription) {
        given(event, "event").ensureHasValue().ensureIsString();
        this._event = event;
        given(eventManager, "eventManager").ensureHasValue().ensureIsType(DefaultEventAggregator);
        this._eventManager = eventManager;
        given(subscription, "subscription").ensureHasValue().ensureIsType(DefaultEventSubscriptionInternal);
        this._subscription = subscription;
    }
    unsubscribe() {
        if (this._isUnsubscribed)
            return;
        // @ts-expect-error: deliberately calling inaccessible private method
        this._eventManager._unsubscribe(this._event, this._subscription);
        this._isUnsubscribed = true;
    }
}
class DefaultEventSubscriptionInternal {
    handler;
    subscription;
}
//# sourceMappingURL=default-event-aggregator.js.map