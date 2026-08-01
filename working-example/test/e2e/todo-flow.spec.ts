import { expect, test } from "@playwright/test";

// The example's TodoService is in-memory and re-seeded by the startup script on
// every page load, so each test starts from the same three todos with no
// backend and no request mocking. Seed data lives in src/seed-script.ts:
//   "Buy milk" (description "2%"), "Read the n-app README", "Walk dog" (done).

test.describe("Todo flow — in-memory, no backend", () => {
    test("redirects the initial route to the list", async ({ page }) => {
        await page.goto("/");

        await expect(page).toHaveURL(/\/todos\/list$/);
    });

    test("renders the seeded todos", async ({ page }) => {
        await page.goto("/todos/list");

        await expect(page.getByText("Buy milk")).toBeVisible();
        await expect(page.getByText("Read the n-app README")).toBeVisible();
        await expect(page.getByText("Walk dog")).toBeVisible();
        await expect(page.getByRole("listitem")).toHaveCount(3);

        // The shell's banner is driven by the parent page's todo count, which it
        // refreshes off the EventAggregator.
        await expect(page.getByText(/you're making progress/i)).toBeVisible();
    });

    test("shows a completed todo's control as disabled", async ({ page }) => {
        await page.goto("/todos/list");

        await expect(
            page.getByRole("checkbox", { name: 'Mark "Walk dog" complete' }),
        ).toBeDisabled();
        await expect(
            page.getByRole("checkbox", { name: 'Mark "Buy milk" complete' }),
        ).toBeEnabled();
    });

    test("completes a todo and confirms with a dialog", async ({ page }) => {
        await page.goto("/todos/list");

        await page
            .getByRole("checkbox", { name: 'Mark "Buy milk" complete' })
            .click();

        await expect(
            page.getByRole("dialog").filter({ hasText: "Todo completed" }),
        ).toBeVisible();

        await page.getByRole("button", { name: "OK", exact: true }).click();

        await expect(
            page.getByRole("checkbox", { name: 'Mark "Buy milk" complete' }),
        ).toBeDisabled();
    });

    test("creates a todo and shows it on the list", async ({ page }) => {
        await page.goto("/todos/create");

        await page.getByLabel("Title").fill("Write the migration notes");
        await page.getByRole("button", { name: "Add", exact: true }).click();

        await expect(page).toHaveURL(/\/todos\/list$/);
        await expect(page.getByText("Write the migration notes")).toBeVisible();
        await expect(page.getByRole("listitem")).toHaveCount(4);
    });

    test("blocks submission when the title is empty", async ({ page }) => {
        await page.goto("/todos/create");

        // The validator is constructed deferred and only enabled by
        // submitDraft(), so the button starts enabled and the error appears on
        // the first submit attempt — that surfacing is makeValidatorObservable
        // driving a re-render off the validator's state.
        await page.getByRole("button", { name: "Add", exact: true }).click();

        await expect(page.getByText("Title is required.")).toBeVisible();
        await expect(page).toHaveURL(/\/todos\/create$/);
        await expect(
            page.getByRole("button", { name: "Add", exact: true }),
        ).toBeDisabled();
    });

    test("redirects an unknown route to create", async ({ page }) => {
        await page.goto("/no-such-page");

        await expect(page).toHaveURL(/\/todos\/create$/);
    });

    test("parses typed query params on the scratch page", async ({ page }) => {
        await page.goto("/scratch?q=hi&n=3&flag=true");

        await expect(page.getByText("hi")).toBeVisible();
        await expect(page.getByText("3", { exact: true })).toBeVisible();
    });
});
