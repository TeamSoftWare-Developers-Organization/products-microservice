package com.skystore.batch.scheduler;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.JobParameters;
import org.springframework.batch.core.JobParametersBuilder;
import org.springframework.batch.core.launch.JobLauncher;
import org.springframework.scheduling.annotation.EnableScheduling;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
@EnableScheduling
public class BatchScheduler {

    private static final Logger log = LoggerFactory.getLogger(BatchScheduler.class);
    private final JobLauncher jobLauncher;
    private final Job syncStockJob;

    public BatchScheduler(JobLauncher jobLauncher, Job syncStockJob) {
        this.jobLauncher = jobLauncher;
        this.syncStockJob = syncStockJob;
    }

    // تشغيل المهمة الدفعية تلقائياً يومياً عند منتصف الليل
    @Scheduled(cron = "0 0 0 * * ?")
    public void runStockSync() {
        try {
            log.info("🚀 بدء تشغيل مهمة مزامنة المخزون (Spring Batch)...");
            JobParameters params = new JobParametersBuilder()
                    .addLong("executionTime", System.currentTimeMillis())
                    .toJobParameters();
            jobLauncher.run(syncStockJob, params);
        } catch (Exception e) {
            log.error("❌ فشل تشغيل الـ Batch Job: {}", e.getMessage());
        }
    }
}
