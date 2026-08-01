import { given } from "@nivinjoseph/n-defensive";
import type { ComponentInstaller, Registry } from "@nivinjoseph/n-ject";
import { InMemoryTodoService } from "./todo/inmemory-todo-service.js";

/** The SDK installer: registers this example's resource services — nothing
 * shared. Shared client services (StorageService / EventAggregator) belong to
 * the client app's own installer; registering them here would collide the
 * moment a second SDK is installed.
 *
 * TodoService MUST be a singleton — InMemoryTodoService holds the todos in an
 * instance Map, so a transient registration would hand every page its own
 * empty store. */
export class SdkInstaller implements ComponentInstaller {
    public async install(registry: Registry): Promise<void> {
        given(registry, "registry").ensureHasValue().ensureIsObject();

        registry.registerSingleton("TodoService", InMemoryTodoService);
    }
}
