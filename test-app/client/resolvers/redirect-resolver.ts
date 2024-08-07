import type { Resolver, Resolution, DialogService, NavRoute } from "../../../src/index.js";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import * as Routes from "../pages/routes.js";


@inject("DialogService")
export class RedirectResolver implements Resolver
{
    private readonly _dialogService: DialogService;


    public constructor(dialogService: DialogService)
    {
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;
    }


    public async resolve(from: NavRoute, to: NavRoute): Promise<Resolution>
    {
        this._dialogService.showWarningMessage("In redirect resolver");
        console.log(from, to);

        if (to.path.startsWith(Routes.redirect))
            return {
                redirect: Routes.dashboard
            };

        return {};
    }

}