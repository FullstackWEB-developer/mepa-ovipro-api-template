import * as cdk from '@aws-cdk/core';
import { readFileSync } from 'fs';
const cdkJson = JSON.parse(readFileSync('./cdk.json', 'utf-8'));

class TestContextProvider extends cdk.Construct {
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);
        this.node.setContext('account', 'mock');
        this.node.setContext('environment', 'mock1');
        this.node.setContext('defaultRegion', cdkJson.context.defaultRegion);
        this.node.setContext('project', cdkJson.context.project);
        this.node.setContext('accounts', cdkJson.context.accounts);
    }
}

/**Creates a CDK construct with all the required context fro running tests and assignes it into a CDK app. */
export function createCdkTestContext(): cdk.Construct {
    const app = new cdk.App();
    const testContextProvider = new TestContextProvider(app, 'TestContextProvider');
    return testContextProvider;
}
