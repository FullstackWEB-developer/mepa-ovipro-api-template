import { EC } from '@almamedia-open-source/cdk-project-target';
import * as cdk from 'aws-cdk-lib';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as nodejslambda from 'aws-cdk-lib/aws-lambda-nodejs';
import * as logs from 'aws-cdk-lib/aws-logs';
import { pascalCase } from 'change-case';
import { Construct } from 'constructs';

export interface Props {
    /** Lambda code asset location as string. */
    entry: string;
    /** Lambda description */
    description: string;
    /**
     * Lambda timeout in seconds.
     * @defaultValue 30
     */
    timeout?: cdk.Duration;
    /**
     * Lambda memory in MB.
     * @defaultValue 1024
     */
    memorySize?: number;
    /**
     * Lambda Cloudwatch log retention period.
     * @defaultValue 1 month
     */
    logRetention?: logs.RetentionDays;
    /** Lambda environment properties */
    environment: EnvironmentProps;
    /**
     * Securitygroup for the function
     *
     * Same for every other function in an API
     */
    securityGroup?: ec2.ISecurityGroup;
    /**
     * Type of x-ray tracing for lambda.
     * Default ACTIVE
     * For example lambda listening SQS need custom x-ray logic in handler
     */
    tracingType?: lambda.Tracing;
    /**
     * Limits amount of concurrent lambda executions
     */
    reservedConcurrencyLimit?: number;
}

/**
 * Handler-specific additional environment properties as a list of key-value pairs.
 */
interface EnvironmentProps {
    MODULE_NAME: 'RealtyAPI' | 'MarketingAPI';
    [key: string]: string;
}

/**
 * Basic Lambda construct. Has no permissions set by default.
 * This can be used when ApiLambda shouldn't be used. For example when Lambda is triggered by something else than ApiGW.
 */
export class DefaultLambda extends Construct {
    public readonly handler: lambda.IFunction;

    /** Creates a sample lambda */
    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const {
            environment,
            entry,
            description,
            timeout,
            memorySize,
            logRetention,
            securityGroup,
            tracingType,
            reservedConcurrencyLimit,
        } = props;

        const environmentName = pascalCase(EC.getName(this));

        const handler = new nodejslambda.NodejsFunction(this, id, {
            handler: 'handler',
            entry,
            runtime: lambda.Runtime.NODEJS_14_X,
            timeout: timeout || cdk.Duration.seconds(30),
            description,
            memorySize: memorySize || 1024,
            logRetention: logRetention || logs.RetentionDays.ONE_MONTH,
            environment: {
                ENVIRONMENT: environmentName,
                SERVICE_NAME: pascalCase(id),
                ...environment,
            },
            reservedConcurrentExecutions: reservedConcurrencyLimit ? reservedConcurrencyLimit : undefined,
            depsLockFilePath: 'package-lock.json',
            bundling: {
                externalModules: ['aws-sdk', 'pg-native'],
            },
            tracing: tracingType ? tracingType : lambda.Tracing.ACTIVE,
            securityGroups: securityGroup ? [securityGroup] : undefined,
        });
        this.handler = handler;

        /**
         * Added error metric for future use in Dashboard
         */
        handler.metricErrors({
            statistic: 'avg',
            period: cdk.Duration.minutes(1),
            label: 'Lambda failure rate',
        });

        /**
         * Added alarm to Function if
         */
        handler.metricErrors().createAlarm(this, 'Alarm', {
            threshold: 100,
            evaluationPeriods: 2,
        });

        this.handler = handler;
    }
}
