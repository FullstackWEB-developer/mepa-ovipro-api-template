import { MiddlewareObj } from '@middy/core';

// Override undefined types from Middy types for testing convenience.
export type MiddlewareType =
    | MiddlewareObj<unknown> & {
          before: () => void;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          after: (request: any) => void;
          onError: (request: any) => void;
      };
