package fi.almamedia.ovipro.migrator.secrets;

import com.amazonaws.services.secretsmanager.AWSSecretsManager;
import com.amazonaws.services.secretsmanager.AWSSecretsManagerClientBuilder;
import com.amazonaws.services.secretsmanager.model.GetSecretValueRequest;
import com.amazonaws.services.secretsmanager.model.GetSecretValueResult;

public class SecretsManagerSecretsProvider implements SecretsProvider {

    @Override
    public String getValue(String secret) {
        AWSSecretsManager manager = ManagerProvider.get();
        GetSecretValueResult result = manager.getSecretValue(new GetSecretValueRequest().withSecretId(secret));
        return result.getSecretString();
    }

    private static class ManagerProvider {

        private static AWSSecretsManager manager;

        private static AWSSecretsManager get() {
            if (manager == null) {
                manager = AWSSecretsManagerClientBuilder.standard()
                        .withRegion("eu-west-1")
                        .build();
            }
            return manager;
        }
    }
}
