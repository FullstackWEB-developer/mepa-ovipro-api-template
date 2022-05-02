import { Template } from 'aws-cdk-lib/assertions';
import { createCdkTestContext } from '../../../__test__/context';
import { AuroraMigratorStack } from '../aurora-migrator';

test('Aurora Migrator', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const stack = new AuroraMigratorStack(scope, 'AuroraMigratorStack', {
        summary: 'Serverless Aurora cluster migrator for OviPRO infrastructure',
    });
    const template = Template.fromStack(stack);
    // THEN

    // no need to test for assetparameter hashes
    expect.addSnapshotSerializer({
        test: (val: string) => typeof val === 'string' && !!val.match(/([A-Fa-f0-9]{64})\.(jar|zip)/),
        print: (val) => (typeof val === 'string' ? '"[HASH REMOVED]"' : ''),
    });
    expect(template).toMatchSnapshot();
});
