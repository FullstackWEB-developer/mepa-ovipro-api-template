import * as cdk from '@aws-cdk/core';
import * as ec from '@aws-cdk/aws-elasticache';
import * as ec2 from '@aws-cdk/aws-ec2';
import { Name } from '@almamedia/cdk-tag-and-name';
import { OviproSharedResource } from '../../../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../../../utils/shared-resources/types';

interface Props extends cdk.StackProps {
    vpc: ec2.Vpc;
}

export class ElastiCacheStack extends cdk.Stack {
    public readonly clusterClientSecurityGroup: ec2.SecurityGroup;

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);

        /**
         * Import shared cluster's name
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const clusterName = sharedResource.import(SharedResourceType.CACHE_CLUSTER_NAME);

        /**
         * !!!!NOTE!!!!
         *
         * I have no idea if this works yet
         */
        /** Create Redis cache cluster */
        const redis = new ec.CfnCacheCluster(this, 'CacheCluster', {
            clusterName,
        });
    }
}
