package fi.almamedia.ovipro.migrator.filehandler;

import java.util.List;

@FunctionalInterface
public interface FileProvider {

    List<String> getFilePaths();
}
