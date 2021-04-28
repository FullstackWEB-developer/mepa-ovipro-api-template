package fi.almamedia.ovipro.migrator.flyway;

import java.util.List;
import java.util.stream.Collectors;

import org.flywaydb.core.Flyway;
import org.flywaydb.core.api.FlywayException;
import org.json.JSONObject;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import fi.almamedia.ovipro.migrator.secrets.SecretsProvider;

public class FlywayConfigurer {

    static final Logger LOG = LoggerFactory.getLogger(FlywayConfigurer.class);

    private static final String FLYWAY_CONFIG_ERROR = "Unable to configure Flyway due to missing url, username or password";

    private final FlywayConfig config;

    public FlywayConfigurer(String secretArn, SecretsProvider secretsProvider) {
        this.config = new FlywayConfig();
        final JSONObject secret = new JSONObject(secretsProvider.getValue(secretArn));
        config.password = secret.getString("password");
        config.username = secret.getString("username");
        config.url = "jdbc:postgresql://" + secret.getString("host") + ":5432";
        config.db = "ovipro";
        LOG.info("Database: {}, db {}, user", config.url, config.db, config.username);
    }

    public final Flyway configure(List<String> migrationFilePaths, List<String> schemas) {
        LOG.info("Setting up Flyway config. Running migrations: {}", migrationFilePaths);

        if (config.url != null && !config.url.isEmpty()
                && config.db != null && !config.db.isEmpty()
                && config.username != null && !config.username.isEmpty()
                && config.password != null && !config.password.isEmpty()) {
            String dbUrl = String.format("%s/%s", config.url, config.db);

            LOG.info("Connecting to " + dbUrl);
            return Flyway.configure()
                    .dataSource(dbUrl, config.username, config.password)
                    .schemas(schemas.toArray(new String[] {}))
                    .locations(migrationFilePaths.stream()
                            .map(path -> "filesystem:" + path).collect(Collectors.toList()).toArray(new String[] {}))
                    .load();

        } else {
            throw new FlywayException(FLYWAY_CONFIG_ERROR);
        }
    }

    public static class FlywayConfig {

        private String url;

        private String db;

        private String username;

        private String password;

        public FlywayConfig() {
        }
    }
}
