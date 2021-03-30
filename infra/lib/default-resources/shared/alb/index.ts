import * as cdk from '@aws-cdk/core';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as ssm from '@aws-cdk/aws-ssm';
import { Ac } from '@almamedia/cdk-accounts-and-environments';

const createParameterName = (scope: cdk.Construct, suffix: string) =>
    `/${Ac.getConfig(scope, 'service')}/ALB_${suffix}`;

/**
 * ALB stack
 */
export class DefaultAlb extends cdk.Construct {
    public readonly alb: elb.IApplicationLoadBalancer;
    public readonly albSecurityGroup: ec2.ISecurityGroup;
    public readonly albDefaultListener: elb.IApplicationListener;

    /** Creates Alb and an internal security group for the alb */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        /**
         * Import shared alb's loadBalancerArn
         */
        const loadBalancerArn = ssm.StringParameter.valueFromLookup(
            this,
            createParameterName(this, 'LOAD_BALANCER_ARN'),
        );

        const alb = elb.ApplicationLoadBalancer.fromLookup(this, 'ApplicationLoadBalancer', {
            loadBalancerArn,
        });

        const albSecurityGroupId = ssm.StringParameter.valueFromLookup(
            this,
            createParameterName(this, 'LOAD_BALANCER_SECURITY_GROUP_ID'),
        );

        const albSecurityGroup = ec2.SecurityGroup.fromLookup(
            this,
            'ApplicationLoadBalancerSecurityGroup',
            albSecurityGroupId,
        );

        const albDefaultListenerArn = ssm.StringParameter.valueFromLookup(
            this,
            createParameterName(this, 'LOAD_BALANCER_SECURITY_GROUP_ID'),
        );

        const albDefaultListener = elb.ApplicationListener.fromApplicationListenerAttributes(this, 'DefaultListener', {
            listenerArn: albDefaultListenerArn,
            securityGroupId: albSecurityGroupId,
            defaultPort: 80,
        });

        this.alb = alb;
        this.albSecurityGroup = albSecurityGroup;
        this.albDefaultListener = albDefaultListener;
    }
}
