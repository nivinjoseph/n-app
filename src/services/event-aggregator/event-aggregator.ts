// public
export interface EventAggregator
{
    /**
     * 
     * Returns an EventSubscription after subscribing to a specific event.
     * 
     * @param event - The specified event name.
     * @param handler - The event handler given the event arguments.
     */
    subscribe(event: string, handler: (...eventArgs: any[]) => void): EventSubscription;
    /**
     * 
     * Publishes an event.
     * 
     * @param event - The specified event name.
     * @param eventArgs - Arguments sent to the subscriber.
     */
    publish(event: string, ...eventArgs: any[]): void;
} 

// public
export interface EventSubscription
{
    event: string;
    /**
     * Unsubscribe from the EventSubscription.
     */
    unsubscribe(): void;
}