import path from 'path';
import { GenericContainer, StartedTestContainer, Wait } from 'testcontainers';

//
// This file contains utilities for setting up DB containers for integration testing.
// A DB test will first invoke setUpTestContainer(config) to initialize a Docker container,
// then executeSchemaSetup() to populate the container database with schema and additionally data.
//

const staticPort = (process.env.TEST_PORT && parseInt(process.env.TEST_PORT)) || undefined;

const dbConfig: { port: number; database: 'postgres'; username: string; password: string } = {
    port: staticPort || 5432,
    database: 'postgres',
    username: 'postgres',
    password: 'foobar',
};

type StartedContainerConfig = {
    container: StartedTestContainer;
    config: {
        port: number;
        database: string;
        username: string;
        password: string;
    };
};

/**
 * Method sets up a default test database in a container. The container image is in a separate Dockerfile
 * in the DB folder. Docker finds and exposes a random free port on the host machine, which is returned
 * by the method.
 * @returns container handle and database config
 */
export async function setUpTestContainer(): Promise<StartedContainerConfig> {
    const setupFile = path.resolve(__dirname, './../../../../../../../db/java');

    const build = await GenericContainer.fromDockerfile(setupFile).build();
    const container = await build
        .withExposedPorts(5432)
        .withStartupTimeout(120_000)
        .withWaitStrategy(Wait.forLogMessage('PostgreSQL init process complete; ready for start up.'))
        // Matches the user credential in the initial 001_CREATE_USERS.SQL.
        .withEnv('POSTGRES_PASSWORD', 'foobar')
        .start();

    // Use this to stream container logs to console instead of viewing the container via the Docker dashboard.
    /*
    const stream = await container.logs();
    stream
        .on('data', (line) => console.log(line))
        .on('err', (line) => console.error(line))
        .on('end', () => console.log('Stream closed'));
        */

    // Override the port definition with the container port that was mapped for connections.
    const mappedPort = container.getMappedPort(5432);

    return {
        container,
        config: {
            ...dbConfig,
            // Port used to connect to the PostgreSQL JDBC port in the container from outside.
            port: mappedPort,
        },
    };
}

const sqlExecutionCommand = ['psql', '-U', 'ovipro', '-f'];
const sqlFileBasePath = '/tmp/migrate/';

/**
 * Method executes schema SQL files inside the test container.
 */
export const executeSchemaSetup = async (container: StartedTestContainer | undefined): Promise<void> => {
    if (container) {
        // To extend with manual schema setup scripts:
        // await container.exec([...sqlExecutionCommand, `${sqlFileBasePath}/V001__base.sql`]);
    }
};

export const executeSqlFileInContainer = async (
    container: StartedTestContainer,
    file: 'universal-organization-dataset.sql',
): Promise<void> => {
    await container.exec([...sqlExecutionCommand, `${sqlFileBasePath}${file}`]);
};
