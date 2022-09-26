import { AC } from '@alma-cdk/project';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as elb from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as ssm from 'aws-cdk-lib/aws-ssm';
import { Construct } from 'constructs';

const createParameterName = (scope: Construct, suffix: string) =>
    `/${AC.getAccountConfig(scope, 'service')}/ALB_${suffix}`;

/**
 * ALB stack
 */
export class DefaultAlb extends Construct {
    public readonly alb: elb.IApplicationLoadBalancer;
    public readonly albSecurityGroup: ec2.ISecurityGroup;
    public readonly albDefaultListener: elb.IApplicationListener;

    /** Creates Alb and an internal security group for the alb */
    constructor(scope: Construct, id: string) {
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

        const albSecurityGroup = ec2.SecurityGroup.fromLookupById(
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
            securityGroup: albSecurityGroup,
            defaultPort: 80,
        });

        this.alb = alb;
        this.albSecurityGroup = albSecurityGroup;
        this.albDefaultListener = albDefaultListener;
    }
}
