import * as cdk from '@aws-cdk/core';
import * as ecs from '@aws-cdk/aws-ecs';
import * as ec2 from '@aws-cdk/aws-ec2';
import { DefaultVpc } from '../vpc';
import { OviproSharedResource } from '../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';

export class DefaultEcsCluster extends cdk.Construct {
    public readonly cluster: ecs.ICluster;

    /** Creates an ECS Cluster inside given VPC */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        const { vpc } = new DefaultVpc(scope, 'DefaultVpc');

        /**
         * Now I dont really know if this should be like this.
         * We have not created explicitly any security groups for the cluster,
         * so we do not have any security groups to import. Yet the cluster import
         * expects securitygroups as a prop, so we create one here. If this causes problems,
         * message Joni.
         *
         * https://github.com/aws/aws-cdk/issues/11146
         */
        const sg = new ec2.SecurityGroup(this, 'SecurityGroupEcsFargate', {
            vpc,
            allowAllOutbound: true,
            description: 'Security Group for Fargate',
        });

        /**
         * Import shared cluster's name
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const clusterName = sharedResource.import(SharedResourceType.ECS_CLUSTER_NAME);

        const cluster = ecs.Cluster.fromClusterAttributes(this, 'EcsCluster', {
            clusterName,
            vpc,
            securityGroups: [sg],
        });

        this.cluster = cluster;
    }
}
