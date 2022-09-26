import { normalizeHttpResponse } from '@middy/util';
import { factory } from '../logging';
import { MiddlewareType } from './middlewareType';

export const requestIdHeaderName = 'Request-ID';

const log = factory.getLogger('request-id-header-appender');

/**
 * This custom middleware will append a header called Request-ID from request headers to response.
 * This middleware triggers in the after phase. It should be the first or one of the first middlewares
 * to be attached to make sure it always gets executed.
 *
 * Usage:
 *   middy(handler).use(requestIdHeaderAppender()).
 */
export const requestIdHeaderAppender = (): MiddlewareType => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const appendRequestId = async (request: any) => {
        if (!request.response?.headers) {
            if (log.isTraceEnabled()) {
                log.trace('Normalize response');
            }
            request.response = normalizeHttpResponse(request.response);
        }
        const existingHeaders = Object.keys(request.response?.headers);
        if (!existingHeaders.includes(requestIdHeaderName) && request.event?.headers[requestIdHeaderName]) {
            const requestId = request.event?.headers[requestIdHeaderName];
            if (log.isTraceEnabled()) {
                console.log('Append header', request.event?.headers[requestIdHeaderName]);
            }
            request.response.headers[requestIdHeaderName] = requestId;
        }
    };

    return {
        before: () => {
            // Not a before handler middleware.
        },
        after: appendRequestId,
        onError: appendRequestId,
    };
};
