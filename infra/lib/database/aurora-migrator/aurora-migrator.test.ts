import { Sc } from '@almamedia/cdk-accounts-and-environments';
import { SynthUtils } from '@aws-cdk/assert';
import { Name } from '@almamedia/cdk-tag-and-name';
import { createCdkTestContext } from '../../../__test__/context';
import { AuroraMigratorStack } from '../aurora-migrator';

test('Aurora Migrator', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const stack = new AuroraMigratorStack(scope, 'AuroraMigratorStack', {
        stackName: Name.stack(scope, 'AuroraMigratorStack'),
        ...Sc.defineProps(scope, 'Serverless Aurora cluster migrator for OviPRO infrastructure'),
    });
    // THEN

    // no need to test for assetparameter hashes
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
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});
