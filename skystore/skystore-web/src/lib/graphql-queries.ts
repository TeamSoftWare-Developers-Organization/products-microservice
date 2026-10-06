import { gql } from "@apollo/client";

export const GET_PRODUCTS = gql`
  query GetProducts {
    products {
      id
      name
      description
      price
      imageUrl
      stockQuantity
    }
  }
`;

export const CHECKOUT_MUTATION = gql`
  mutation Checkout($userId: String!) {
    checkout(userId: $userId) {
      id
      totalAmount
      status
      createdAt
    }
  }
`;

export const GET_SHIPMENTS = gql`
  query GetShipments {
    shipments {
      trackingNumber
      status
      carrier
      shippingAddress
      estimatedDeliveryDate
      updatedAt
    }
  }
`;

export const UPDATE_SHIPMENT_STATUS = gql`
  mutation UpdateShipmentStatus($trackingNumber: String!, $status: ShipmentStatus!) {
    updateShipmentStatus(trackingNumber: $trackingNumber, status: $status) {
      trackingNumber
      status
      updatedAt
    }
  }
`;
