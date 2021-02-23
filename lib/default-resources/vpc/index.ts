import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import { OviproSharedResource } from '../../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../../utils/shared-resources/types';

export class DefaultVpc extends cdk.Construct {
    public readonly vpc: ec2.IVpc;

    /** Creates VPC with private and public subnets, and a VPN gateway */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        // Import an existing VPC from by querying the AWS environment this stack is deployed to
        // TODO: waiting for fix, not working with imported VPC-id at the moment https://github.com/aws/aws-cdk/issues/3600
        // This is a workaround solution
        /**
         * Import shared vpc's vpc-id
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const vpcId = sharedResource.import(SharedResourceType.VPC_ID);

        const vpc = ec2.Vpc.fromLookup(scope, 'DefaultVpc', {
            vpcId,
        });

        this.vpc = vpc;
    }
}
