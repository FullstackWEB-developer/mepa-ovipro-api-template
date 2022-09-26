import { DeepPartial, EntityManager, EntityTarget, FindOptionsWhere, ObjectLiteral, Repository } from 'typeorm';
import { FindOptionsRelations } from 'typeorm/find-options/FindOptionsRelations';
import { ConnectionFactory } from './ConnectionFactory';
import { QueryDAO } from './QueryDAO';

export type CastFind = FindOptionsWhere<EntityTarget<unknown>> | undefined;

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

    relations?: Array<string>;

    /**
     * Default relationLoadStrategy is join which makes left joins for all relations.
     * relationLoadStrategy query will make separate select queries for getting relations.
     * query type can be used when entity contains lots of x-to-many relations to keep result sizes reasonable
     *
     * relationLoadStrategy: "query" fixes error: "Database returned more than the allowed response size limit"
     */
    relationLoadStrategy?: 'join' | 'query';
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
    async getRepository(
        entityType: EntityTarget<Entity> = this.entityType,
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
        relations: Array<string> | FindOptionsRelations<Entity>,
        uuid: string,
        key: string,
        repository: Repository<Entity>,
        relationLoadStrategy?: 'join' | 'query',
    ): Promise<Entity | null> {
        const where = BaseDAO.uuidToWhereCondition(key, uuid);
        return repository.findOne({
            relations: relations,
            where: where as FindOptionsWhere<Entity>,
            relationLoadStrategy,
        });
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
