import { Connection } from 'typeorm';
import { CastFind } from './BaseDAO';
import { ConnectionFactory, uuidCastingRequired } from './ConnectionFactory';

export abstract class QueryDAO {
    /**
     * Get connection. This is just a proxy to ConnectionFactory.
     */
    protected static async getConnection(): Promise<Connection> {
        return await ConnectionFactory.getConnection();
    }

    /**
     * Uuid type incompatibility hack to support both SQLite and PG.
     */
    protected static uuidToWhereCondition(key: string, value: string): CastFind {
        let where: CastFind;
        // Data API Serverless PostgreSQL uuid query conditions need a cast parameter, e.g:
        // where: { id: { value: uuid, cast: 'uuid' } }
        if (uuidCastingRequired) {
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
