import { get, set } from 'lodash';
import { paramCase } from 'change-case';
import colorize from 'json-colorizer';
import chalk from 'chalk';
import {
    BeforeOrAfterHandler,
    CatchHandler,
    IExpectations,
    MockData,
    TestLambdaInputOutputHooks,
    TestLambdaInputOutputOptions,
} from './interfaces';
import { loadExpectation, loadExpectations } from './expectations';
import { createMockContext } from './context';
import { dirname } from 'path';

export * from './interfaces';

/** Default options that can be overridden by user-provided options. */
const defaultOptions: Partial<TestLambdaInputOutputOptions> = {
    handler: 'handler',
    logOutput: false,
};

/** Loads the mock data for specific tests. */
function loadMockData(name: string, options: TestLambdaInputOutputOptions): MockData {
    let mockData = {};
    try {
        mockData = loadExpectation(paramCase(name), 'mocks', resolveExpectationsPath(options));
    } catch (e) {
        console.debug(`No mock data defined for test '${name}'. ${e.message}`);
    }
    return mockData;
}

function callBeforeOrAfterHook(hook: BeforeOrAfterHandler | undefined, mockData: MockData) {
    if (typeof hook === 'function') {
        hook(mockData);
    }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function callCatchHook(hook: CatchHandler | undefined, mockData: MockData, e: any) {
    if (typeof hook === 'function') {
        hook(e, mockData);
    } else {
        // if onCatch not defined and the handler throws, let's rethrow the exception so tests fail
        throw e;
    }
}

function loadInputAndOutput(name: string, options: TestLambdaInputOutputOptions): IExpectations {
    return loadExpectations(paramCase(name), resolveExpectationsPath(options));
}

function resolveExpectationsPath(options: TestLambdaInputOutputOptions): string {
    if (options.expectationsPath) return options.expectationsPath;
    return `${dirname(options.code)}/__test__/expectations`;
}

async function executeHandler(
    name: string,
    options: TestLambdaInputOutputOptions,
    mockData: MockData,
    hooks?: TestLambdaInputOutputHooks,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
): Promise<any> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let response: any;

    // Load input/output expectations
    const { input, output } = loadInputAndOutput(name, options);

    // require the handler
    const handler = require(options.code)[options.handler!]; // eslint-disable-line

    const ctx = createMockContext();
    try {
        // Call the handler
        response = await handler(input, ctx);

        // Allow parsing a string to JSON at specific object PATH
        if (typeof options.parseToJsonKeyPath !== 'undefined') {
            const parsed = JSON.parse(get(response, options.parseToJsonKeyPath));
            set(response, options.parseToJsonKeyPath, parsed);
        }
        ctx.done(undefined, response);

        // Finally, the input/output expectation
        expect(response).toMatchObject(output);
    } catch (e) {
        // Allow user defined onCatch function
        ctx.done(e);
        callCatchHook(hooks?.catchHandler, mockData, e);
    }

    return response;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function logOutput(response: any, options: TestLambdaInputOutputOptions) {
    if (options.logOutput) {
        const json = JSON.stringify(response, null, 2);
        console.debug(
            chalk.bgBlack(chalk.cyan(`[${expect.getState().currentTestName}] LAMBDA OUTPUT:`)),
            chalk.bgBlack(colorize(json)),
        );
    }
}

export function testLambdaHandler(
    name: string,
    options: TestLambdaInputOutputOptions,
    hooks?: TestLambdaInputOutputHooks,
): void {
    test(name, async () => {
        const optionsWithDefaults: TestLambdaInputOutputOptions = {
            ...defaultOptions,
            ...options,
        };

        //console.error(optionsWithDefaults);

        // Load mock data, if any
        /* eslint-disable */
        const mockData = loadMockData(name, optionsWithDefaults);

        // Allow user defined before function, useful for mocking
        callBeforeOrAfterHook(hooks?.beforeHandler, mockData);

        const response = await executeHandler(name, optionsWithDefaults, mockData, hooks);

        // Allow user defined after function, useful for mocking
        callBeforeOrAfterHook(hooks?.afterHandler, mockData);

        logOutput(response, optionsWithDefaults);
    });
}
