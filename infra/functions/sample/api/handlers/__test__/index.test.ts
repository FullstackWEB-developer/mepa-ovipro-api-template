/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path';
import { HttpError } from 'http-errors';
import { mocked } from 'ts-jest/utils';
import { Connection } from 'typeorm';
import { SampleAuthorizer } from '../../../../api/auth/authorizer/SampleAuthorizer';
import { ConnectionFactory } from '../../dao/typeorm/ConnectionFactory';
import { officeDAO } from '../../dao/typeorm/OfficeDAO';
import { testLambdaHandler, TestLambdaInputOutputOptions } from '../../utils/__tests__/lambda';

jest.mock('../../../../api/auth/has-permission/userdetails', () => {
    const originalModule = jest.requireActual('../../../../api/auth/has-permission/userdetails');
    return {
        __esModule: true,
        ...originalModule,
        getUserFromRequest: jest.fn(() => ({
            accountId: '',
            emailAddress: '',
            globalPermissions: ['PRO_ADMIN'],
            organizationPermissionTree: {
                customerGroups: [],
            },
            defaultOfficeId: '',
        })),
    };
});

describe('Offices:get', () => {
    const options: TestLambdaInputOutputOptions = {
        code: path.resolve(__dirname, '../index.ts'),
    };

    describe('Auth ok', () => {
        beforeEach(async () => {
            SampleAuthorizer.INSTANCE.canView = jest.fn();
            mocked(SampleAuthorizer.INSTANCE.canView).mockReturnValue(true);
        });

        testLambdaHandler(
            'Success',
            {
                ...options,
                parseToJsonKeyPath: 'body',
            },
            {
                beforeHandler: () => {
                    ConnectionFactory.getConnection = jest.fn();
                    const mockConnection = mocked(Connection);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                    officeDAO.findOneByPublicId = jest.fn();
                    mocked(officeDAO.findOneByPublicId).mockResolvedValue({ id: 123, publicId: '1234' });
                    mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
                },
            },
        );

        testLambdaHandler('NotFound', options, {
            beforeHandler: () => {
                ConnectionFactory.getConnection = jest.fn();
                const mockConnection = mocked(Connection);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                officeDAO.findOneByPublicId = jest.fn();
                mocked(officeDAO.findOneByPublicId).mockResolvedValue(undefined);
                mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
            },
        });

        testLambdaHandler('Error', options, {
            beforeHandler: () => {
                ConnectionFactory.getConnection = jest.fn();
                const mockConnection = mocked(Connection);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                officeDAO.findOneByPublicId = jest.fn();
                mocked(officeDAO.findOneByPublicId).mockRejectedValue(new Error());
                mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
            },
            catchHandler: (err) => {
                expect(err).toBeInstanceOf(HttpError);
                expect((<HttpError>err).statusCode).toEqual(500);
            },
        });
    });

    describe('Auth fails', () => {
        beforeEach(async () => {
            SampleAuthorizer.INSTANCE.canView = jest.fn();
            mocked(SampleAuthorizer.INSTANCE.canView).mockReturnValue(false);
        });

        testLambdaHandler(
            'Auth fails',
            {
                ...options,
            },
            {
                beforeHandler: () => {
                    ConnectionFactory.getConnection = jest.fn();
                    const mockConnection = mocked(Connection);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                    officeDAO.findOneByPublicId = jest.fn();
                    mocked(officeDAO.findOneByPublicId).mockResolvedValue({ id: 123, publicId: '1234' });
                    mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
                },
            },
        );
    });
});
