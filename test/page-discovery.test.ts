/** biome-ignore-all lint/style/useNamingConvention: fixture records use import.meta.glob path keys */
import { ApplicationException } from "@nivinjoseph/n-exception";
import type { ReactElement } from "react";
import { memo } from "react";
import { describe, expect, it } from "vitest";
import { ClientApp } from "../src/client-app.js";
import { ComponentViewModel } from "../src/component-view-model.js";
import { discoverPageDetails } from "../src/page-discovery.js";
import { PageViewModel } from "../src/page-view-model.js";
import { route } from "../src/route.js";

class AlphaViewModel extends PageViewModel {}
class BetaViewModel extends PageViewModel {}

const Alpha = (): null => null;
const Beta = memo(function Beta(): null {
    return null;
});

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

describe("discoverPageDetails", () => {
    it("returns an empty array for empty records", (): void => {
        expect(discoverPageDetails({}, {})).toEqual([]);
    });

    it("pairs a page view model with its sibling view export", (): void => {
        const result = discoverPageDetails(
            { "./pages/alpha/alpha-view-model.ts": { AlphaViewModel } },
            { "./pages/alpha/alpha.tsx": { Alpha } },
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.viewModel).toBe(AlphaViewModel);
        expect((result[0]!.view as ReactElement).type).toBe(Alpha);
    });

    it("resolves a memo-object view export by name, not function shape", (): void => {
        const result = discoverPageDetails(
            { "./pages/beta/beta-view-model.ts": { BetaViewModel } },
            { "./pages/beta/beta.tsx": { Beta } },
        );

        expect((result[0]!.view as ReactElement).type).toBe(Beta);
    });

    it("ignores co-exported values that are not page view models", (): void => {
        class PlainClass {}
        class SomeComponentViewModel extends ComponentViewModel {}

        const result = discoverPageDetails(
            {
                "./pages/alpha/alpha-view-model.ts": {
                    AlphaViewModel,
                    someConst: 42,
                    someFn: (): void => {},
                    PlainClass,
                    SomeComponentViewModel,
                },
            },
            { "./pages/alpha/alpha.tsx": { Alpha } },
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.viewModel).toBe(AlphaViewModel);
    });

    it("skips page view models whose class name starts with an underscore", (): void => {
        class _DraftViewModel extends PageViewModel {}

        const result = discoverPageDetails(
            {
                "./pages/alpha/alpha-view-model.ts": {
                    _DraftViewModel,
                    AlphaViewModel,
                },
            },
            { "./pages/alpha/alpha.tsx": { Alpha } },
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.viewModel).toBe(AlphaViewModel);
    });

    it("treats a fully underscore-opted-out file with no view entry as legal", (): void => {
        class _DraftViewModel extends PageViewModel {}

        const result = discoverPageDetails(
            { "./pages/draft/draft-view-model.ts": { _DraftViewModel } },
            {},
        );

        expect(result).toEqual([]);
    });

    it("throws with the module path when a matched file exports no page view model", (): void => {
        const thrown = captureThrown(() =>
            discoverPageDetails(
                {
                    "./pages/dead/dead-view-model.ts": {
                        helper: (): void => {},
                    },
                },
                {},
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toContain("./pages/dead/dead-view-model.ts");
    });

    it("throws with path and name when a class violates the ViewModel suffix convention", (): void => {
        class BadlyNamed extends PageViewModel {}

        const thrown = captureThrown(() =>
            discoverPageDetails(
                { "./pages/bad/bad-view-model.ts": { BadlyNamed } },
                {},
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toMatch(
            /BadlyNamed.*'\.\/pages\/bad\/bad-view-model\.ts'/,
        );
    });

    it("throws citing both paths when two different classes share a name", (): void => {
        const first = class DupViewModel extends PageViewModel {};
        const second = class DupViewModel extends PageViewModel {};

        const thrown = captureThrown(() =>
            discoverPageDetails(
                {
                    "./pages/a/a-view-model.ts": { DupViewModel: first },
                    "./pages/b/b-view-model.ts": { DupViewModel: second },
                },
                {
                    "./pages/a/a.tsx": { Dup: Alpha },
                },
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toMatch(
            /'\.\/pages\/a\/a-view-model\.ts'.*'\.\/pages\/b\/b-view-model\.ts'/,
        );
    });

    it("dedupes the same class reachable through multiple modules without a second view lookup", (): void => {
        const result = discoverPageDetails(
            {
                "./pages/alpha/alpha-view-model.ts": { AlphaViewModel },
                "./pages/other/re-export-view-model.ts": { AlphaViewModel },
            },
            // no ./pages/other/re-export.tsx — dedupe fires before pairing
            { "./pages/alpha/alpha.tsx": { Alpha } },
        );

        expect(result).toHaveLength(1);
        expect(result[0]!.viewModel).toBe(AlphaViewModel);
    });

    it("throws citing the view-model path when the sibling view module is missing", (): void => {
        const thrown = captureThrown(() =>
            discoverPageDetails(
                { "./pages/alpha/alpha-view-model.ts": { AlphaViewModel } },
                {},
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toContain("./pages/alpha/alpha-view-model.ts");
        expect(thrown.message).toContain("./pages/alpha/alpha.tsx");
    });

    it("throws citing the view path and expected export name when the view export is absent", (): void => {
        const thrown = captureThrown(() =>
            discoverPageDetails(
                { "./pages/alpha/alpha-view-model.ts": { AlphaViewModel } },
                { "./pages/alpha/alpha.tsx": { WrongName: Alpha } },
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toContain("./pages/alpha/alpha.tsx");
        expect(thrown.message).toContain("'Alpha'");
    });

    it("aggregates across modules in record order", (): void => {
        const result = discoverPageDetails(
            {
                "./pages/alpha/alpha-view-model.ts": { AlphaViewModel },
                "./pages/beta/beta-view-model.ts": { BetaViewModel },
            },
            {
                "./pages/alpha/alpha.tsx": { Alpha },
                "./pages/beta/beta.tsx": { Beta },
            },
        );

        expect(result.map((t) => t.viewModel)).toEqual([
            AlphaViewModel,
            BetaViewModel,
        ]);
    });
});

describe("ClientApp.discoverPages", () => {
    it("accepts empty glob records and chains", (): void => {
        const app = new ClientApp("#root");

        expect(app.discoverPages({}, {})).toBe(app);
    });

    it("accepts a populated record pair and constructs the page registration", (): void => {
        @route("/routed-alpha")
        class RoutedAlphaViewModel extends PageViewModel {}
        const RoutedAlpha = (): null => null;

        const app = new ClientApp("#root");

        const result = app.discoverPages(
            {
                "./pages/routed-alpha/routed-alpha-view-model.ts": {
                    RoutedAlphaViewModel,
                },
            },
            { "./pages/routed-alpha/routed-alpha.tsx": { RoutedAlpha } },
        );

        expect(result).toBe(app);
    });

    it("surfaces the downstream @route requirement for undecorated page view models", (): void => {
        const app = new ClientApp("#root");

        const thrown = captureThrown(() =>
            app.discoverPages(
                { "./pages/alpha/alpha-view-model.ts": { AlphaViewModel } },
                { "./pages/alpha/alpha.tsx": { Alpha } },
            ),
        );

        expect(thrown).toBeInstanceOf(ApplicationException);
        expect(thrown.message).toContain("@route");
    });
});
