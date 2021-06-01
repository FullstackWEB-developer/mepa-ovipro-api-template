import { Connection, EntityManager, EntityTarget, FindConditions, ObjectLiteral, Repository } from 'typeorm';
import { ConnectionFactory } from './ConnectionFactory';

export type CastFind = ObjectLiteral | FindConditions<EntityTarget<unknown>>;

/**
 * Common parameters for base class methods.
 */
export interface Options {
    /**
     * Entity manager. When this is given by the caller, an existing transaction context is assumed.
     */
    transactionalEntityManager?: EntityManager;
    /**
     * If uuid query conditions should be cast to uuid type or not.
     * Some databases and connections require type casting with the current ORM plus driver combo.
     */
    castUuid?: boolean;
}

/**
 * Base class for DAOs. Provides utility methods.
 */
export abstract class BaseDAO {
    /**
     * Get connection. This is just a proxy to ConnectionFactory.
     */
    protected static async getConnection(): Promise<Connection> {
        return await ConnectionFactory.getConnection();
    }

    /**
     * Get entity repository using a new connection or the given manager.
     */
    protected static async getRepository<Entity extends ObjectLiteral>(
        entity: EntityTarget<Entity>,
        transactionalEntityManager?: EntityManager,
    ): Promise<Repository<Entity>> {
        return (
            transactionalEntityManager?.getRepository(entity) ??
            (await ConnectionFactory.getConnection()).getRepository(entity)
        );
    }

    /**
     * Entity findOne by uuid type id method that tries to hide the ugly uuid handling.
     * Query condition is generated using
     */
    protected static async findOneCast<Entity extends ObjectLiteral>(
        uuid: string,
        repository: Repository<Entity>,
        castUuid: boolean,
    ): Promise<Entity | undefined> {
        const where = this.uuidToWhereCondition('id', uuid, castUuid);

        return repository.findOne({ where });
    }

    /**
     * Uuid type incompatibility hack to support both SQLite and PG.
     */
    protected static uuidToWhereCondition(key: string, value: string, castUuid: boolean): CastFind {
        let where: CastFind;
        // PostgreSQL uuid query conditions need a cast parameter, e.g:
        // where: { id: { value: uuid, cast: 'uuid' } }
        if (castUuid) {
            where = {
                [key]: {
                    value,
                    cast: 'uuid',
                },
            };
        } else {
            where = { [key]: value };
        }
        return where;
    }
}
