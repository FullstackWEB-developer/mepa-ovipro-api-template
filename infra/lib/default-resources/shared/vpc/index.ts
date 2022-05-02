import { AC } from '@almamedia-open-source/cdk-project-target';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

const createParameterName = (scope: Construct) => `/${AC.getAccountConfig(scope, 'service')}/VPC_ID`;

export class DefaultVpc extends Construct {
    public readonly vpc: ec2.IVpc;

    /** Creates VPC with private and public subnets, and a VPN gateway */
    constructor(scope: Construct, id: string) {
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
