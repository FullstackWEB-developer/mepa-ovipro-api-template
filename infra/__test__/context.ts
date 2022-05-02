import { Project } from '@almamedia-open-source/cdk-project-context';
import { Construct } from 'constructs';
import projectProps from '../bin/config';

class TestContextProvider extends Construct {
    constructor(scope: Construct, id: string) {
        super(scope, id);
        this.node.setContext('account', 'mock');
        this.node.setContext('environment', 'mock1');
    }
}

/**Creates a CDK construct with all the required context fro running tests and assignes it into a CDK app. */
export function createCdkTestContext(): Construct {
    const app = new Project(projectProps);
    const testContextProvider = new TestContextProvider(app, 'TestContextProvider');
    return testContextProvider;
}
