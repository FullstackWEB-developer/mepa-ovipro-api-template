import * as cdk from 'aws-cdk-lib';
import * as s3 from 'aws-cdk-lib/aws-s3';
import { Stack } from 'aws-cdk-lib/core';
import { ResourceRemovalPolicyTesterAspect } from './ResourceRemovalPolicyTesterAspect';

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

    expect(bucket.node.metadata).toHaveLength(1);
    expect(bucket.node.metadata[0].data).toBe(
        "Resource 'bucketId' (S3/Dynamodb) removal policy should be RETAIN or SNAPSHOT in stable envs.",
    );
});
