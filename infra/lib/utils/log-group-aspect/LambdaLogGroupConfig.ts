/**
 * From:
 * https://blog.jannikwempe.com/mastering-aws-cdk-aspects
 */
import { AC } from '@alma-cdk/project';
import { IAspect, RemovalPolicy } from 'aws-cdk-lib';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { LogGroup, LogGroupProps, RetentionDays } from 'aws-cdk-lib/aws-logs';
import { IConstruct } from 'constructs';

export class LambdaLogGroupConfig implements IAspect {
    logGroupProps?: Omit<LogGroupProps, 'logGroupName'>;

    constructor(logGroupProps?: Omit<LogGroupProps, 'logGroupName'>) {
        this.logGroupProps = logGroupProps;
    }

    visit(construct: IConstruct) {
        if (construct instanceof CfnFunction) {
            this.createLambdaLogGroup(construct);
        }
    }

    private createLambdaLogGroup(lambda: CfnFunction) {
        new LogGroup(lambda, 'LogGroup', {
            ...this.logGroupProps,
            logGroupName: `/aws/lambda/${lambda.ref}`,
            retention: AC.isProd(lambda) ? RetentionDays.ONE_MONTH : RetentionDays.ONE_WEEK,
            removalPolicy: RemovalPolicy.DESTROY,
        });
    }
}
