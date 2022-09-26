import { BaseDAO, Options } from '../../../../utils/dao/typeorm/BaseDAO';
import { QueryDAO } from '../../../../utils/dao/typeorm/QueryDAO';
import { factory } from '../../../../utils/logging';
import { SimpleOffice } from '../../model/entities/SimpleOffice';

export class OfficeDAO extends BaseDAO<SimpleOffice> {
    async findPublicIdByOfficeId(officeId: number, options?: Options): Promise<{ publicId: string } | undefined> {
        log.debug(`Find office uuid by id ${officeId}`);
        const { transactionalEntityManager } = options || {};

        const query = `select public_id from office where id = $1;`;
        const manager = transactionalEntityManager || (await BaseDAO.getConnection()).manager;
        const result = await manager.query(query, [officeId]);
        return result.length === 1 ? { publicId: result[0].public_id } : undefined;
    }

    async findOneByPublicId(uuid: string, options?: Options): Promise<{ id: number; publicId: string } | undefined> {
        log.debug(`Find office id by uuid ${uuid}`);
        const { transactionalEntityManager } = options || {};

        const query = 'select office_id, public_id from common.office where public_id = $1::uuid;';
        const manager = transactionalEntityManager || (await QueryDAO.getConnection()).manager;
        const result = await manager.query(query, [uuid]);
        return result.length === 1 ? { id: result[0].office_id, publicId: result[0].public_id } : undefined;
    }

    /**
     * Persist office. Return id as string.
     */
    async insert(office: SimpleOffice, options?: Options): Promise<string> {
        log.debug(`Create office ${JSON.stringify(office)}`);
        const { transactionalEntityManager } = options || {};
        const repository = await super.getRepository(SimpleOffice, transactionalEntityManager);
        return (await repository.insert(office)).identifiers[0].id;
    }
}

export const officeDAO = new OfficeDAO(SimpleOffice);

const log = factory.getLogger(OfficeDAO.name);
