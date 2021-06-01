import { ContextOptions } from './context';

export interface MockData {
    [key: string]: unknown;
}

export interface TestLambdaInputOutputOptions {
    code: string;
    handler?: string;
    expectationsPath?: string;
    parseToJsonKeyPath?: string;
    logOutput?: boolean;
    contextOptions?: ContextOptions;
}

export type BeforeOrAfterHandler = (mockData: MockData) => void;
export type CatchHandler = (e: unknown, mockData: MockData) => void;

export interface TestLambdaInputOutputHooks {
    beforeHandler?: BeforeOrAfterHandler;
    catchHandler?: CatchHandler;
    afterHandler?: BeforeOrAfterHandler;
}

export interface IExpectations {
    input: any; // eslint-disable-line
    output: any; // eslint-disable-line
}
