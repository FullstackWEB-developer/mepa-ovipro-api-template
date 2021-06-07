import * as cdk from '@aws-cdk/core';
import * as s3 from '@aws-cdk/aws-s3';
import * as dynamodb from '@aws-cdk/aws-dynamodb';
import { Ec } from '@almamedia/cdk-accounts-and-environments';
import { Annotations } from '@aws-cdk/core';

/**
 * Bucket removal policy verifier/tester checks that stable environments have
 * RETAIN policies on buckets.
 */
export class ResourceRemovalPolicyTesterAspect implements cdk.IAspect {
    public visit(node: cdk.IConstruct): void {
        if (node instanceof s3.Bucket || node instanceof dynamodb.Table) {
            const cfn = node.node.defaultChild as cdk.CfnResource;
            if (node instanceof cdk.Construct && Ec.isStable(node)) {
                if (
                    !cfn.cfnOptions.deletionPolicy ||
                    ![cdk.CfnDeletionPolicy.SNAPSHOT, cdk.CfnDeletionPolicy.RETAIN].includes(
                        cfn.cfnOptions.deletionPolicy,
                    )
                ) {
                    Annotations.of(node).addError(
                        `Resource '${node.node.id}' (S3/Dynamodb) removal policy should be RETAIN or SNAPSHOT in stable envs.`,
                    );
                }
            } else {
                if (!cfn.cfnOptions.deletionPolicy || cfn.cfnOptions.deletionPolicy !== cdk.CfnDeletionPolicy.DELETE) {
                    Annotations.of(node).addError(
                        `Make sure to define a removal policy for resource '${node.node.id}' (S3/Dynamodb) in non-stable envs.`,
                    );
                }
            }
        }
    }
}
