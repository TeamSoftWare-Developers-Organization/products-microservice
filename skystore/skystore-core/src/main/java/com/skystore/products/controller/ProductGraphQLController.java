package com.skystore.products.controller;

import com.skystore.products.domain.Product;
import com.skystore.products.repository.ProductRepository;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;
import java.util.List;

@Controller
public class ProductGraphQLController {

    private final ProductRepository productRepository;

    public ProductGraphQLController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @QueryMapping
    public List<Product> products(@Argument int limit) {
        return productRepository.findAll().stream().limit(limit > 0 ? limit : 20).toList();
    }

    @SuppressWarnings("null")
	@QueryMapping
    public Product productById(@Argument Long id) {
        return productRepository.findById(id).orElse(null);
    }

    @QueryMapping
    public List<Product> searchProducts(@Argument String keyword) {
        return productRepository.findByNameContainingIgnoreCase(keyword);
    }

    @MutationMapping
    public Product createProduct(@Argument CreateProductInput input) {
        Product product = new Product(
                input.name(),
                input.description(),
                BigDecimal.valueOf(input.price()),
                input.stockQuantity(),
                input.imageUrl()
        );
        return productRepository.save(product);
    }

    @MutationMapping
    public Product updateStock(@Argument Long id, @Argument Integer quantity) {
        @SuppressWarnings("null")
		Product product = productRepository.findById(id).orElse(null);
        if (product != null) {
            product.setStockQuantity(quantity);
            return productRepository.save(product);
        }
        return null;
    }

    public record CreateProductInput(String name, String description, Double price, Integer stockQuantity, String imageUrl) {}
}