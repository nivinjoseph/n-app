import { PageViewModel, route, Utils } from "@nivinjoseph/n-app";
import { Routes } from "../../routes.js";

type ScratchParams = {
    q: string | null;
    n: number | null;
    flag: boolean | null;
};

@route(Routes.scratch)
export class ScratchViewModel extends PageViewModel<ScratchParams> {
    private _paramChangeCount: number = 0;

    public get paramChangeCount(): number {
        return this._paramChangeCount;
    }

    public get q(): string | null {
        return this.retrieveParams().q;
    }
    public get n(): number | null {
        return this.retrieveParams().n;
    }
    public get flag(): boolean | null {
        return this.retrieveParams().flag;
    }

    protected override onParamsChanged(): void {
        this._paramChangeCount++;
    }

    public applyDraft(next: {
        q?: string | null;
        n?: number | null;
        flag?: boolean | null;
    }): void {
        const params = new URLSearchParams();
        if (next.q != null) params.set("q", next.q);
        if (next.n != null) params.set("n", String(next.n));
        if (next.flag != null) params.set("flag", String(next.flag));
        const qs = params.toString();
        this.goTo(
            qs.length > 0
                ? `${Routes.scratch.split("?")[0]}?${qs}`
                : Utils.generateUrl(Routes.scratch, {}),
        );
    }

    // public override init(): void | Promise<void> {
    //     super.init();

    //     console.log("INIT");
    // }

    // protected override onObservableChanged(): void {
    //     console.log("Something changed");
    // }
}
