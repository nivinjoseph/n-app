import type { TodoService } from "@example/sdk";
import type { ApplicationScript } from "@nivinjoseph/n-app";

/** The example's TodoService is in-memory, so it boots empty and the list would
 * open on its "No tasks yet" state. Seed a few todos as a startup script —
 * ClientApp runs this against the root scope after the container bootstraps and
 * before the first mount, so the data is there for the initial render.
 *
 * One todo is completed on purpose: it's what exercises the disabled-checkbox
 * and completed-message paths in TodoItem. */
export const seedScript: ApplicationScript = async (serviceLocator) => {
    const todoService = serviceLocator.resolve<TodoService>("TodoService");

    await todoService.create("Buy milk", "2%");
    await todoService.create("Read the n-app README");

    const walkDog = await todoService.create("Walk dog");
    await walkDog.complete();
};
