import { AsyncLocalStorage } from 'async_hooks';
import { APIGatewayProxyEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import { HttpError } from 'http-errors';
import {
    LoggerFactoryOptions,
    LFService,
    LogGroupRule,
    LogLevel,
    LogFormat,
    LoggerType,
    AbstractLogger,
    LogMessage,
    Logger,
} from 'typescript-logging';
import { LogGroupRuntimeSettings } from 'typescript-logging/dist/commonjs/log/standard/LogGroupRuntimeSettings';
import { JsonUtils } from '../JsonUtils';

// Log context constants that are global to the Lambda process:

const serviceName = process.env.SERVICE_NAME || 'UNDEFINED';
const moduleName = process.env.MODULE_NAME || 'UNDEFINED';
const environmentName = process.env.ENVIRONMENT || 'UNDEFINED';
const method = process.env.METHOD || 'UNDEFINED';
const version = process.env.API_VERSION || 'v1';

/**
 * Storage for additional request-scoped log context data.
 */
const asyncLocalStorage = new AsyncLocalStorage();

export type LogContextData = {
    domainName?: string;
} & RequestContextData;

/**
 * Request context metadata type for logging.
 */
type RequestContextData = {
    requestId?: string;
};

/**
 * Logger options with one rule that matches all loggers.
 */
const options = new LoggerFactoryOptions().addLogGroupRule(
    new LogGroupRule(
        new RegExp('.+'),
        LogLevel.Debug,
        new LogFormat(),
        LoggerType.Custom,
        (name, logGroupRule) => new CustomLogger(name, logGroupRule),
    ),
);

/**
 * Custom logger implementation that produces JSON log events
 * with specific fields.
 */
class CustomLogger extends AbstractLogger {
    constructor(name: string, settings: LogGroupRuntimeSettings) {
        super(name, settings);
    }

    protected doLog(msg: LogMessage): void {
        const { date, error, level, loggerName, message } = msg;
        const { requestId, domainName } = (asyncLocalStorage.getStore() as LogContextData) || {};
        console.log(
            JsonUtils.stringifyClean({
                timestamp: date.toISOString(),
                thrown: {
                    name: error?.name,
                    message: error?.message,
                    extendedStacktrace: error?.stack,
                },
                level: LogLevel[level].toUpperCase(),
                loggerName,
                // Also has messageAsString.
                message,
                serviceName,
                moduleName,
                environment: environmentName,
                method,
                requestId,
                domainName,
                version,
            }),
        );
    }
}

/**
 * Expose a named logger factory with good defaults. It creates loggers.
 * @example
 * const log = factory.getLogger('PropertyService');
 *
 * class PropertyService {
 *   build(property: any) {
 *     log.debug(() => `Building property ${property}`);
 *   }
 * }
 */
export const factory = LFService.createNamedLoggerFactory('LoggerFactory', options);

/**
 * A generic logger for the lazy one.
 */
export const log = factory.getLogger('standard');

/**
 * This function proxies the Middy http error handler logger calls to log to the given
 * typescript-logging logger.
 */
export const middyLogProxy = (log: Logger): ((error: HttpError) => void) => {
    return (error: HttpError): void => log.error(`Error in handler ${error.stack}`, error);
};

const getRequestContextData = (event: APIGatewayProxyEvent) => {
    return { requestId: (event?.headers && event.headers['Request-ID']) || undefined };
};

/**
 * Append or replace the current log context with given data.
 * @param context replaces the log context.
 */
export const appendToLogContext = (context: LogContextData): void => {
    const data = asyncLocalStorage.getStore();
    if (data) {
        asyncLocalStorage.enterWith({ ...(data as Record<string, unknown>), ...context });
    }
};

/**
 * Wrap your Lambda handler with this function to provide it with request-scope log context data.
 * Wrapped function is executed inside AsyncLocalStorage.run(...).
 * {@link logContextProvider} instead.
 * @param event Lambda API event
 * @param fn Lambda API handler function
 */
export function provideLogContext<
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Handler extends (...args: [APIGatewayProxyEvent & any, Context]) => Promise<APIGatewayProxyResult>,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any, prettier/prettier
>(fn: Handler): (...args: [APIGatewayProxyEvent & any, Context]) => Promise<APIGatewayProxyResult> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (...localArgs: [APIGatewayProxyEvent & any, Context]) => {
        const logContextData: RequestContextData = getRequestContextData(localArgs[0]);
        return asyncLocalStorage.run(logContextData, fn, ...localArgs);
    };
}
