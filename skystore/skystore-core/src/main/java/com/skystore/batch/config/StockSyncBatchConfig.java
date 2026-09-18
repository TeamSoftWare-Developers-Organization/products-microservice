package com.skystore.batch.config;

import com.skystore.batch.dto.StockUpdateRecord;
import com.skystore.products.domain.Product;
import com.skystore.products.repository.ProductRepository;
import org.springframework.batch.core.Job;
import org.springframework.batch.core.Step;
import org.springframework.batch.core.job.builder.JobBuilder;
import org.springframework.batch.core.repository.JobRepository;
import org.springframework.batch.core.step.builder.StepBuilder;
import org.springframework.batch.item.ItemProcessor;
import org.springframework.batch.item.ItemReader;
import org.springframework.batch.item.ItemWriter;
import org.springframework.batch.item.support.ListItemReader;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.transaction.PlatformTransactionManager;

import java.math.BigDecimal;
import java.util.List;

@Configuration
public class StockSyncBatchConfig {

    private final ProductRepository productRepository;

    public StockSyncBatchConfig(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @Bean
    public ItemReader<StockUpdateRecord> stockUpdateReader() {
        // محاكاة قراءة ملف أو سحب بيانات دفعية مجدولة من مستودع المورد
        List<StockUpdateRecord> mockUpdates = List.of(
            new StockUpdateRecord(1L, 100, BigDecimal.valueOf(2299.99)),
            new StockUpdateRecord(2L, 50, BigDecimal.valueOf(899.50))
        );
        return new ListItemReader<>(mockUpdates);
    }

    @Bean
    public ItemProcessor<StockUpdateRecord, Product> stockUpdateProcessor() {
        return record -> {
            Product product = productRepository.findById(record.productId()).orElse(null);
            if (product != null) {
                product.setStockQuantity(record.newStock());
                product.setPrice(record.adjustedPrice());
            }
            return product;
        };
    }

    @Bean
    public ItemWriter<Product> stockUpdateWriter() {
        return items -> productRepository.saveAll(items.getItems());
    }

    @Bean
    public Step syncStockStep(JobRepository jobRepository, PlatformTransactionManager txManager) {
        return new StepBuilder("syncStockStep", jobRepository)
                .<StockUpdateRecord, Product>chunk(500, txManager) // المعالجة في دفعات سريعة من 500 عنصر
                .reader(stockUpdateReader())
                .processor(stockUpdateProcessor())
                .writer(stockUpdateWriter())
                .build();
    }

    @Bean
    public Job syncStockJob(JobRepository jobRepository, Step syncStockStep) {
        return new JobBuilder("syncStockJob", jobRepository)
                .start(syncStockStep)
                .build();
    }
}
