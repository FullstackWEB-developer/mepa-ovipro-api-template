import * as rds from 'aws-cdk-lib/aws-rds';
import { Construct } from 'constructs';
import { OviproEnvironmentSharedResource } from '../../../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../../../utils/shared-resources/types';

export class DefaultAuroraCluster extends Construct {
    public readonly database: rds.IServerlessCluster;

    /** Creates a Serverless Aurora database */
    constructor(scope: Construct, id: string) {
        super(scope, id);

        /**
         * Import existing RDS cluster's identifier
         */
        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);

        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(this, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });

        this.database = database;
    }
}
