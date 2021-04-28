package fi.almamedia.ovipro.migrator.schemaprovider;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;

public class SchemaProvider {

    public List<String> getSchemas(boolean isCleanup) {
        // Order matters for some methods, e.g. cleanup.
        final List<String> items = Arrays.asList("organization", "common", "public");
        if (!isCleanup) {
            Collections.reverse(items);
        }
        return Collections.unmodifiableList(items);
    }
}
