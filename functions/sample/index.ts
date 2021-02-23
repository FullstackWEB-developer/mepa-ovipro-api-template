import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import correlationIds from '@dazn/lambda-powertools-middleware-correlation-ids';
import createHttpError from 'http-errors';
import JSONErrorHandlerMiddleware from 'middy-middleware-json-error-handler';
import { captureFunc, Subsegment } from 'aws-xray-sdk';
import { APIGatewayEvent } from 'aws-lambda';

async function processRequest(event: APIGatewayEvent): Promise<unknown> {
    console.log({ event });

    const name = event.queryStringParameters?.name;

    if (name == null) {
        // If you throw an error with status code, the error will be returned as stringified JSON.
        // Only the stack will be omitted.
        throw createHttpError(400, 'query is missing name!');
    }

    /**
     * X-ray annotation sample
     *
     * Adds annotation with key "name", which can then be used in search etc.
     */
    captureFunc('annotations', (subsegment: Subsegment | undefined) => {
        subsegment?.addAnnotation('name', name);
    });

    return {
        statusCode: 200,
        body: JSON.stringify({ message: `howdy ${name}` }),
    };
}

// X-ray tracing

/* Sample handler with middy */
export const handler = middy(processRequest)
    .use(correlationIds({ sampleDebugLogRate: 0.01 }))
    .use(jsonBodyParser())
    .use(JSONErrorHandlerMiddleware());
