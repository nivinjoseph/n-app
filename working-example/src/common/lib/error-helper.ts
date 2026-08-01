import { given } from "@nivinjoseph/n-defensive";
import { RpcException } from "@nivinjoseph/n-web/client";

// biome-ignore lint/complexity/noStaticOnlyClass: organize
export class ErrorHelper {
    // biome-ignore lint/suspicious/noExplicitAny: any
    public static resolveErrorMessage(error: any): {
        title?: string;
        message: string;
    } {
        given(error, "error").ensureHasValue();

        console.error(error);

        if (!window.navigator.onLine)
            return {
                title: "Failed to connect",
                message: "Please check your internet connection",
            };

        const exceptionCode =
            error instanceof RpcException ? error.exceptionCode : null;

        switch (exceptionCode) {
            case ExceptionCode.validationFailed:
            case ExceptionCode.aggregateNotFound:
                return {
                    message: error.data!.message,
                };

            case ExceptionCode.todoTitleUnavailable:
                return {
                    message: error.data!.message,
                };

            default:
                return {
                    message:
                        "There was an error processing your request. Please contact support.",
                };
        }
    }
}

export enum ExceptionCode {
    // 100 - 199 is reserved for System errors

    // 200 - 299 is reserved for Security errors

    // 300 - 399 is reserved for App errors
    validationFailed = 300,

    aggregateNotFound = 301,

    todoTitleUnavailable = 302,
}
