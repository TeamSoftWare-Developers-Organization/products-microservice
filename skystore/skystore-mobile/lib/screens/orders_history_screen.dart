import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../graphql/order_operations.dart';
import '../services/auth_service.dart';

class OrdersHistoryScreen extends StatelessWidget {
  const OrdersHistoryScreen({super.key});

  Color _getStatusColor(String status) {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
        return Colors.green.shade700;
      case 'SHIPPED':
        return Colors.blue.shade700;
      case 'CANCELLED':
        return Colors.red.shade700;
      case 'PENDING':
      default:
        return Colors.orange.shade800;
    }
  }

  @override
  Widget build(BuildContext context) {
    final userId = AuthService().currentUserId ?? 'user_101';

    return Scaffold(
      appBar: AppBar(
        title: const Text('سجل طلباتي'),
        centerTitle: true,
      ),
      body: Query(
        options: QueryOptions(
          document: gql(OrderOperations.getUserOrders),
          variables: {'userId': userId},
          fetchPolicy: FetchPolicy.networkOnly,
        ),
        builder: (result, {refetch, fetchMore}) {
          if (result.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }
          if (result.hasException) {
            return Center(child: Text("خطأ: ${result.exception.toString()}"));
          }

          final List orders = result.data?['userOrders'] ?? [];

          if (orders.isEmpty) {
            return const Center(
              child: Text("لا توجد طلبات سابقة حتى الآن", style: TextStyle(fontSize: 16)),
            );
          }

          return RefreshIndicator(
            onRefresh: () async => refetch?.call(),
            child: ListView.builder(
              padding: const EdgeInsets.all(12),
              itemCount: orders.length,
              itemBuilder: (context, index) {
                final order = orders[index];
                final List items = order['items'] ?? [];
                final String status = order['status'] ?? 'PENDING';

                return Card(
                  margin: const EdgeInsets.only(bottom: 12),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                  elevation: 2,
                  child: ExpansionTile(
                    title: Text(
                      "طلب رقم #${order['id']}",
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    subtitle: Text("التاريخ: ${order['createdAt']}"),
                    trailing: Chip(
                      label: Text(
                        status,
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                      ),
                      backgroundColor: _getStatusColor(status),
                    ),
                    children: [
                      const Divider(),
                      ...items.map((item) => ListTile(
                            dense: true,
                            title: Text(item['productName']),
                            subtitle: Text("${item['quantity']} × \$${item['unitPrice']}"),
                            trailing: Text("\$${(item['quantity'] * item['unitPrice']).toStringAsFixed(2)}"),
                          )),
                      Padding(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
                        child: Row(
                          mainAxisAlignment: MainAxisAlignment.spaceBetween,
                          children: [
                            const Text("المجموع الكلي:", style: TextStyle(fontWeight: FontWeight.bold)),
                            Text(
                              "\$${order['totalAmount']}",
                              style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Colors.teal),
                            ),
                          ],
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(left: 16, right: 16, bottom: 12),
                        child: SizedBox(
                          width: double.infinity,
                          child: OutlinedButton.icon(
                            style: OutlinedButton.styleFrom(
                              foregroundColor: Colors.orange.shade800,
                              side: BorderSide(color: Colors.orange.shade300),
                              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                            ),
                            icon: const Icon(Icons.assignment_return_outlined, size: 18),
                            label: const Text('طلب مرتجع / استبدال'),
                            onPressed: () {
                              Navigator.push(
                                context,
                                MaterialPageRoute(
                                  builder: (context) => ReturnRequestScreen(
                                    orderId: order['id'].toString(),
                                    items: items,
                                    totalAmount: (order['totalAmount'] as num?)?.toDouble(),
                                  ),
                                ),
                              );
                            },
                          ),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          );
        },
      ),
    );
  }
}
