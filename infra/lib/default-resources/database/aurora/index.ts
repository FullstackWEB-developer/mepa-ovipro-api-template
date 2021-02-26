import * as cdk from '@aws-cdk/core';
import * as rds from '@aws-cdk/aws-rds';
import { OviproSharedResource } from '../../../utils/shared-resources/OviproSharedResource';
import { SharedResourceType } from '../../../utils/shared-resources/types';

export class DefaultAuroraCluster extends cdk.Construct {
    public readonly database: rds.IServerlessCluster;

    /** Creates a Serverless Aurora database */
    constructor(scope: cdk.Construct, id: string) {
        super(scope, id);

        /**
         * Import existing RDS cluster's identifier
         */
        const sharedResource = new OviproSharedResource(this, 'SharedResource');
        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(scope, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });

        this.database = database;
    }
}
