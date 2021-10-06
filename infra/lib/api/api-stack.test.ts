import { ApiStack } from '../api';
import { createCdkTestContext } from '../../__test__/context';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Sc } from '@almamedia/cdk-accounts-and-environments';
import { SynthUtils } from '@aws-cdk/assert';

test('api-stack', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const stack = new ApiStack(scope, 'SampleApiStack', {
        stackName: Name.stack(scope, 'SampleApi'),
        ...Sc.defineProps(scope, 'API lambdas for the sample API'),
    });

    expect.addSnapshotSerializer({
        test: (val: string) => typeof val === 'string' && !!val.match(/AssetParameters([A-Fa-f0-9]{64})(\w+)/),
        print: () => '"AssetParameters-[HASH REMOVED]"',
    });

    expect.addSnapshotSerializer({
        test: (val: string) =>
            typeof val === 'string' && !!val.match(/(\w+) for asset\s?(version)?\s?"([A-Fa-f0-9]{64})"/),
        print: (val) =>
            typeof val === 'string'
                ? '"' + val.replace(/(\w+ for asset)\s?(version)?\s?"([A-Fa-f0-9]{64})"/, '$1 [HASH REMOVED]') + '"'
                : '',
    });

    // THEN
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
