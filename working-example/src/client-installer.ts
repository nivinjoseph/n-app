import {
    BrowserStorageService,
    DefaultEventAggregator,
} from "@nivinjoseph/n-app";
import { given } from "@nivinjoseph/n-defensive";
import type { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";

/** The client app's own installer: shared client services, registered exactly
 * once by the app — above the per-API SdkInstallers (which register only
 * their keyed RpcClient + resource services). */
export class ClientInstaller implements ComponentInstaller {
    public async install(registry: Registry): Promise<void> {
        given(registry, "registry").ensureHasValue().ensureIsObject();

        registry
            .registerSingleton("StorageService", BrowserStorageService)
            .registerSingleton("EventAggregator", DefaultEventAggregator);
    }
}
