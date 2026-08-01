import { describe, expect, it } from "vitest";
import { DefaultEventAggregator } from "../src/event-aggregator.js";

describe("DefaultEventAggregator", () => {
    it("delivers published events with their args to subscribers", (): void => {
        const ea = new DefaultEventAggregator();
        const received: Array<unknown> = [];

        ea.subscribe("todo:changed", (arg: unknown): void => {
            received.push(arg);
        });
        ea.publish("todo:changed", 42);

        expect(received).toEqual([42]);
    });

    it("stops delivering after unsubscribe", (): void => {
        const ea = new DefaultEventAggregator();
        let count = 0;

        const subscription = ea.subscribe("e", (): void => {
            count += 1;
        });
        ea.publish("e");
        subscription.unsubscribe();
        ea.publish("e");

        expect(count).toBe(1);
    });

    it("dedupes the same handler subscribed twice", (): void => {
        const ea = new DefaultEventAggregator();
        let count = 0;
        const handler = (): void => {
            count += 1;
        };

        ea.subscribe("e", handler);
        ea.subscribe("e", handler);
        ea.publish("e");

        expect(count).toBe(1);
    });

    it("ignores a publish with no subscribers", (): void => {
        const ea = new DefaultEventAggregator();

        expect((): void => ea.publish("nobody")).not.toThrow();
    });
});
