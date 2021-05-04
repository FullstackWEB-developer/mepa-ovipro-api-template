import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as s3 from '@aws-cdk/aws-s3';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as logs from '@aws-cdk/aws-logs';
import * as rds from '@aws-cdk/aws-rds';
import { Ec } from '@almamedia/cdk-accounts-and-environments';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Duration } from '@aws-cdk/core';
import { DefaultVpc } from '../../default-resources/shared/vpc';
import { OviproEnvironmentSharedResource } from '../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';

interface Props extends cdk.StackProps {
    migrationsBucket: s3.Bucket;
}

/**
 * This stack deploys Lambda DB tools for schema migration for the given Serverless cluster.
 * Required parameters: vpc, cluster and specific cluster user credentials via a Secret manager secret.
 */
export class AuroraMigratorStack extends cdk.Stack {
    public readonly handlers: lambda.IFunction[];

    constructor(scope: cdk.Construct, id: string, props: Props) {
        super(scope, id, props);


        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const clusterIdentifier = sharedResource.import(SharedResourceType.DATABASE_CLUSTER_IDENTIFIER);
        const rdsClusterSGId = sharedResource.import(SharedResourceType.DATABASE_SECURITY_GROUP_ID);
        const database = rds.ServerlessCluster.fromServerlessClusterAttributes(this, 'DefaultServerlessCluster', {
            clusterIdentifier,
        });
        const auroraSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', rdsClusterSGId, {
           mutable: false
        });
        let secretArn = sharedResource.import(SharedResourceType.DATABASE_READ_WRITE_SECRET_ARN);
        if (secretArn.includes('dummy-value-for-'))
            secretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        const secret = sm.Secret.fromSecretCompleteArn(this, 'SharedDatabaseSecret', secretArn);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');
        const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'MigratorLambdaSecurityGroup', {
            vpc,
        });

        auroraSecurityGroup.addIngressRule(
            auroraSecurityGroup,
            ec2.Port.tcp(5432),
            'From Lambda migrator to Aurora cluster',
            true,
        );

        const migrator = this.createHandler(
            props,
            'Migrator',
            'fi.almamedia.ovipro.migrator.App::handleRequest',
            auroraSecurityGroup,
            vpc,
            secret,
        );

        this.handlers = [migrator];

        // Cleaner function is only included in select environments,
        // since we don't want to encourage erasing live environments like prod.
        if (Ec.isDevelopment(this)) {
            const cleaner = this.createHandler(
                props,
                'Cleaner',
                'fi.almamedia.ovipro.migrator.App::handleCleanupRequest',
                auroraSecurityGroup,
                vpc,
                secret,
            );
            this.handlers.push(cleaner);
        }
    }

    /**
     * Create Lambda handlers from the same Java package with different handler methods.
     * @param props Stack props.
     * @param id Lambda id.
     * @param handler Java Lambda handler method reference.
     * @param lambdaSecurityGroup Security group for all lambdas in this stack.
     */
    private createHandler(
        props: Props,
        id: string,
        handler: string,
        lambdaSecurityGroup: ec2.ISecurityGroup,
        vpc: ec2.IVpc,
        auroraCredentialsSecret: sm.ISecret,
    ) {
        const { migrationsBucket } = props;

        const fn = new lambda.Function(this, id, {
            functionName: Name.withProject(this, id),
            handler,
            code: lambda.Code.fromAsset('functions/database/aurora/migrator/target/migrator-lambda-package.zip'),
            description: 'Database schema migration/cleaner utility: ' + Name.withProject(this, id),
            runtime: lambda.Runtime.JAVA_11,
            memorySize: 512,
            timeout: Duration.seconds(599),
            environment: {
                POWERTOOLS_SERVICE_NAME: Name.withProject(this, id),
                POWERTOOLS_METRICS_NAMESPACE: Name.withProject(this, handler),
                BUCKET_NAME: migrationsBucket.bucketName,
                SECRET_ARN: auroraCredentialsSecret.secretArn,
            },
            // Enable X-ray
            tracing: lambda.Tracing.ACTIVE,
            vpc,
            logRetention: logs.RetentionDays.ONE_MONTH,
            securityGroups: [lambdaSecurityGroup],
        });

        migrationsBucket.grantRead(fn);
        auroraCredentialsSecret.grantRead(fn);
        return fn;
    }
}