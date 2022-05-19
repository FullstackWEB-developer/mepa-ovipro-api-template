import {
    CloudFormationCustomResourceEvent,
    CloudFormationCustomResourceDeleteEvent,
    CloudFormationCustomResourceCreateEvent,
    CloudFormationCustomResourceUpdateEvent,
    CloudFormationCustomResourceResponse,
} from 'aws-lambda';
import AWS from 'aws-sdk';

const lambda = new AWS.Lambda();

// See documentation at handler.

/**
 * Invoke the next item in an additional chain of init functions.
 */
const invokeInitChain = async () => {
    const initChain = process.env.INIT_CHAIN;

    console.info(`Invoke init chain ${initChain}`);

    const chainedNonVerifiedArns = (initChain || '').split(',');

    const chainedArns = chainedNonVerifiedArns.map((arn) => arn.trim()).filter((arn) => arn.length > 0);

    // Invoke the first function in the chain. Delegate the rest of the chain to the invoked function.
    try {
        if (chainedArns.length > 0) {
            const arn = chainedArns[0];
            const [, ...childChain] = chainedArns;
            const payload = childChain.length > 0 ? `{ "chain": "${childChain.join(',')}" }` : '{}';

            console.debug('Invoke: %s with: %s', arn, payload);

            const request = lambda.invoke({ FunctionName: arn, Payload: payload, InvocationType: 'Event' });
            const response = await request.promise();

            if (response.FunctionError) {
                console.error(`Error invoking function ${arn}: ${response.FunctionError}`);
            } else {
                console.debug(`Invoke response code ${response.StatusCode}, body: ${response.Payload}`);
            }
        }
    } catch (err) {
        console.error(`Error invoking chain ${chainedArns}: ${err}`);
    }
};

/**
 * Run migrations scripts when event is CREATE
 *
 * NOTE: currently handles also UPDATE-events
 *
 * @param event
 * @returns cfnresponse
 */
const onCreate = async (
    event: CloudFormationCustomResourceCreateEvent | CloudFormationCustomResourceUpdateEvent,
): Promise<CloudFormationCustomResourceResponse> => {
    console.info(`create new resource with props ${JSON.stringify(event.ResourceProperties)}`);
    console.info(`init chain: ${process.env.INIT_CHAIN || ''}`);
    // If multiple resources are created this cant be hardcoded
    const physicalId = 'DatabaseInitMigrationResource';

    try {
        console.info({ event });

        await invokeInitChain();

        console.info('Init chain invoke complete.');

        return {
            PhysicalResourceId: physicalId,
            Status: 'SUCCESS',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `created database and user for migrations`,
        };
    } catch (e) {
        return {
            PhysicalResourceId: physicalId,
            Status: 'FAILED',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `failed with error ${e}`,
        };
    }
};

const onDelete = (event: CloudFormationCustomResourceDeleteEvent): CloudFormationCustomResourceResponse => {
    // If multiple resources are created this cant be hardcoded
    const physicalId = event.PhysicalResourceId;
    console.info(`delete resource ${physicalId}`);

    return {
        PhysicalResourceId: physicalId,
        Status: 'SUCCESS',
        RequestId: event.RequestId,
        StackId: event.StackId,
        LogicalResourceId: event.LogicalResourceId,
        Reason: `deleted resource successfully`,
    };
};

const onUpdate = async (
    event: CloudFormationCustomResourceUpdateEvent,
): Promise<CloudFormationCustomResourceResponse> => {
    // If multiple resources are created this cant be hardcoded
    const physicalId = event.PhysicalResourceId;
    console.info(`update resource ${physicalId}, no actions`);

    try {
        await invokeInitChain();

        return {
            PhysicalResourceId: physicalId,
            Status: 'SUCCESS',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `updated resource successfully`,
        };
    } catch (e) {
        return {
            PhysicalResourceId: physicalId,
            Status: 'FAILED',
            RequestId: event.RequestId,
            StackId: event.StackId,
            LogicalResourceId: event.LogicalResourceId,
            Reason: `failed with error ${e}`,
        };
    }
};

/**
 * This is a custom resource handler, see https://docs.aws.amazon.com/cdk/api/latest/docs/custom-resources-readme.html.
 * When receiving resource CREATE and UPDATE events this Lambda invokes asynchronously a chain of lambdas,
 * which are configured in an environment variable process.env.INIT_CHAIN.
 */
export async function handler(event: CloudFormationCustomResourceEvent): Promise<CloudFormationCustomResourceResponse> {
    console.info({ event });

    switch (event.RequestType) {
        case 'Create':
            return await onCreate(event);
        case 'Update':
            return await onUpdate(event);
        case 'Delete':
            return onDelete(event);
    }

    throw new Error('RequestType is invalid!');
}
