import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'reflect-metadata';
import { validate } from 'uuid';
import createError, { HttpError } from 'http-errors';
import httpErrorHandler from '@middy/http-error-handler';
import { factory, middyLogProxy } from '../utils/logging';
import { OfficeDAO } from '../dao/typeorm/OfficeDAO';
import { components } from '../../../api/generated/api-schema';

const log = factory.getLogger('Office:get');

interface Event {
    body: components['schemas']['GetPlotProperty'];
}

export async function processRequest(event: APIGatewayEvent & Event, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const uuid = event.queryStringParameters?.id;
        log.debug(
            `Get office by uuid ${uuid} from event ${JSON.stringify({
                query: event.queryStringParameters,
                path: event.path,
                method: event.httpMethod,
                functionName: context.functionName,
                functionVersion: context.functionVersion,
                invokedFunctionArn: context.invokedFunctionArn,
            })}`,
        );
        const officeId = await (!!uuid && validate(uuid || '') && OfficeDAO.findOfficeIdByUuid(uuid));

        if (!officeId) {
            throw new createError.NotFound('Entity not found');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ officeId }),
        };
    } catch (err) {
        log.error('Error', err);
        if (err instanceof HttpError) {
            throw err;
        }
        throw createError(500);
    }
}

/* Sample handler with middy */
export const handler = middy(processRequest as typeof processRequest)
    .use(jsonBodyParser())
    .use(httpErrorHandler({ logger: middyLogProxy(log) }));
