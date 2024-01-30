import type { Resolver, Resolution, DialogService, NavRoute } from "../../../src/index.js";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Delay } from "@nivinjoseph/n-util";


@inject("DialogService")
export class TestResolverFoo implements Resolver
{
    private readonly _dialogService: DialogService;


    public constructor(dialogService: DialogService)
    {
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;
    }


    public async resolve(from: NavRoute, to: NavRoute): Promise<Resolution>
    {
        console.log("to", to);
        console.log("from", from);

        
        
        this._dialogService.showWarningMessage("In test resolver foo");
        
        await Delay.seconds(1);

        // throw new Error("blah");
        
        
        
        return {
            value: "foo"
            // redirect: "/dashboard"
        };
    }

}