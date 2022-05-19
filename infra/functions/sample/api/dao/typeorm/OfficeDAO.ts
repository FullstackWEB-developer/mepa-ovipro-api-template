import { SimpleOffice } from '../../model/entities/SimpleOffice';
import { factory } from '../../utils/logging';
import { BaseDAO, Options } from './BaseDAO';

export class OfficeDAO extends BaseDAO<SimpleOffice> {
    async findPublicIdByOfficeId(officeId: number, options?: Options): Promise<{ publicId: string } | undefined> {
        log.debug(`Find office uuid by id ${officeId}`);
        const { transactionalEntityManager } = options || {};

        const query = `select public_id from office where id = $1;`;
        const manager = transactionalEntityManager || (await BaseDAO.getConnection()).manager;
        const result = await manager.query(query, [officeId]);
        return result.length === 1 ? { publicId: result[0].public_id } : undefined;
    }

    async findOneByPublicId(publicId: string, options?: Options): Promise<SimpleOffice | undefined> {
        log.debug(`Find realty by uuid ${publicId}`);
        const { transactionalEntityManager } = options || {};
        const where = BaseDAO.uuidToWhereCondition('publicId', publicId);
        const repository = await super.getRepository(undefined, transactionalEntityManager);
        return repository.findOne({ where });
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
