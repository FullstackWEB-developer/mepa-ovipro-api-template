package fi.almamedia.ovipro.migrator;

import org.apache.commons.lang3.exception.ExceptionUtils;

import com.amazonaws.services.lambda.runtime.Context;
import com.amazonaws.services.lambda.runtime.RequestHandler;

import fi.almamedia.ovipro.migrator.event.RequestPayload;
import fi.almamedia.ovipro.migrator.event.ResponsePayload;
import fi.almamedia.ovipro.migrator.event.ResponsePayload.Status;
import fi.almamedia.ovipro.migrator.filehandler.S3FileProvider;
import fi.almamedia.ovipro.migrator.flyway.FlywayConfigurer;
import fi.almamedia.ovipro.migrator.flyway.FlywayMigrator;
import fi.almamedia.ovipro.migrator.schemaprovider.SchemaProvider;
import fi.almamedia.ovipro.migrator.secrets.SecretsManagerSecretsProvider;
import software.amazon.lambda.powertools.logging.Logging;
import software.amazon.lambda.powertools.metrics.Metrics;
import software.amazon.lambda.powertools.tracing.Tracing;

/**
 * Handler for requests to Lambda function.
 */
public class App implements RequestHandler<RequestPayload, ResponsePayload> {

    /**
     * Migration handler method.
     */
    @Override
    @Metrics(captureColdStart = true)
    @Tracing
    @Logging(logEvent = true)
    public ResponsePayload handleRequest(final RequestPayload input, final Context context) {

        try {
            EnvConfiguration env = getEnvConfiguration();

            final FlywayMigrator migrator = new FlywayMigrator(
                    new FlywayConfigurer(env.secretArn, new SecretsManagerSecretsProvider()),
                    new S3FileProvider(env.bucketName, "migrations"),
                    new SchemaProvider());

            return ResponsePayload.Builder.anItem()
                    .withStatus(Status.SUCCESS)
                    .withBody(Integer.toString(migrator.migrate()))
                    .build();

        } catch (Exception e) {
            return ResponsePayload.Builder.anItem()
                    .withErrors(ExceptionUtils.getStackTrace(e))
                    .withStatus(Status.ERROR)
                    .build();
        }
    }

    /**
     * Database cleanup handler method for dev purposes.
     */
    @Metrics(captureColdStart = true)
    @Tracing
    @Logging(logEvent = true)
    public ResponsePayload handleCleanupRequest(final RequestPayload input, final Context context) {

        try {
            EnvConfiguration env = getEnvConfiguration();

            final FlywayMigrator migrator = new FlywayMigrator(
                    new FlywayConfigurer(env.secretArn, new SecretsManagerSecretsProvider()),
                    new S3FileProvider(env.bucketName, "migrations"),
                    new SchemaProvider());

            migrator.clean();
            return ResponsePayload.Builder.anItem()
                    .withStatus(Status.SUCCESS)
                    .build();

        } catch (Exception e) {
            return ResponsePayload.Builder.anItem()
                    .withErrors(ExceptionUtils.getStackTrace(e))
                    .withStatus(Status.ERROR)
                    .build();
        }
    }

    private EnvConfiguration getEnvConfiguration() {
        EnvConfiguration conf = new EnvConfiguration(System.getenv("BUCKET_NAME"), System.getenv("SECRET_ARN"));
        return conf;
    }

    private static class EnvConfiguration {

        private final String bucketName;
        /** DB user credentials via a Secret Manager secret. */
        private final String secretArn;

        public EnvConfiguration(String bucketName, String secretArn) {
            this.bucketName = bucketName;
            this.secretArn = secretArn;
        }
    }
}
