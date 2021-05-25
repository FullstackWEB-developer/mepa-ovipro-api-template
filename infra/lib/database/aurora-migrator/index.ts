import * as cdk from '@aws-cdk/core';
import * as lambda from '@aws-cdk/aws-lambda';
import * as sm from '@aws-cdk/aws-secretsmanager';
import * as cr from '@aws-cdk/custom-resources';
import * as ec2 from '@aws-cdk/aws-ec2';
import * as logs from '@aws-cdk/aws-logs';
import { Name } from '@almamedia/cdk-tag-and-name';
import { Duration } from '@aws-cdk/core';
import { DefaultVpc } from '../../default-resources/shared/vpc';
import { OviproEnvironmentSharedResource } from '../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';

const MIGRATION_SCRIPTS_PATH = '../db/java/src/main/resources';

/**
 * This stack deploys Lambda DB tools for schema migration for the given Serverless cluster.
 * Required parameters: vpc, cluster and specific cluster user credentials via a Secret manager secret.
 */
export class AuroraMigratorStack extends cdk.Stack {
    public readonly handlers: lambda.IFunction[];

    constructor(scope: cdk.Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const rdsClusterSGId = sharedResource.import(SharedResourceType.DATABASE_SECURITY_GROUP_ID);

        const auroraSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', rdsClusterSGId);
        let secretArn = sharedResource.import(SharedResourceType.DATABASE_MIGRATOR_SECRET_ARN);
        if (secretArn.includes('dummy-value-for-'))
            secretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        const secret = sm.Secret.fromSecretCompleteArn(this, 'SharedDatabaseSecret', secretArn);

        const { vpc } = new DefaultVpc(this, 'DefaultVpc');
        const lambdaSecurityGroup = new ec2.SecurityGroup(this, 'MigratorLambdaSecurityGroup', {
            vpc,
        });

        auroraSecurityGroup.addIngressRule(
            lambdaSecurityGroup,
            ec2.Port.tcp(5432),
            'From Lambda migrator to Aurora cluster',
            true,
        );

        const migrator = this.createHandler(
            props,
            'Migrator',
            lambda.Code.fromAsset('functions/database/aurora/migrator/target/ovi-pro-migrator-lambda-package.zip'),
            'fi.almamedia.ovipro.commonenvironment.migrator.App::handleFileMigrationRequest',
            lambdaSecurityGroup,
            vpc,
            secret,
        );

        const invoker = new lambda.SingletonFunction(this, 'ResourceEventMigratorInvoker', {
            uuid: 'd62d28ce-086e-47fa-b648-d8b02c9f0864',
            handler: 'index.handler',
            code: lambda.Code.fromAsset('dist/functions/resource-event-callback-invoker'),
            runtime: lambda.Runtime.NODEJS_14_X,
            memorySize: 512,
            description: 'Custom resource ResourceEventMigratorInvoker that invokes Migrator on resource events',
            functionName: Name.withProject(this, 'ResourceEventMigratorInvoker'),
            timeout: cdk.Duration.seconds(10),
            logRetention: logs.RetentionDays.ONE_MONTH,
            environment: {
                INIT_CHAIN: migrator.functionArn,
            },
        });

        migrator.grantInvoke(invoker);

        /**
         * Creates CustomResource
         */
        const provider = new cr.Provider(this, 'DatabaseInitProvider', {
            onEventHandler: invoker,
            logRetention: logs.RetentionDays.ONE_DAY,
        });

        new cdk.CustomResource(this, 'DatabaseMigrationInvokerResource', {
            serviceToken: provider.serviceToken,
            properties: {
                update: 'now',
            },
        });

        this.handlers = [migrator];
    }

    /**
     * Create Lambda handlers from the same Java package with different handler methods.
     * @param props Stack props.
     * @param id Lambda id.
     * @param handler Java Lambda handler method reference.
     * @param lambdaSecurityGroup Security group for all lambdas in this stack.
     */
    private createHandler(
        props: cdk.StackProps,
        id: string,
        asset: lambda.Code,
        handler: string,
        lambdaSecurityGroup: ec2.ISecurityGroup,
        vpc: ec2.IVpc,
        auroraCredentialsSecret: sm.ISecret,
    ) {
        const migrationScriptsLayer = new lambda.LayerVersion(this, `${id}MigrationScriptsLayer`, {
            code: lambda.Code.fromAsset(MIGRATION_SCRIPTS_PATH),
        });

        const fn = new lambda.Function(this, id, {
            functionName: Name.withProject(this, id),
            handler,
            code: asset,
            description: 'Database schema migration/cleaner utility: ' + Name.withProject(this, id),
            runtime: lambda.Runtime.JAVA_11,
            memorySize: 512,
            timeout: Duration.seconds(599),
            layers: [migrationScriptsLayer],
            environment: {
                POWERTOOLS_SERVICE_NAME: Name.withProject(this, id),
                POWERTOOLS_METRICS_NAMESPACE: Name.withProject(this, handler),
                BUCKET_NAME: '',
                BUCKET_PATH: '',
                SECRET_ARN: auroraCredentialsSecret.secretArn,
                SCHEMAS: 'template',
            },
            // Enable X-ray
            tracing: lambda.Tracing.ACTIVE,
            vpc,
            logRetention: logs.RetentionDays.ONE_MONTH,
            securityGroups: [lambdaSecurityGroup],
        });

        auroraCredentialsSecret.grantRead(fn);
        return fn;
    }
}
