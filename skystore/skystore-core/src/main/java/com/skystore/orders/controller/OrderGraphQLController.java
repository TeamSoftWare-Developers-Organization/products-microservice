package com.skystore.orders.controller;

import com.skystore.orders.domain.Order;
import com.skystore.orders.service.OrderService;
import org.springframework.graphql.data.method.annotation.Argument;
import org.springframework.graphql.data.method.annotation.MutationMapping;
import org.springframework.graphql.data.method.annotation.QueryMapping;
import org.springframework.stereotype.Controller;

import java.util.List;

@Controller
public class OrderGraphQLController {

    private final OrderService orderService;

    public OrderGraphQLController(OrderService orderService) {
        this.orderService = orderService;
    }

    @MutationMapping
    public Order checkout(@Argument String userId) {
        return orderService.checkout(userId);
    }

    @QueryMapping
    public List<Order> userOrders(@Argument String userId) {
        return orderService.getUserOrders(userId);
    }
}