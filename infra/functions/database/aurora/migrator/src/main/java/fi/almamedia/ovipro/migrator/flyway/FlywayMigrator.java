package fi.almamedia.ovipro.migrator.flyway;

import org.flywaydb.core.Flyway;

import fi.almamedia.ovipro.migrator.filehandler.FileProvider;
import fi.almamedia.ovipro.migrator.schemaprovider.SchemaProvider;

/**
 * Flyway migrator. Takes in DB configuration and migrations files via a file provider interface.
 * Exposes Flyway methods.
 */
public class FlywayMigrator {

    private final FlywayConfigurer flywayConfigurer;
    private final FileProvider fileProvider;
    private final SchemaProvider schemaProvider;

    public FlywayMigrator(FlywayConfigurer flywayConfigurer, FileProvider fileProvider,
            SchemaProvider schemaProvider) {
        this.flywayConfigurer = flywayConfigurer;
        this.fileProvider = fileProvider;
        this.schemaProvider = schemaProvider;
    }

    /**
     * Run migrations. Returns the number of applied migration files.
     */
    public int migrate() {
        Flyway flyway = configure(Action.MIGRATE);

        return flyway.migrate();
    }

    public void clean() {
        Flyway flyway = configure(Action.CLEAN_UP);

        flyway.clean();
    }

    private Flyway configure(Action action) {
        return flywayConfigurer.configure(
                fileProvider.getFilePaths(), schemaProvider.getSchemas(action == Action.CLEAN_UP));
    }

    private enum Action {

        CLEAN_UP, MIGRATE;
    }
}
