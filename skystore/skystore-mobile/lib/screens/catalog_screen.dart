import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class CatalogScreen extends StatelessWidget {
  const CatalogScreen({super.key});

  static const String fetchProducts = """
    query GetProducts {
      products(limit: 20) {
        id
        name
        price
      }
    }
  """;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('SkyStore Mobile')),
      body: Query(
        options: QueryOptions(document: gql(fetchProducts)),
        builder: (QueryResult result, {VoidCallback? refetch, FetchMore? fetchMore}) {
          if (result.hasException) {
            return Center(child: Text(result.exception.toString()));
          }
          if (result.isLoading) {
            return const Center(child: CircularProgressIndicator());
          }

          final products = result.data?['products'] as List<dynamic>? ?? [];

          return ListView.builder(
            itemCount: products.length,
            itemBuilder: (context, index) {
              final product = products[index];
              return Card(
                margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                child: ListTile(
                  title: Text(product['name']),
                  subtitle: Text("\$${product['price']}"),
                  trailing: ElevatedButton(
                    onPressed: () {
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('تمت إضافة ${product['name']}')),
                      );
                    },
                    child: const Text('شراء'),
                  ),
                ),
              );
            },
          );
        },
      ),
    );
  }
}
