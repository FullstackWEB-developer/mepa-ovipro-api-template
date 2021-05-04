package fi.almamedia.ovipro.migrator.event;

import java.io.Serializable;

public class ResponsePayload implements Serializable, Cloneable {

    private static final long serialVersionUID = 4921414287672942802L;

    public enum Status {

        ERROR, SUCCESS;
    }

    private String errors;

    private String body;

    private Status status;

    private ResponsePayload(Builder builder) {
        this.errors = builder.errors;
        this.body = builder.body;
        this.status = builder.status;
    }

    public String getErrors() {
        return errors;
    }

    public void setErrors(String errors) {
        this.errors = errors;
    }

    public String getBody() {
        return body;
    }

    public void setBody(String body) {
        this.body = body;
    }

    public Status getStatus() {
        return status;
    }

    public void setStatus(Status status) {
        this.status = status;
    }


    public static final class Builder {
        private String errors;
        private String body;
        private Status status;

        public static Builder anItem() {
            return new Builder();
        }

        private Builder() {
        }

        public Builder withErrors(String errors) {
            this.errors = errors;
            return this;
        }

        public Builder withBody(String body) {
            this.body = body;
            return this;
        }

        public Builder withStatus(Status status) {
            this.status = status;
            return this;
        }

        public ResponsePayload build() {
            return new ResponsePayload(this);
        }
    }

}
