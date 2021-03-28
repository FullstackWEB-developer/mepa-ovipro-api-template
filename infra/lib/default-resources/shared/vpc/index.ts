import * as cdk from '@aws-cdk/core';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ssm from '@aws-cdk/aws-ssm';
import { Ac } from '@almamedia/cdk-accounts-and-environments';

const createParameterName = (scope: cdk.Construct) => `/${Ac.getConfig(scope, 'service')}/VPC_ID`;

export class DefaultVpc extends cdk.Construct {
    public readonly vpc: ec2.IVpc;

    /** Creates VPC with private and public subnets, and a VPN gateway */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        /**
         * Import account specific vpc's vpc-id
         *
         * Differs from other shared resources, because VPC is account speficic
         */

        const vpcId = ssm.StringParameter.valueFromLookup(this, createParameterName(this));

        const vpc = ec2.Vpc.fromLookup(this, 'DefaultVpc', {
            vpcId,
        });

        this.vpc = vpc;
    }
}
