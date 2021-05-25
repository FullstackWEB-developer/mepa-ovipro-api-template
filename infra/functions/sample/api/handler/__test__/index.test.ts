/* eslint-disable @typescript-eslint/no-unused-vars */
import * as path from 'path';
import { mocked } from 'ts-jest/utils';
import { testLambdaHandler, TestLambdaInputOutputOptions } from '../../utils/__tests__/lambda';
import { ConnectionFactory } from '../../dao/typeorm/ConnectionFactory';
import { Connection, EntityManager } from 'typeorm';
import { OfficeDAO } from '../../dao/typeorm/OfficeDAO';

describe('Offices:get', () => {
    const options: TestLambdaInputOutputOptions = {
        code: path.resolve(__dirname, '../index.ts'),
    };

    testLambdaHandler('Success', options, {
        beforeHandler: () => {
            ConnectionFactory.getConnection = jest.fn();
            const mockConnection = mocked(Connection);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
            OfficeDAO.findOfficeIdByUuid = jest.fn();
            mocked(OfficeDAO.findOfficeIdByUuid).mockResolvedValue({ id: 123 });
            mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
        },
    });

    testLambdaHandler('Failure', options, {
        beforeHandler: () => {
            ConnectionFactory.getConnection = jest.fn();
            const mockConnection = mocked(Connection);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            mockConnection.prototype.transaction = jest.fn((method) => method(undefined));
            OfficeDAO.findOfficeIdByUuid = jest.fn();
            mocked(OfficeDAO.findOfficeIdByUuid).mockResolvedValue(undefined);
            mocked(ConnectionFactory.getConnection).mockResolvedValue(mockConnection.prototype);
        },
    });
});
