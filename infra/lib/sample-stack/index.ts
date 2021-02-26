import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import { IVpc } from '@aws-cdk/aws-ec2';

interface Props extends cdk.StackProps {
    vpc: IVpc;
}

export class SampleStack extends cdk.Stack {
    public readonly cluster: ecs.Cluster;

    /** Creates an ECS Cluster inside given VPC */
    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        const cluster = new ecs.Cluster(this, 'SampleClusterWithVpc', {
            vpc: props.vpc,
        });

        this.cluster = cluster;
    }
}
