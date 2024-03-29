import * as fs from 'fs';
import { SmartStack, Name } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as sm from 'aws-cdk-lib/aws-secretsmanager';
import { Duration } from 'aws-cdk-lib/core';
import * as cr from 'aws-cdk-lib/custom-resources';
import { Construct } from 'constructs';
import { DefaultVpc } from '../../default-resources/shared/vpc';
import { OviproEnvironmentSharedResource } from '../../utils/shared-resources/OviproEnvironmentSharedResource';
import { SharedResourceType } from '../../utils/shared-resources/types';

const MIGRATION_SCRIPTS_PATH = '../db/java/src/main/resources';
const MIGRATION_SCRIPTS_FILES_PATH = `${MIGRATION_SCRIPTS_PATH}/db/migration`;

/**
 * This stack deploys Lambda DB tools for schema migration for the given Serverless cluster.
 * Required parameters: vpc, cluster and specific cluster user credentials via a Secret manager secret.
 */
export class AuroraMigratorStack extends SmartStack {
    public readonly handlers: lambda.IFunction[];

    constructor(scope: Construct, id: string, props: cdk.StackProps) {
        super(scope, id, props);

        const sharedResource = new OviproEnvironmentSharedResource(this, 'SharedResource');
        const rdsClusterSGId = sharedResource.import(SharedResourceType.DATABASE_SECURITY_GROUP_ID);

        const auroraSecurityGroup = ec2.SecurityGroup.fromSecurityGroupId(this, 'SG', rdsClusterSGId);
        let secretArn = sharedResource.import(SharedResourceType.DATABASE_MIGRATOR_SECRET_ARN);
        if (secretArn.includes('dummy-value-for-')) {
            secretArn = 'arn:aws:service:eu-central-1:123456789012:secret:entity-123456';
        }
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
            'TemplateMigrator',
            lambda.Code.fromAsset('functions/database/aurora/migrator/target/ovi-pro-migrator-lambda-package.zip'),
            'fi.almamedia.ovipro.commonenvironment.migrator.App::handleFileMigrationRequest',
            lambdaSecurityGroup,
            vpc,
            secret,
        );

        const invoker = new nodejslambda.NodejsFunction(this, 'TemplateMigratorInvoker', {
            handler: 'handler',
            entry: 'functions/resource-event-callback-invoker/index.ts',
            runtime: lambda.Runtime.NODEJS_14_X,
            memorySize: 512,
            description: 'Custom resource ResourceEventMigratorInvoker that invokes Migrator on resource events',
            functionName: Name.withProject(this, 'TemplateMigratorInvoker'),
            timeout: cdk.Duration.seconds(10),
            logRetention: logs.RetentionDays.ONE_MONTH,
            depsLockFilePath: 'package-lock.json',
            bundling: {
                externalModules: ['aws-sdk', 'pg-native'],
            },
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
                // Make migrations trigger based on the number of migration files.
                update: `MIGRATION_FILE_COUNT_${fs.readdirSync(MIGRATION_SCRIPTS_FILES_PATH).length}`,
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
