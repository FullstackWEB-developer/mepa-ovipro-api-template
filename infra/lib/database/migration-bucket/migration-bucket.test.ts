import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { Sc } from '@almamedia/cdk-accounts-and-environments';
import { SynthUtils } from '@aws-cdk/assert';
import { Name } from '@almamedia/cdk-tag-and-name';
import { createCdkTestContext } from '../../../__test__/context';
import { MigrationBucketStack } from '../migration-bucket';

test('MigrationBucket', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const stack = new MigrationBucketStack(scope, 'MigrationBucketStack', {
        stackName: Name.stack(scope, 'MigrationBucketStack'),
        ...Sc.defineProps(scope, 'Migration bucket for OviPRO infrastructure'),
    });

    // THEN
    expect(SynthUtils.toCloudFormation(stack)).toMatchSnapshot();
});

test('MigrationBucket:deletionPolicy', () => {
    // GIVEN
    const scope = createCdkTestContext();

    const { s3Bucket } = new MigrationBucketStack(scope, 'MigrationBucketStack', {
        stackName: Name.stack(scope, 'MigrationBucketStack'),
        ...Sc.defineProps(scope, 'Migration bucket for OviPRO infrastructure'),
    });

    // THEN
    const bucket = s3Bucket.node.defaultChild as s3.CfnBucket;
    expect(bucket.cfnOptions.deletionPolicy).toBe(cdk.CfnDeletionPolicy.DELETE);
});
