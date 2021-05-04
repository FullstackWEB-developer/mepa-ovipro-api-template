package fi.almamedia.ovipro.migrator.event;

import java.io.Serializable;

public class RequestPayload implements Serializable, Cloneable {

    private static final long serialVersionUID = -661690710136122893L;

    private String env;

    private String bucket;

    private String path;

    public String getEnv() {
        return env;
    }

    public void setEnv(String env) {
        this.env = env;
    }

    public String getBucket() {
        return bucket;
    }

    public void setBucket(String bucket) {
        this.bucket = bucket;
    }

    public String getPath() {
        return path;
    }

    public void setPath(String path) {
        this.path = path;
    }
}
