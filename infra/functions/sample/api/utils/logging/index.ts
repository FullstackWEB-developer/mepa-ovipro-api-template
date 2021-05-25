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
    MessageType,
    ErrorType,
} from 'typescript-logging';
import { LogGroupRuntimeSettings } from 'typescript-logging/dist/commonjs/log/standard/LogGroupRuntimeSettings';
import { JsonUtils } from '../JsonUtils';

const serviceName = process.env.SERVICE_NAME || 'UNDEFINED';
const moduleName = process.env.MODULE_NAME || 'UNDEFINED';
const environmentName = process.env.ENVIRONMENT || 'UNDEFINED';
const method = process.env.METHOD || 'UNDEFINED';
const version = process.env.API_VERSION || 'v1';

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
        const { date, error, errorAsStack: stack_trace, level, loggerName, message } = msg;
        console.log(
            JsonUtils.stringifyClean({
                timestamp: date.toISOString(),
                error,
                stack_trace,
                level: LogLevel[level].toUpperCase(),
                loggerName,
                // Also has messageAsString.
                message,
                serviceName,
                moduleName,
                environment: environmentName,
                method,
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
 * Proxy method that converts Middy http error handler logger function to log to given
 * typescript-logging logger.
 */
export const middyLogProxy = (log: Logger): ((error: HttpError) => void) => {
    return (error: HttpError): void => log.error(`Error in handler ${error.stack}`, error);
};
