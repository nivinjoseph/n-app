import * as assert from "assert";
import { Utils } from "../../src/core/utils";

suite.only("Utils - generateUrl", () =>
{
    test("should return a url with given route", () =>
    {
        let url = Utils.generateUrl("/api/test");
        assert.strictEqual(url, "/api/test");
    });
    
    test("should return a url with given route and params", () =>
    {
        let url = Utils.generateUrl("/api/test", { "key": "value" });
        assert.strictEqual(url, "/api/test?key=value");
    });
    
    test("should return a url with given route and baseUrl", () =>
    {
        let url = Utils.generateUrl("/api/test", {}, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test");
    });
    
    test("should return a url with given route, params, baseUrl", () =>
    {
        let url = Utils.generateUrl("/api/test", { "key": "value"}, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test?key=value");
    });
    
    test("should return a url with a given route with no slash at the beginning and a baseUrl with no trailing slash", () =>
    {
        let url = Utils.generateUrl("api/test", {}, "http://example.com");
        assert.strictEqual(url, "http://example.com/api/test");
    });
    
    test("should return a url given a route with slash at the beginning and baseUrl with trailing slash", () =>
    {
        let url = Utils.generateUrl("/api/test", {}, "http://example.com/");
        assert.strictEqual(url, "http://example.com/api/test");
    });
});