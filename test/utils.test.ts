import { test, describe } from "node:test";
import { Utils } from "./../src/core/utils.js";
import assert from "node:assert";


await describe.skip("Utils - generateUrl", async () =>
{
    await test("should return a url with given route", () =>
    {
        const url = Utils.generateUrl("/api/test");
        assert.strictEqual(url, "/api/test");
    });

    await test("should return a url with given route and params", () =>
    {
        const url = Utils.generateUrl("/api/test", { "key": "value" });
        assert.strictEqual(url, "/api/test?key=value");
    });

    await test("should return a url with given route and baseUrl", () =>
    {
        const url = Utils.generateUrl("/api/test", {}, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test");
    });

    await test("should return a url with given route, params, baseUrl", () =>
    {
        const url = Utils.generateUrl("/api/test", { "key": "value" }, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test?key=value");
    });

    await test("should return a url with a given route with no slash at the beginning and a baseUrl with no trailing slash", () =>
    {
        const url = Utils.generateUrl("api/test", {}, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test");
    });

    await test("should return a url given a route with slash at the beginning and baseUrl with trailing slash", () =>
    {
        const url = Utils.generateUrl("/api/test", {}, "http://example.com/");
        assert.strictEqual(url, "http://example.com/api/test");
    });

    await test("optional query params that are null should not be rendered", () =>
    {
        const url = "/manageJet/basic?{id?: string}";
        const generatedUrl = Utils.generateUrl(url, { id: null });
        assert.strictEqual(generatedUrl, "/manageJet/basic");
    });
});