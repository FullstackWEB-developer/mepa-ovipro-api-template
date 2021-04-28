package fi.almamedia.ovipro.migrator.filehandler;

import java.io.File;
import java.util.Collections;
import java.util.List;
import java.util.UUID;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import com.amazonaws.AmazonClientException;
import com.amazonaws.services.s3.AmazonS3;
import com.amazonaws.services.s3.AmazonS3ClientBuilder;
import com.amazonaws.services.s3.transfer.MultipleFileDownload;
import com.amazonaws.services.s3.transfer.Transfer;
import com.amazonaws.services.s3.transfer.TransferManager;
import com.amazonaws.services.s3.transfer.TransferManagerBuilder;

public class S3FileProvider implements FileProvider {

    private static final Logger LOG = LoggerFactory.getLogger(S3FileProvider.class);

    private static final String basePath = "/tmp";

    private final String bucket;

    private final String src;

    private final File downloadDir;

    public S3FileProvider(String bucket, String src) {
        this.bucket = bucket;
        this.src = src;
        this.downloadDir = new File(basePath + "/" + UUID.randomUUID());
    }

    /**
     * Download files and store them locally.
     */
    @Override
    public List<String> getFilePaths() {
        AmazonS3 s3 = ClientProvider.getAmazonS3();

        download(s3);

        return Collections.singletonList(downloadDir.getPath());
    }

    private void download(AmazonS3 s3) {
        TransferManager manager = TransferManagerBuilder.standard().withS3Client(s3).build();

        LOG.info("Download started from bucket {} directory: {}", bucket, src);

        MultipleFileDownload d = manager.downloadDirectory(bucket, src, downloadDir);

        waitForCompletion(d);

        Transfer.TransferState state = d.getState();

        LOG.info("Download completion: {}", state);

        manager.shutdownNow(false);
    }

    private void waitForCompletion(Transfer xfer) {
        try {
            xfer.waitForCompletion();

        } catch (AmazonClientException | InterruptedException e) {
            throw new RuntimeException(e);
        }
    }

    private static class ClientProvider {

        /**
         * Static to enhance Lambda initialization.
         */
        private static AmazonS3 amazonS3;

        private static AmazonS3 getAmazonS3() {
            if (amazonS3 == null) {
                amazonS3 = AmazonS3ClientBuilder.standard()
                        .withRegion("eu-west-1")
                        .build();
            }
            return amazonS3;
        }
    }
}
