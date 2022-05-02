import { Template } from 'aws-cdk-lib/assertions';
import { createCdkTestContext } from '../../__test__/context';
import { SampleApiStack } from '../api';
import { SampleEndpointStacks } from '../endpoints/sample';
import { SampleApiResourcesStack } from './resources/SampleApiResourcesStack';

test('sample-api-stack', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const { apiEndpointLambdaSecurityGroup } = new SampleApiResourcesStack(scope, 'SampleApiResourcesStack', {
        summary: 'Sample API resources stack',
    });

    const { getHandler } = new SampleEndpointStacks(scope, 'SampleApiStack', {
        apiEndpointLambdaSecurityGroup,
    });

    const stack = new SampleApiStack(scope, 'SampleApiStack', {
        summary: 'API lambdas for the sample API',
        sampleGet: getHandler,
    });

    expect.addSnapshotSerializer({
        test: (val: string) => typeof val === 'string' && !!val.match(/([A-Fa-f0-9]{64})\.(jar|zip)/),
        print: (val) => (typeof val === 'string' ? '"[HASH REMOVED]"' : ''),
    });

    const template = Template.fromStack(stack);
    // THEN
    expect(template).toMatchSnapshot();
});
