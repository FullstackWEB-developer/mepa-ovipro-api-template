import { BaseDAO, Options } from './BaseDAO';
import { factory } from '../../utils/logging';
import { Office } from '../../model/entities/Office';

export class OfficeDAO extends BaseDAO {
    static async findPublicIdByOfficeId(
        officeId: number,
        options?: Options,
    ): Promise<{ publicId: string } | undefined> {
        log.debug(`Find office uuid by id ${officeId}`);
        const { transactionalEntityManager } = options || {};

        const query = `select public_id from office where id = $1;`;
        const manager = transactionalEntityManager || (await BaseDAO.getConnection()).manager;
        const result = await manager.query(query, [officeId]);
        return result.length === 1 ? { publicId: result[0].public_id } : undefined;
    }

    static async findOfficeIdByUuid(uuid: string, options?: Options): Promise<{ id: number } | undefined> {
        log.debug(`Find office id by uuid ${uuid}`);
        const { transactionalEntityManager } = options || {};

        const query = `select id from office where public_id = $1::uuid;`;
        const manager = transactionalEntityManager || (await BaseDAO.getConnection()).manager;
        const result = await manager.query(query, [uuid]);
        return result.length === 1 ? { id: result[0].office_id } : undefined;
    }

    /**
     * Persist office. Return id.
     */
    static async insert(office: Office, options?: Options): Promise<string> {
        log.debug(`Create office ${JSON.stringify(office)}`);
        const { transactionalEntityManager } = options || {};
        const repository = await BaseDAO.getRepository(Office, transactionalEntityManager);
        return (await repository.insert(office)).identifiers[0].id;
    }
}

const log = factory.getLogger(OfficeDAO.name);
