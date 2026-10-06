import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../graphql/cart_operations.dart';
import '../services/notification_service.dart';

class CartScreen extends StatefulWidget {
  final String currentUserId;

  const CartScreen({super.key, required this.currentUserId});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  late NotificationService _notificationService;

  @override
  void initState() {
    super.initState();
    // تفعيل الاستماع للإشعارات بمجرد فتح الشاشة
    _notificationService = NotificationService(
      userId: widget.currentUserId,
      onNotificationReceived: (payload) {
        if (!mounted) return;
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            backgroundColor: Colors.teal.shade800,
            duration: const Duration(seconds: 4),
            content: Row(
              children: [
                const Icon(Icons.notifications_active, color: Colors.white),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    "${payload['title']}: ${payload['message']}",
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                ),
              ],
            ),
          ),
        );
      },
    );
    _notificationService.connect();
  }

  @override
  void dispose() {
    _notificationService.disconnect();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('سلة المشتريات'),
        centerTitle: true,
      ),
      body: Query(
        options: QueryOptions(
          document: gql(CartOperations.getCart),
          variables: {'userId': widget.currentUserId},
          pollInterval: const Duration(seconds: 10),
        ),
        builder: (result, {refetch, fetchMore}) {
          if (result.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (result.hasException) {
            return Center(child: Text("خطأ: ${result.exception.toString()}"));
          }

          final cartData = result.data?['cart'];
          final List items = cartData?['items'] ?? [];
          final double totalPrice = (cartData?['totalPrice'] ?? 0.0).toDouble();

          if (items.isEmpty) {
            return const Center(
              child: Text("السلة فارغة", style: TextStyle(fontSize: 18)),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: items.length,
                  itemBuilder: (context, index) {
                    final item = items[index];
                    return Card(
                      margin: const EdgeInsets.symmetric(horizontal: 14, vertical: 6),
                      child: ListTile(
                        leading: const Icon(Icons.shopping_bag_outlined),
                        title: Text(item['name']),
                        subtitle: Text("${item['quantity']} × \$${item['price']}"),
                        trailing: Text(
                          "\$${item['subtotal']}",
                          style: const TextStyle(fontWeight: FontWeight.bold),
                        ),
                      ),
                    );
                  },
                ),
              ),
              _buildCheckoutBottomBar(totalPrice, refetch),
            ],
          );
        },
      ),
    );
  }

  Widget _buildCheckoutBottomBar(double total, VoidCallback? refetch) {
    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.06),
            blurRadius: 10,
            offset: const Offset(0, -4),
          )
        ],
      ),
      child: SafeArea(
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text("الإجمالي", style: TextStyle(color: Colors.grey)),
                Text(
                  "\$$total",
                  style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                ),
              ],
            ),
            Mutation(
              options: MutationOptions(
                document: gql(CartOperations.checkout),
                onCompleted: (data) {
                  refetch?.call();
                  // بعد نجاح الطلب، الـ WebSocket سيرسل الإشعار فوراً من الباك إند
                },
              ),
              builder: (runMutation, result) {
                return ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                  ),
                  onPressed: result?.isLoading ?? false
                      ? null
                      : () {
                          runMutation({'userId': widget.currentUserId});
                        },
                  child: (result?.isLoading ?? false)
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                        )
                      : const Text("إتمام الطلب الآن"),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
