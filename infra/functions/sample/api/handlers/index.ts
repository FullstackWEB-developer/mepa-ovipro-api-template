import middy from '@middy/core';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'reflect-metadata';
import { validate } from 'uuid';
import createError, { HttpError } from 'http-errors';
import httpErrorHandler from '@middy/http-error-handler';
import { factory, middyLogProxy, provideLogContext, logRequest } from '../utils/logging';
import { officeDAO } from '../dao/typeorm/OfficeDAO';
import { components } from '../generated/api-schema';
import { SampleAuthorizer } from '../../../api/auth/authorizer/SampleAuthorizer';
import { SimpleOffice } from '../model/entities/SimpleOffice';
import { getUserFromRequest } from '../../../api/auth/has-permission/userdetails';

const log = factory.getLogger('Office:get');

interface Event {
    body: components['schemas']['GetPlotProperty'];
}

export async function processRequest(event: APIGatewayEvent & Event, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const uuid = event.queryStringParameters?.id;
        logRequest({
            description: `Get office by uuid ${uuid}`,
            context,
            event: event,
            log,
        });

        const user = getUserFromRequest(event);
        if (!user) {
            log.debug('User not authenticated. Access denied returning 404.');
            throw new createError.NotFound('Entity not found.');
        }

        const office: SimpleOffice | undefined | false = await (!!uuid &&
            validate(uuid || '') &&
            officeDAO.findOneByPublicId(uuid));

        if (!office) {
            throw new createError.NotFound('Entity not found');
        }

        if (!SampleAuthorizer.INSTANCE.canView(user, office)) {
            throw new createError.NotFound('Entity not found');
        }

        return {
            statusCode: 200,
            body: JSON.stringify({ office }),
        };
    } catch (err) {
        log.error('Error', err as Error);
        if (err instanceof HttpError) {
            throw err;
        }
        throw new createError.InternalServerError();
    }
}

export const handler = provideLogContext(
    middy(processRequest)
        .use(jsonBodyParser())
        .use(httpErrorHandler({ logger: middyLogProxy(log) })),
);