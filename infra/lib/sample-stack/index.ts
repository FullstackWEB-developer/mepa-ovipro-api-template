import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import { DefaultVpc } from '../default-resources/shared/vpc';

export class SampleStack extends cdk.Stack {
    public readonly cluster: ecs.Cluster;

    /** Creates an ECS Cluster inside given VPC */
    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');

        const cluster = new ecs.Cluster(this, 'SampleClusterWithVpc', {
            vpc,
        });

        this.cluster = cluster;
    }
}
