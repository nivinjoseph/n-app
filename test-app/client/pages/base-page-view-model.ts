import "@nivinjoseph/n-ext";
import { PageViewModel } from "../../../src/index.js";


export class BasePageViewModel extends PageViewModel
{
    public constructor()
    {
        super();
        console.log("Instantiating {0}".format((<Object>this).getTypeName()));
    }

    protected override onEnter(...params: Array<any>): void
    {
        console.log("Entering {0}".format((<Object>this).getTypeName()));
        console.log("arg", params);
        console.log("pathArgs", this.pathArgs);
        console.log("queryArgs", this.queryArgs);
        console.log("something12");
    }

    protected override onLeave(): void
    {
        console.log("Leaving {0}".format((<Object>this).getTypeName()));
    }
}