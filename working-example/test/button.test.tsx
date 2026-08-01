// @vitest-environment jsdom
// The view-model tests run on `node`; this one renders React, so it opts into
// jsdom per-file rather than switching the whole suite's environment.
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../src/common/ui/button.js";

describe("Button", () => {
    it("renders its children inside a button", (): void => {
        render(<Button>Save</Button>);

        expect(
            screen.getByRole("button", { name: "Save" }),
        ).toBeInTheDocument();
    });

    it("applies the variant token classes", (): void => {
        render(<Button variant="destructive">Delete</Button>);

        expect(screen.getByRole("button", { name: "Delete" })).toHaveClass(
            "bg-destructive",
        );
    });

    it("renders as the child element when asChild is set", (): void => {
        render(
            <Button asChild>
                <a href="/somewhere">Go</a>
            </Button>,
        );

        expect(screen.getByRole("link", { name: "Go" })).toHaveAttribute(
            "href",
            "/somewhere",
        );
    });
});
