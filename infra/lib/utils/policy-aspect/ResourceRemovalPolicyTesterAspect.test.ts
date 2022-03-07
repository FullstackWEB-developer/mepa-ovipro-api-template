import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import { ResourceRemovalPolicyTesterAspect } from './ResourceRemovalPolicyTesterAspect';
import { Stack } from '@aws-cdk/core';

test('ResourceRemovalPolicyTesterAspect:destroyPolicyExpected', () => {
    const stack = new Stack();
    stack.node.setContext('environment', 'development');
    stack.node.setContext('account', 'dev');
    const bucket = new s3.Bucket(stack, 'id', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new ResourceRemovalPolicyTesterAspect().visit(bucket);

    expect(bucket.node.metadata).toHaveLength(0);
});

test('ResourceRemovalPolicyTesterAspect:destroyPolicyRejected', () => {
    const stack = new Stack();
    stack.node.setContext('environment', 'production');
    stack.node.setContext('account', 'prod');
    const bucket = new s3.Bucket(stack, 'bucketId', {
        removalPolicy: cdk.RemovalPolicy.DESTROY,
    });
    new ResourceRemovalPolicyTesterAspect().visit(bucket);

    expect(bucket.node.metadataEntry).toHaveLength(1);
    expect(bucket.node.metadataEntry[0].data).toBe(
        `Resource 'bucketId' (S3/Dynamodb) removal policy should be RETAIN or SNAPSHOT in stable envs.`,
    );
});
