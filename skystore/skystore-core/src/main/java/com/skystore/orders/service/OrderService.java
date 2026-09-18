package com.skystore.orders.service;

import com.skystore.cart.domain.Cart;
import com.skystore.cart.service.CartService;
import com.skystore.orders.domain.Order;
import com.skystore.orders.domain.OrderItem;
import com.skystore.orders.event.OrderPlacedEvent;
import com.skystore.orders.repository.OrderRepository;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartService cartService;
    private final RabbitTemplate rabbitTemplate;

    @Value("${app.rabbitmq.exchange}")
    private String exchange;

    @Value("${app.rabbitmq.routing-key}")
    private String routingKey;

    public OrderService(OrderRepository orderRepository, CartService cartService, RabbitTemplate rabbitTemplate) {
        this.orderRepository = orderRepository;
        this.cartService = cartService;
        this.rabbitTemplate = rabbitTemplate;
    }

    @Transactional
    public Order checkout(String userId) {
        Cart cart = cartService.getCart(userId);
        if (cart.getItems().isEmpty()) {
            throw new IllegalStateException("لا يمكن إتمام الطلب: السلة فارغة");
        }

        List<OrderItem> orderItems = cart.getItems().stream()
                .map(item -> new OrderItem(
                        Long.parseLong(item.getProductId()),
                        item.getName(),
                        item.getQuantity(),
                        BigDecimal.valueOf(item.getPrice())
                )).toList();

        Order order = new Order(userId, BigDecimal.valueOf(cart.getTotalPrice()), orderItems);
        Order savedOrder = orderRepository.save(order);

        // تفريغ السلة من Redis بعد نجاح الحفظ في MariaDB
        cartService.clearCart(userId);

        // بث حدث إنشاء الطلب عبر RabbitMQ ليستقبله مستمع الإشعارات ومحلل الاحتيال
        OrderPlacedEvent event = new OrderPlacedEvent(
                savedOrder.getId(),
                savedOrder.getUserId(),
                savedOrder.getTotalAmount(),
                orderItems.stream().map(i -> new OrderPlacedEvent.OrderItemDto(i.getProductId(), i.getQuantity(), i.getUnitPrice())).toList()
        );
        rabbitTemplate.convertAndSend(exchange, routingKey, event);

        return savedOrder;
    }

    public List<Order> getUserOrders(String userId) {
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }
}