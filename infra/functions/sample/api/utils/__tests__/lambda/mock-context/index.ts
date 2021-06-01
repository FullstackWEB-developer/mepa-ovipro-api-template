import * as uuid from 'uuid';

// This file is a cleanup from https://github.com/SamVerschueren/aws-lambda-mock-context
// with changes from https://github.com/SamVerschueren/aws-lambda-mock-context/pull/17.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function context(options: unknown): any {
    const id = uuid.v1();
    const stream = uuid.v4().replace(/-/g, '');

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const opts: any = Object.assign(
        {
            region: 'us-west-1',
            account: '123456789012',
            functionName: 'UNDEFINED',
            functionVersion: '$LATEST',
            memoryLimitInMB: '128',
            timeout: 3,
        },
        options,
    );

    const deferred = defer();

    const start = Date.now();
    let end: number;
    let timeout: NodeJS.Timeout | undefined = undefined;

    const aliasOrVersion = `${opts.alias || opts.functionVersion}`;
    const arn = `arn:aws:lambda:${opts.region}:${opts.account}:function:${opts.functionName}:${aliasOrVersion}`;
    const date = `${new Date().toISOString().replace('-', '/').substring(0, 10)}`;
    const context = {
        callbackWaitsForEmptyEventLoop: true,
        functionName: opts.functionName,
        functionVersion: opts.functionVersion,
        invokedFunctionArn: arn,
        memoryLimitInMB: opts.memoryLimitInMB,
        awsRequestId: id,
        invokeid: id,
        logGroupName: `/aws/lambda/${opts.functionName}`,
        logStreamName: `${date}/[${opts.functionVersion}]/${stream}`,
        getRemainingTimeInMillis: () => {
            const endTime = end || Date.now();
            const remainingTime = opts.timeout * 1000 - (endTime - start);

            return Math.max(0, remainingTime);
        },
        succeed: (result: unknown) => {
            end = Date.now();

            deferred.resolve(result);
        },
        fail: (err: unknown) => {
            end = Date.now();

            if (typeof err === 'string') {
                err = new Error(err);
            }

            deferred.reject(err);
        },
        done: (err: unknown, result: unknown) => {
            if (timeout) {
                clearTimeout(timeout);
            }
            if (err) {
                context.fail(err);
                return;
            }

            context.succeed(result);
        },
        Promise: new Promise(deferred),
    };

    timeout = setTimeout(() => {
        if (context.getRemainingTimeInMillis() === 0) {
            context.fail(new Error(`Task timed out after ${opts.timeout}.00 seconds`));
        }
    }, opts.timeout * 1000);

    return context;
}

/**
 * Replacement for https://github.com/SamVerschueren/pinkie-defer used by the mock context.
 */
const defer = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fn: any = function (resolve: unknown, reject: unknown) {
        fn._resolveFn = resolve;
        fn._rejectFn = reject;
    };

    fn.resolve = function (result: unknown) {
        this._resolveFn(result);
    };

    fn.reject = function (err: unknown) {
        this._rejectFn(err);
    };

    return fn;
};
