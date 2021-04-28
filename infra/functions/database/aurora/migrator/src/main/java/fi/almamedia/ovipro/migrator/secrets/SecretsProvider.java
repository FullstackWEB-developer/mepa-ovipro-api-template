package fi.almamedia.ovipro.migrator.secrets;

public interface SecretsProvider {

    String getValue(String secret);
}
