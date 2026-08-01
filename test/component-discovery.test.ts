/** biome-ignore-all lint/style/useNamingConvention: fixture records use import.meta.glob path keys */
import { ApplicationException } from "@nivinjoseph/n-exception";
import { describe, expect, it } from "vitest";
import { ClientApp } from "../src/client-app.js";
import { discoverComponentViewModels } from "../src/component-discovery.js";
import { ComponentViewModel } from "../src/component-view-model.js";
import { PageViewModel } from "../src/page-view-model.js";

class ItemViewModel extends ComponentViewModel {}
class RowViewModel extends ComponentViewModel {}

// Not expect(...).toThrow(...): that path reads error.stack, and Vite's
// source-map CallSite cloning collides with n-ext's non-writable
// Object.prototype.getTypeName (V8 CallSites have a getTypeName method).
// Capturing and asserting on message avoids materializing the stack.
function captureThrown(fn: () => unknown): Error {
    try {
        fn();
    } catch (error) {
        return error as Error;
    }
    throw new Error("Expected the callback to throw, but it did not.");
}

describe("discoverComponentViewModels", () => {
    it("returns an empty array for an empty record (fresh app, no components)", (): void => {
        expect(discoverComponentViewModels({})).toEqual([]);
    });

    it("finds a ComponentViewModel subclass exported by a matched module", (): void => {
        const result = discoverComponentViewModels({
            "./pages/a/components/item/item-view-model.ts": { ItemViewModel },
        });

        expect(result).toEqual([ItemViewModel]);
    });

    it("ignores co-exported values that are not component view models", (): void => {
        class PlainClass {}
        class SomePageViewModel extends PageViewModel {}

        const result = discoverComponentViewModels({
            "./pages/a/components/item/item-view-model.ts": {
                ItemViewModel,
                someConst: 42,
                someFn: (): void => {},
                PlainClass,
                SomePageViewModel,
            },
        });

        expect(result).toEqual([ItemViewModel]);
    });

    it("skips view models whose class name starts with an underscore", (): void => {
        class _DraftViewModel extends ComponentViewModel {}

        const result = discoverComponentViewModels({
            "./pages/a/components/item/item-view-model.ts": {
                _DraftViewModel,
                ItemViewModel,
            },
        });

        expect(result).toEqual([ItemViewModel]);
    });

    it("treats a file exporting only an underscore-prefixed view model as an opt-out, not an error", (): void => {
        class _DraftViewModel extends ComponentViewModel {}

        const result = discoverComponentViewModels({
            "./pages/a/components/draft/draft-view-model.ts": {
                _DraftViewModel,
            },
        });

        expect(result).toEqual([]);
    });

    it("throws with the module path when a matched file exports no component view model", (): void => {
        const thrown = captureThrown(() =>
            discoverComponentViewModels({
                "./pages/a/components/dead/dead-view-model.ts": {
                    helper: (): void => {},
                },
            }),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toContain(
            "./pages/a/components/dead/dead-view-model.ts",
        );
    });

    it("throws with path and name when a class violates the ViewModel suffix convention", (): void => {
        class BadlyNamed extends ComponentViewModel {}

        const thrown = captureThrown(() =>
            discoverComponentViewModels({
                "./pages/a/components/bad/bad-view-model.ts": { BadlyNamed },
            }),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toMatch(
            /BadlyNamed.*'\.\/pages\/a\/components\/bad\/bad-view-model\.ts'/,
        );
    });

    it("throws citing both paths when two different classes share a name", (): void => {
        const first = class DupViewModel extends ComponentViewModel {};
        const second = class DupViewModel extends ComponentViewModel {};

        const thrown = captureThrown(() =>
            discoverComponentViewModels({
                "./pages/a/components/dup/dup-view-model.ts": {
                    DupViewModel: first,
                },
                "./pages/b/components/dup/dup-view-model.ts": {
                    DupViewModel: second,
                },
            }),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toMatch(
            /'\.\/pages\/a\/components\/dup\/dup-view-model\.ts'.*'\.\/pages\/b\/components\/dup\/dup-view-model\.ts'/,
        );
    });

    it("dedupes the same class reachable through multiple modules", (): void => {
        const result = discoverComponentViewModels({
            "./pages/a/components/item/item-view-model.ts": { ItemViewModel },
            "./pages/b/components/item/re-export-view-model.ts": {
                ItemViewModel,
            },
        });

        expect(result).toEqual([ItemViewModel]);
    });

    it("aggregates across modules in record order", (): void => {
        const result = discoverComponentViewModels({
            "./pages/a/components/item/item-view-model.ts": { ItemViewModel },
            "./pages/a/components/row/row-view-model.ts": { RowViewModel },
        });

        expect(result).toEqual([ItemViewModel, RowViewModel]);
    });
});

describe("ClientApp.discoverComponents", () => {
    it("accepts an empty glob record and chains", (): void => {
        const app = new ClientApp("#root");

        expect(app.discoverComponents({})).toBe(app);
    });

    it("accepts a populated glob record and chains", (): void => {
        const app = new ClientApp("#root");

        const result = app.discoverComponents({
            "./pages/a/components/item/item-view-model.ts": { ItemViewModel },
        });

        expect(result).toBe(app);
    });
});
