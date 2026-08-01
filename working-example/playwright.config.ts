import { defineConfig, devices } from "@playwright/test";

// E2E tests for the client. The webServer boots the Vite dev server and nothing
// else — the example's TodoService is in-memory and seeded by a startup script,
// so the specs are deterministic and need no backend, no Docker, and no mocking.
export default defineConfig({
    testDir: "./test/e2e",
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 1 : 0,
    reporter: "list",
    use: {
        baseURL: "http://localhost:5173",
        trace: "on-first-retry",
    },
    projects: [
        {
            name: "chromium",
            use: { ...devices["Desktop Chrome"] },
        },
    ],
    webServer: {
        command: "yarn dev",
        url: "http://localhost:5173",
        reuseExistingServer: !process.env.CI,
        timeout: 120_000,
    },
});
