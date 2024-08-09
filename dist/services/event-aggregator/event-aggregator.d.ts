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
    subscribe(event: string, handler: (...eventArgs: Array<any>) => void): EventSubscription;
    /**
     * @description Publishes an event.
     *
     * @param event - The specified event name.
     * @param eventArgs - Arguments sent to the event subscription.
     */
    publish(event: string, ...eventArgs: Array<any>): void;
}
export interface EventSubscription {
    event: string;
    /**
     * @description Unsubscribes from the EventSubscription.
     */
    unsubscribe(): void;
}
//# sourceMappingURL=event-aggregator.d.ts.map