import { MiddlewareObj } from '@middy/core';
import { normalizeHttpResponse } from '@middy/util';
import { factory } from '../logging';

export const requestIdHeaderName = 'Request-ID';

const log = factory.getLogger('request-id-header-appender');

// Override undefined types from Middy types for testing convenience.
type MiddlewareType =
    | MiddlewareObj<unknown> & {
          before: () => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          after: (request: any) => {
              // Nothing to see here
          };
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          onError: (request: any) => {
              // Nothing to see here
          };
      };
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
                log.trace(`Append header ${requestId}`);
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
