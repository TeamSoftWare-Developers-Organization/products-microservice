package com.skystore.products.repository;

import com.skystore.products.domain.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

/**
 * ProductRepository
 */
public interface ProductRepository extends JpaRepository<Product, Long> {
    List<Product> findByNameContainingIgnoreCase(String keyword);
}