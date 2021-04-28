import { Sc } from '@almamedia/cdk-accounts-and-environments';
import { SynthUtils } from '@aws-cdk/assert';
import { Name } from '@almamedia/cdk-tag-and-name';
import { createCdkTestContext } from '../../../__test__/context';
import { AuroraClusterStack } from '../../database/aurora';
import { AuroraMigratorStack } from '../aurora-migrator';
import { MigrationBucketStack } from '../migration-bucket';

test('Aurora Migrator', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const auroraStack = new AuroraClusterStack(scope, 'AuroraClusterStack', {
        stackName: Name.stack(scope, 'AuroraClusterStack'),
        ...Sc.defineProps(scope, 'Serverless Aurora cluster for OviPRO infrastructure'),
    });

    const { s3Bucket: migrationsBucket } = new MigrationBucketStack(scope, 'MigrationBucketStack', {
        stackName: Name.stack(scope, 'MigrationBucketStack'),
        ...Sc.defineProps(scope, 'Migration bucket for OviPRO infrastructure'),
    });

    const stack = new AuroraMigratorStack(scope, 'AuroraMigratorStack', {
        stackName: Name.stack(scope, 'AuroraMigratorStack'),
        ...Sc.defineProps(scope, 'Serverless Aurora cluster migrator for OviPRO infrastructure'),
        auroraCredentialsSecret: auroraStack.auroraMigratorCredentialsSecret,
        auroraSecurityGroup: auroraStack.auroraSecurityGroup,
        migrationsBucket,
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
