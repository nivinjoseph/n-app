import { route, template } from "./../../../../src/index.js";
import { BasePageViewModel } from "./../base-page-view-model.js";
import * as Routes from "./../routes.js";
import "./test-vuetify-view.scss";


@route(Routes.testVuetify)
@template(require("./test-vuetify-view.html"))
export class TestVuetifyViewModel extends BasePageViewModel
{
}