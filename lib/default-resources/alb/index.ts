import * as cdk from '@aws-cdk/core';
import * as elb from '@aws-cdk/aws-elasticloadbalancingv2';
import { OviproSharedResource } from '../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';

/**
 * ALB stack
 */
export class DefaultAlb extends cdk.Construct {
    public readonly alb: elb.IApplicationLoadBalancer;

    /** Creates Alb and an internal security group for the alb */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        /**
         * Import shared alb's loadBalancerArn
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const loadBalancerArn = sharedResource.import(SharedResourceType.ALB_LOAD_BALANCER_ARN);

        const alb = elb.ApplicationLoadBalancer.fromLookup(scope, 'ApplicationLoadBalancer', {
            loadBalancerArn,
        });

        this.alb = alb;
    }
}
