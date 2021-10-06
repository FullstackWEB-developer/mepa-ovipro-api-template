import { DeepPartial, EntityManager, EntityTarget, FindConditions, ObjectLiteral, Repository } from 'typeorm';
import { ConnectionFactory } from './ConnectionFactory';
import { QueryDAO } from './QueryDAO';

export type CastFind = ObjectLiteral | FindConditions<EntityTarget<unknown>>;

/**
 * Common parameters for base class methods.
 */
export interface Options {
    /**
     * Entity manager. When this is given by the caller, an existing transaction context is assumed.
     */
    transactionalEntityManager?: EntityManager;
}

/**
 * Base class for DAOs. Provides utility methods.
 */
export abstract class BaseDAO<Entity extends ObjectLiteral> extends QueryDAO {
    private entityType: EntityTarget<Entity>;

    constructor(entityType: EntityTarget<Entity>) {
        super();
        this.entityType = entityType;
    }

    /**
     * Get entity repository using a new connection or the given manager.
     * TODO: entityType param is unnecessary and can be dropped.
     * @param entityType Deprecated, unnecessary. Drop the param or use {@link getRepositoryFor} instead.
     */
    protected async getRepository(
        entityType?: EntityTarget<Entity>,
        transactionalEntityManager?: EntityManager,
    ): Promise<Repository<Entity>> {
        return (
            transactionalEntityManager?.getRepository(this.entityType) ??
            (await ConnectionFactory.getConnection()).getRepository(this.entityType)
        );
    }

    /**
     * Type alternative to {@link getRepository}
     */
    protected async getRepositoryFor<T extends ObjectLiteral>(
        entityType: EntityTarget<T>,
        transactionalEntityManager?: EntityManager,
    ): Promise<Repository<T>> {
        return (
            transactionalEntityManager?.getRepository(entityType) ??
            (await ConnectionFactory.getConnection()).getRepository(entityType)
        );
    }

    /**
     * Entity findOne by uuid type id method that tries to hide the ugly uuid handling.
     * Query condition is generated using
     */
    protected async findOneCast(
        uuid: string,
        key: string,
        repository: Repository<Entity>,
        /** @deprecated This flag is set with a global env var. See ConnectionFactory.ts. */
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        castUuid?: boolean,
    ): Promise<Entity | undefined> {
        const where = BaseDAO.uuidToWhereCondition(key, uuid);

        return repository.findOne({ where });
    }

    /**
     * Insert given entity. Returns persisted entity.
     */
    protected async insertReturning(entity: Entity, transactionalEntityManager?: EntityManager): Promise<Entity> {
        const repository = await this.getRepository(undefined, transactionalEntityManager);
        const result = await repository.createQueryBuilder().insert().values(entity).returning('*').execute();
        return repository.create(result.generatedMaps[0] as DeepPartial<Entity>);
    }
}
