import { get, omit } from 'lodash';
import { Logger } from 'typescript-logging';
import { MiddlewareType } from './middlewareType';

/**
 * This custom middleware will log the response provided by the handler.
 * This middleware triggers in the after phase and requires the Logger instance as parameter.
 *
 * Usage:
 *   middy(handler).use(responseLogger(log)).
 */
export const responseLogger = (log: Logger): MiddlewareType => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const logResponseImpl = async (request: any) => {
        let response = { ...request.response };
        const body = get(response, 'body');
        // parse response body if is a string
        typeof body === 'string' && (response.body = JSON.parse(body));

        // exclude the response body field for GET requests
        if (response.statusCode === 200) {
            response = omit(response, 'body');
        }

        // log the error object
        if (request.error) response.error = request.error;
        response.statusCode >= 400 ? log.error(response) : log.info(response);
    };

    return {
        before: () => {
            // Not a before handler middleware.
        },
        after: logResponseImpl,
        onError: logResponseImpl,
    };
};
