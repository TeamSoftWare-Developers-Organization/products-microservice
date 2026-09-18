package com.skystore.cart.service;

import com.skystore.cart.domain.Cart;
import com.skystore.cart.domain.CartItem;
import com.skystore.products.domain.Product;
import com.skystore.products.repository.ProductRepository;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Service;

import java.util.concurrent.TimeUnit;

@Service
public class CartService {

    private static final String CART_PREFIX = "cart:";
    private static final long CART_TTL_DAYS = 7;

    private final RedisTemplate<String, Object> redisTemplate;
    private final ProductRepository productRepository;

    public CartService(RedisTemplate<String, Object> redisTemplate, ProductRepository productRepository) {
        this.redisTemplate = redisTemplate;
        this.productRepository = productRepository;
    }

    public Cart getCart(String userId) {
        String key = CART_PREFIX + userId;
        Cart cart = (Cart) redisTemplate.opsForValue().get(key);
        if (cart == null) {
            cart = new Cart(userId);
        }
        return cart;
    }

    /**
     * @param userId
     * @param productId
     * @param quantity
     * @return
     */
    @SuppressWarnings("null")
	public Cart addToCart(String userId, String productId, Integer quantity) {
        Cart cart = getCart(userId);
        
        // التحقق من وجود المنتج وسعره من MariaDB
        Product product = productRepository.findById(Long.valueOf(productId))
                .orElseThrow(() -> new IllegalArgumentException("المنتج غير موجود: " + productId));

        // التحقق مما إذا كان العنصر مضافاً مسبقاً
        cart.getItems().stream()
                .filter(item -> item.getProductId().equals(productId))
                .findFirst()
                .ifPresentOrElse(
                        existingItem -> existingItem.updateQuantity(existingItem.getQuantity() + quantity),
                        () -> cart.getItems().add(new CartItem(productId, product.getName(), product.getPrice().doubleValue(), quantity))
                );

        cart.recalculateTotal();
        saveCart(cart);
        return cart;
    }

    public Cart removeFromCart(String userId, String productId) {
        Cart cart = getCart(userId);
        cart.getItems().removeIf(item -> item.getProductId().equals(productId));
        cart.recalculateTotal();
        saveCart(cart);
        return cart;
    }

    public boolean clearCart(String userId) {
        String key = CART_PREFIX + userId;
        return Boolean.TRUE.equals(redisTemplate.delete(key));
    }

    private void saveCart(Cart cart) {
        String key = CART_PREFIX + cart.getUserId();
        redisTemplate.opsForValue().set(key, cart, CART_TTL_DAYS, TimeUnit.DAYS);
    }
}