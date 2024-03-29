/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path';
import { HttpError } from 'http-errors';
import { Connection } from 'typeorm';
import { SampleAuthorizer } from '../../../../api/auth/authorizer/SampleAuthorizer';
import { testLambdaHandler, TestLambdaInputOutputOptions } from '../../../../utils/__tests__/lambda';
import { ConnectionFactory } from '../../../../utils/dao/typeorm/ConnectionFactory';
import { officeDAO } from '../../dao/typeorm/OfficeDAO';

jest.mock('../../../../api/auth/has-permission/userdetails', () => {
    const originalModule = jest.requireActual('../../../../api/auth/has-permission/userdetails');
    return {
        // eslint-disable-next-line @typescript-eslint/naming-convention
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
            jest.mocked(SampleAuthorizer.INSTANCE.canView).mockReturnValue(true);
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
                    const mockConnection = jest.mocked(Connection);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                    officeDAO.findOneByPublicId = jest.fn();
                    jest.mocked(officeDAO.findOneByPublicId).mockResolvedValue({ id: 123, publicId: '1234' });
                    jest.mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
                },
            },
        );

        testLambdaHandler('NotFound', options, {
            beforeHandler: () => {
                ConnectionFactory.getConnection = jest.fn();
                const mockConnection = jest.mocked(Connection);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                officeDAO.findOneByPublicId = jest.fn();
                jest.mocked(officeDAO.findOneByPublicId).mockResolvedValue(undefined);
                jest.mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
            },
        });

        testLambdaHandler('Error', options, {
            beforeHandler: () => {
                ConnectionFactory.getConnection = jest.fn();
                const mockConnection = jest.mocked(Connection);
                // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                // @ts-ignore
                mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                officeDAO.findOneByPublicId = jest.fn();
                jest.mocked(officeDAO.findOneByPublicId).mockRejectedValue(new Error());
                jest.mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
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
            jest.mocked(SampleAuthorizer.INSTANCE.canView).mockReturnValue(false);
        });

        testLambdaHandler(
            'Auth fails',
            {
                ...options,
            },
            {
                beforeHandler: () => {
                    ConnectionFactory.getConnection = jest.fn();
                    const mockConnection = jest.mocked(Connection);
                    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
                    // @ts-ignore
                    mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
                    officeDAO.findOneByPublicId = jest.fn();
                    jest.mocked(officeDAO.findOneByPublicId).mockResolvedValue({ id: 123, publicId: '1234' });
                    jest.mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
                },
            },
        );
    });
});
