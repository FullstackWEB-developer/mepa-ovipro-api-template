import middy from '@middy/core';
import httpHeaderNormalizer from '@middy/http-header-normalizer';
import jsonBodyParser from '@middy/http-json-body-parser';
import { APIGatewayEvent, APIGatewayProxyResult, Context } from 'aws-lambda';
import 'reflect-metadata';
import createError, { HttpError } from 'http-errors';
import { validate } from 'uuid';
import { SampleAuthorizer } from '../../../api/auth/authorizer/SampleAuthorizer';
import { getUserFromRequest } from '../../../api/auth/has-permission/userdetails';
import { components } from '../../../api/generated/api-schema';
import { factory, logRequest, middyLogProxy, provideLogContext } from '../../../utils/logging';
import { errorHandler } from '../../../utils/middleware/error-handler';
import { requestIdHeaderAppender } from '../../../utils/middleware/request-id-header-appender';
import { officeDAO } from '../dao/typeorm/OfficeDAO';
import { SimpleOffice } from '../model/entities/SimpleOffice';

// This is a template sample API Lambda implementation.

const log = factory.getLogger('Office:get');

interface Event {
    body: components['schemas']['GetPlotProperty'];
}

export async function processRequest(event: APIGatewayEvent & Event, context: Context): Promise<APIGatewayProxyResult> {
    try {
        const uuid = event.queryStringParameters?.id;

        // Each request should be logged as soon as possible in the handler processRequest method:
        logRequest({
            description: `Get office by uuid ${uuid}`,
            context,
            event: event,
            log,
        });

        // User token validation:
        const user = getUserFromRequest(event);
        if (!user) {
            log.debug('User not authenticated. Access denied returning 404.');
            throw new createError.NotFound('Entity not found.');
        }

        const office: SimpleOffice | undefined | false = await (!!uuid &&
            validate(uuid || '') &&
            officeDAO.findOneByPublicId(uuid));

        // Exception handling should rely on common error handling utilities. This is a naive example.
        if (!office) {
            throw new createError.NotFound('Entity not found');
        }

        // Endpoints may contain advanced authorization requirements:
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
        .use(httpHeaderNormalizer())
        .use(jsonBodyParser())
        .use(requestIdHeaderAppender())
        .use(errorHandler()),
);
