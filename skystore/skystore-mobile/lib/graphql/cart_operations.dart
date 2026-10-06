class CartOperations {
  static const String getCart = r'''
    query GetCart($userId: ID!) {
      cart(userId: $userId) {
        userId
        totalPrice
        items {
          productId
          name
          price
          quantity
          subtotal
        }
      }
    }
  ''';

  static const String removeFromCart = r'''
    mutation RemoveFromCart($userId: ID!, $productId: ID!) {
      removeFromCart(userId: $userId, productId: $productId) {
        userId
        totalPrice
      }
    }
  ''';

  static const String checkout = r'''
    mutation Checkout($userId: ID!) {
      checkout(userId: $userId) {
        id
        totalAmount
        status
        createdAt
      }
    }
  ''';
}
