// import assert from "node:assert";
// import { FunctionNode } from "../src/loaders/lib/function-node.js";
// import { describe, test } from "node:test";

// await describe("Random stuff", async () =>
// {
//     await test("string splitting", () =>
//     {
//         // let value = "/home/todo";
//         const value = "/";
//         const splitted = value.split("/");
//         // assert.ok(splitted.length === 2);
//         console.log(splitted);
//         console.log(splitted.map(t => t.length));
//     });

//     // test.only("Schema conversion", () =>
//     // {
//     //     const schema = '{"foo?": "string", "bar": [], "baz": Nove, box: {b: "string"}}';

//     //     const result = schemaToType(schema);

//     //     console.log(result);
//     //     const parsed = JSON.parse(result);
//     //     console.log(parsed);

//     //     Assert.ok(true);
//     // });

//     await test.only("Closure parsing", () =>
//     {
//         let renderFn = `
//         var render = function () {
//   var _vm = this
//   var _h = _vm.$createElement
//   var _c = _vm._self._c || _h
//   return _c(
//     "div",
//     { staticClass: "test-view" },
//     [
//       _c("h3", [_vm._v("This is a test")]),
//       _vm._v(" "),
//       _c("router-link", { attrs: { to: "/dashboard" } }, [
//         _vm._v("Go to Dashboard"),
//       ]),
//       _vm._v(" "),
//       _c("button", { on: { click: _vm.go } }, [
//         _vm._v("To Test " + _vm._s(_vm.id)),
//       ]),
//       _vm._v(" "),
//       _c("n-file-select", {
//         attrs: { id: "foo", "mime-types": ".xlsx", "max-file-size": 500 },
//         on: { select: _vm.onFileSelected },
//       }),
//       _vm._v(" "),
//       _c("component-a", {
//         attrs: { num: _vm.id, sport: _vm.players.takeLast() },
//       }),
//       _vm._v(" "),
//       _vm._l(_vm.players, function (player, index) {
//         return _c("component-a", {
//           key: player.name,
//           attrs: { num: _vm.id, sport: player },
//         })
//       }),
//       _vm._v(" "),
//       _vm._l(_vm.players, function (player) {
//         return _c("component-a", {
//           key: player.name.split("").reverse().join(""),
//           attrs: { num: _vm.id, sport: player },
//         })
//       }),
//       _vm._v(" "),
//       _c(
//         "n-expanding-container",
//         [
//           _c("component-a", {
//             attrs: { num: _vm.id, sport: _vm.players.takeLast() },
//           }),
//         ],
//         1
//       ),
//       _vm._v(" "),
//       _c(
//         "n-expanding-container",
//         { attrs: { "render-key": 300 } },
//         _vm._l(_vm.players, function (player) {
//           return _c("component-a", {
//             key: player.name,
//             attrs: { num: _vm.id, sport: player },
//           })
//         }),
//         1
//       ),
//       _vm._v(" "),
//       _vm._l(_vm.players, function (player) {
//         return _c(
//           "div",
//           { key: player.name },
//           [
//             _c("component-a", { attrs: { num: _vm.id, sport: player } }),
//             _vm._v(" "),
//             _c("component-a", { attrs: { num: _vm.id, sport: player } }),
//           ],
//           1
//         )
//       }),
//     ],
//     2
//   )
// }
//         `.trim();


//         renderFn = renderFn.replaceAll(",\r", ", ").replaceAll(",\n", ", ").replaceAll(",\r\n", ", ")
//             .replaceAll("(\r", "(").replaceAll("(\n", "(").replaceAll("(\r\n", "(")
//             .replaceAll(/[a-zA-Z0-9_]\\n/ig as any, ";");

//         while (renderFn.contains("  "))
//             renderFn = renderFn.replaceAll("  ", " ");

//         renderFn = renderFn.replaceAll("_c( ", "_c(");


//         const node = new FunctionNode(true, renderFn, 0, "TestViewModel");
//         node.preProcess();
//         // node.regenerate()
//         const moddedCode = node.toModdedCode();

//         console.log(renderFn);
//         console.log("<===================>");
//         console.log(moddedCode);


//         assert.strictEqual(moddedCode, renderFn);
//     });
// });

