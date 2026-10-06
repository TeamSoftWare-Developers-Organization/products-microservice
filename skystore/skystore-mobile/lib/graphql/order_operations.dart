class OrderOperations {
  static const String getUserOrders = r'''
    query GetUserOrders($userId: ID!) {
      userOrders(userId: $userId) {
        id
        totalAmount
        status
        createdAt
        items {
          id
          productId
          productName
          quantity
          unitPrice
        }
      }
    }
  ''';
}
