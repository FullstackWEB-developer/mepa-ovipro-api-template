import { Context } from 'aws-lambda';
import { context } from './mock-context';

export interface ContextOptions {
    region?: string;
    account?: string;
    alias?: string;
    functionName?: string;
    functionVersion?: string;
    memoryLimitInMB?: string;
    timeout?: number;
}

export function createMockContext(contextOptions?: ContextOptions): Context {
    return context({
        region: process.env.AWS_REGION || 'eu-west-1',
        ...contextOptions,
    });
}
