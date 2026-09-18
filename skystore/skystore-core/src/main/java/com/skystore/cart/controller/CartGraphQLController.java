package com.skystore.cart.controller;

import com.skystore.cart.domain.Cart;
import com.skystore.cart.service.CartService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

@Controller
public class CartGraphQLController {

    private final CartService cartService;

    public CartGraphQLController(CartService cartService) {
        this.cartService = cartService;
    }

    @QueryMapping
    public Cart cart(@Argument String userId) {
        return cartService.getCart(userId);
    }

    @MutationMapping
    public Cart addToCart(@Argument String userId, @Argument CartItemInput input) {
        return cartService.addToCart(userId, input.productId(), input.quantity());
    }

    @MutationMapping
    public Cart removeFromCart(@Argument String userId, @Argument String productId) {
        return cartService.removeFromCart(userId, productId);
    }

    @MutationMapping
    public Boolean clearCart(@Argument String userId) {
        return cartService.clearCart(userId);
    }

    public record CartItemInput(String productId, Integer quantity) {}
}