import type { EventAggregator, EventSubscription } from "./event-aggregator.js";
export declare class DefaultEventAggregator implements EventAggregator {
    private _subscriptions;
    subscribe(event: string, handler: (...eventArgs: Array<any>) => void): EventSubscription;
    publish(event: string, ...eventArgs: Array<any>): void;
    private _unsubscribe;
}
//# sourceMappingURL=default-event-aggregator.d.ts.map