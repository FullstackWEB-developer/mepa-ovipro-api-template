import { extend, get } from 'lodash';
import { HandlerError } from '../error-handling/HandlerError';
import { MiddlewareType } from './middlewareType';

/**
 * This custom middleware will handle any errors that might arise.
 * This middleware will return an error containing the statusCode and the body. By default, it will return a technical error.
 *
 * Usage:
 *   middy(handler).use(errorHandler()).
 */
export const errorHandler = (): MiddlewareType => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorHandler = async (errorResponse: any) => {
        const error = get(errorResponse, 'error');
        const errorOutput = error instanceof HandlerError ? error : new HandlerError();
        extend(errorResponse.response, {
            statusCode: errorOutput.statusCode,
            body: JSON.stringify({
                errorCode: errorOutput.errorCode,
                message: errorOutput.message,
                description: errorOutput.description || undefined,
                errors: errorOutput.errors || undefined,
            }),
        });
    };

    return {
        before: () => {
            // Not a before handler middleware.
        },
        after: () => {},
        onError: (error) => errorHandler(error),
    };
};
