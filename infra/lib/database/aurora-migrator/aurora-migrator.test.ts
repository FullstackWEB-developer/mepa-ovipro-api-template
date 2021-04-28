import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { Sc } from '@almamedia/cdk-accounts-and-environments';
import { SynthUtils } from '@aws-cdk/assert';
import { Name } from '@almamedia/cdk-tag-and-name';
import { OviproEnvironmentSharedResource } from '../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';
import { createCdkTestContext } from '../../../__test__/context';
import { AuroraMigratorStack } from '../aurora-migrator';
import { MigrationBucketStack } from '../migration-bucket';

test('Aurora Migrator', () => {
    // GIVEN
    const scope = createCdkTestContext();


    const sharedResource = new OviproEnvironmentSharedResource(scope, 'SharedResource');
    const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);
    const rdsClusterSGId = sharedResource.import(SharedResourceType.DATABASE_SECURITY_GROUP_ID);
    const database = rds.ServerlessCluster.fromServerlessClusterAttributes(scope, 'DefaultServerlessCluster', {
        clusterIdentifier,
    });
    const auroraSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(scope, 'SG', rdsClusterSGId, {
       mutable: false
    });
    const secretArn = sharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
    const secret = sm.Secret.fromSecretCompleteArn(scope, 'SharedDatabaseSecret', secretArn);

    const { s3Bucket: migrationsBucket } = new MigrationBucketStack(scope, 'MigrationBucketStack', {
        stackName: Name.stack(scope, 'MigrationBucketStack'),
        ...Sc.defineProps(scope, 'Migration bucket for OviPRO infrastructure'),
    });

    const stack = new AuroraMigratorStack(scope, 'AuroraMigratorStack', {
        stackName: Name.stack(scope, 'AuroraMigratorStack'),
        ...Sc.defineProps(scope, 'Serverless Aurora cluster migrator for OviPRO infrastructure'),
        auroraCredentialsSecret: secret,
        auroraSecurityGroup: auroraSecurityGroup,
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
