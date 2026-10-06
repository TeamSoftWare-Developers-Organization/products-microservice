package com.skystore.shipping.repository;

import com.skystore.shipping.domain.Shipment;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface ShipmentRepository extends JpaRepository<Shipment, Long> {
    @EntityGraph(attributePaths = {"warehouse"})
    Optional<Shipment> findByOrderId(Long orderId);

    @EntityGraph(attributePaths = {"warehouse"})
    Optional<Shipment> findByTrackingNumber(String trackingNumber);
}
