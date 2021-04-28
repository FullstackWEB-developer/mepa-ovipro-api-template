import * as cdk from '@aws-cdk/core';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as rds from '@aws-cdk/aws-rds';
import { EnvironmentConstruct, Sc } from '@almamedia/cdk-accounts-and-environments';
import { Tag, Name } from '@almamedia/cdk-tag-and-name';
import { DefaultVpc } from './default-resources/shared/vpc';
import { addMepaTags } from './utils/tags';
import { OviproEnvironmentSharedResource } from './utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from './utils/shared-resources/types';
import { AuroraMigratorStack } from './database/aurora-migrator';
import { MigrationBucketStack } from './database/migration-bucket';
import { SampleStack } from './sample-stack';

export class Environment extends EnvironmentConstruct {
    /**Defines environmental CDK Stacks. */
    constructor(scope: cdk.Construct) {
        super(scope);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');

        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);
        const rdsClusterSGId = sharedResource.import(SharedResourceType.DATABASE_SECURITY_GROUP_ID);
        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(scope, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });
        const auroraSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', rdsClusterSGId, {
           mutable: false
        });
        const secretArn = sharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
        const secret = sm.Secret.fromSecretCompleteArn(scope, 'SharedDatabaseSecret', secretArn);

        const { s3Bucket: migrationsBucket } = new MigrationBucketStack(this, 'MigrationBucketStack', {
            stackName: Name.stack(this, 'MigrationBucketStack'),
            ...Sc.defineProps(this, 'Migration bucket'),
        });

        new AuroraMigratorStack(this, 'AuroraMigratorStack', {
            stackName: Name.stack(this, 'AuroraMigratorStack'),
            ...Sc.defineProps(this, 'Aurora migrator Lambda'),
            auroraCredentialsSecret: secret,
            migrationsBucket,
            auroraSecurityGroup,
        });

        new SampleStack(this, 'SampleStack', {
            stackName: Name.stack(this, 'Alb'),
            ...Sc.defineProps(this, 'Alb stack for OviPRO infrastructure'),
            vpc,
        });

        // Tag all stacks with default tags
        Tag.defaults(this.node.children as cdk.Construct[]);
        // Tag all stacks with Mepa-tags
        addMepaTags(this.node.children as cdk.Construct[]);
    }
}
