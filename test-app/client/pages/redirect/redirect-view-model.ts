import { PageViewModel, resolve, route, template } from "../../../../src/index.js";
import { RedirectResolver } from "../../resolvers/redirect-resolver.js";
import * as Routes from "../routes.js";
import "./redirect-view.scss";


@template(require("./redirect-view.html"))
@route(Routes.redirect)
@resolve(RedirectResolver)
export class RedirectViewModel extends PageViewModel
{
    protected override onCreate(): void
    {
        super.onCreate();
        console.log("should not be called");
    }
}