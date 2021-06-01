import { mocked } from 'ts-jest/utils';
import { Office } from '../../../model/entities/Office';
import { JsonUtils } from '../../../utils/JsonUtils';
import { createConnectionForTests } from '../../../utils/__tests__/db/connectionMock';
import { ConnectionFactory } from '../ConnectionFactory';
import { OfficeDAO } from '../OfficeDAO';

/**
 * Test PlotsDAO methods.
 */
describe('OfficeDAO', () => {
    ConnectionFactory.getConnection = jest.fn();

    describe('OfficeDAO:findId', () => {
        beforeEach(async () => {
            mocked(ConnectionFactory.getConnection).mockResolvedValue(createConnectionForTests());
        });

        afterEach(async () => {
            const connection = await createConnectionForTests();
            await connection.createQueryBuilder().delete().from('office').execute();
        });

        test('Success', async () => {
            const office = new Office();
            office.id = 1;
            office.publicId = '07afb10c-f376-4c95-bae1-e047f57d3b6c';

            const resultId = await OfficeDAO.insert(office);
            const result = await OfficeDAO.findPublicIdByOfficeId(Number.parseInt(resultId));
            expect(JsonUtils.stringifyClean(result)).toEqual(JsonUtils.stringifyClean({ publicId: office.publicId }));
        });

        test('NotFound', async () => {
            const result = await OfficeDAO.findOfficeIdByUuid('07afb10c-f376-4c95-bae1-e047f57d3b6c', {
                castUuid: false,
            });
            expect(result).toBeUndefined();
        });
    });
});
