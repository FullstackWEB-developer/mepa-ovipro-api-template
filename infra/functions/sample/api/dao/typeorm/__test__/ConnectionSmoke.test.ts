import { mocked } from 'ts-jest/utils';
import { createConnectionForTests } from '../../../utils/__tests__/db/connectionMock';
import { ConnectionFactory } from '../ConnectionFactory';
import { OfficeDAO } from '../OfficeDAO';

// Smoke test schema entities and schema generation by querying a memory db.
describe('ConnectionSmoke', () => {
    ConnectionFactory.getConnection = jest.fn();

    beforeEach(async () => {
        mocked(ConnectionFactory.getConnection).mockResolvedValue(createConnectionForTests());
    });

    test('Office', async () => {
        const result = await OfficeDAO.findOfficeIdByUuid('test', { castUuid: false });
        expect(result).toBeUndefined();
    });
});
