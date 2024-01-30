import type { Resolver, Resolution, DialogService } from "./../../../src/index.js";
import { inject } from "@nivinjoseph/n-ject";
import { given } from "@nivinjoseph/n-defensive";
import { Delay } from "@nivinjoseph/n-util";


@inject("DialogService")
export class TestResolverBar implements Resolver
{
    private readonly _dialogService: DialogService;


    public constructor(dialogService: DialogService)
    {
        given(dialogService, "dialogService").ensureHasValue().ensureIsObject();
        this._dialogService = dialogService;
    }


    public async resolve(): Promise<Resolution>
    {
        this._dialogService.showWarningMessage("In test resolver bar");

        await Delay.seconds(2);

        return {
            value: "bar"
            // redirect: "/test/5"
        };
    }

}