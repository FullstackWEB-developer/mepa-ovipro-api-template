import { EC, Name } from '@alma-cdk/project';
import * as cdk from 'aws-cdk-lib';
import * as cloudwatch from 'aws-cdk-lib/aws-cloudwatch';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { Construct } from 'constructs';
import { createFifoSqsQueueName } from '../utils/naming';

interface Props {
    queuePrefix: string;
    fifo?: boolean;
}

/**
 * Custom construct for creating a DLQ
 */
export class CustomDeadLetterQueue extends Construct {
    public readonly queue: sqs.Queue;
    public readonly maxReceiveCount: number;

    constructor(scope: Construct, id: string, props: Props) {
        super(scope, id);

        const { queuePrefix, fifo } = props;

        this.maxReceiveCount = 2;

        /**
         * Create queue for DLQ
         *
         * Fifo cant be false, bug in cloudformation
         * https://github.com/aws-cloudformation/aws-cloudformation-coverage-roadmap/issues/165
         */
        const queue = new sqs.Queue(this, Name.withProject(this, queuePrefix + 'DLQ'), {
            fifo: fifo || undefined,
            // Cant use autogenerated name for fifo queue because of https://github.com/aws/aws-cdk/issues/11041
            queueName: fifo
                ? createFifoSqsQueueName(this, queuePrefix, true)
                : Name.withProject(this, queuePrefix + 'DLQ'),
        });

        /**
         * Set created queue as dlq
         */
        this.queue = queue;

        /**
         * Alarms
         */
        const sqsMetric = queue
            .metricNumberOfMessagesReceived()
            .with({ statistic: 'sum', period: cdk.Duration.minutes(5) });

        /**
         * Alarm if any message end up in DLQ
         */
        new cloudwatch.Alarm(this, `NumberOfMessagesReceived-${props.queuePrefix}-${EC.getName(this)}`, {
            metric: sqsMetric,
            threshold: 1,
            datapointsToAlarm: 1,
            evaluationPeriods: 3,
            alarmDescription: 'DeadLetterQueue: NumberOfMessagesReceived',
        });
    }
}
