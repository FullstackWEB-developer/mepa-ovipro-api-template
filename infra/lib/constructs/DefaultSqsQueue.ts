import { AC, EC } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import { PolicyStatement } from 'aws-cdk-lib/aws-iam';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { CustomDeadLetterQueue } from './CustomDeadLetterQueue';

interface Props {
    /** Create dead letter queue for sqs queue. default true */
    createDLQ?: boolean;
    queueProps?: sqs.QueueProps;
}

/**
 * Default SQS construct with basic cloudwatch alarms and possibility to create dead letter queue.
 */
export class DefaultSqsQueue extends Construct {
    public readonly queue: sqs.Queue;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const { createDLQ = true, queueProps = {} } = props;

        let deadLetterQueue: CustomDeadLetterQueue;
        if (createDLQ) {
            deadLetterQueue = new CustomDeadLetterQueue(this, `${id}DeadLetterQueue`, {
                queuePrefix: id,
            });
        } else {
            NagSuppressions.addResourceSuppressions(this, [
                {
                    id: 'AwsSolutions-SQS3',
                    reason: 'Dead letter queue is explicitly disabled',
                },
            ]);
        }

        const sqsQueue = new sqs.Queue(this, `${id}Queue`, {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore typescript not liking assigning deadLetterQueue inside if
            deadLetterQueue: deadLetterQueue,
            visibilityTimeout: cdk.Duration.seconds(120),
            // To encrypt use CMS:
            // https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-key-management.html#sqs-what-permissions-for-sse
            // encryption: sqs.QueueEncryption.KMS_MANAGED,
            ...queueProps,
        });

        // For cost optimization, create alarms only in stable envs
        if (EC.isStable(this) || EC.isVerification(this) || AC.isMock(this)) {
            // SQS error alarm
            const sqsQueueMetric = sqsQueue
                .metricApproximateAgeOfOldestMessage()
                .with({ period: cdk.Duration.minutes(5), statistic: 'max' });

            new cloudwatch.Alarm(scope, `ApproximateAgeOfOldestMessageErrors-${id}-${EC.getName(this)}`, {
                metric: sqsQueueMetric,
                threshold: 120,
                datapointsToAlarm: 1,
                evaluationPeriods: 3,
                alarmDescription: `${id}: ApproximateAgeOfOldestMessage errors`,
            });

            // Anomaly detector for SQS
            new cloudwatch.CfnAnomalyDetector(this, `MaxMessageAgeAnomaly-${EC.getName(this)}`, {
                metricName: sqsQueueMetric.metricName,
                namespace: 'AWS/SQS',
                stat: 'Maximum',
                dimensions: [
                    {
                        name: 'QueueName',
                        value: sqsQueue.queueName,
                    },
                ],
            });
        }

        this.queue = sqsQueue;
    }
}
