import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';
import '../services/auth_service.dart';

class GraphQLConfiguration {
  static ValueNotifier<GraphQLClient> initializeClient() {
    final HttpLink httpLink = HttpLink('https://api.skystore.local/graphql');

    // إرفاق رمز الدخول في ترويسات الـ GraphQL تلقائياً
    final AuthLink authLink = AuthLink(
      getToken: () async {
        final token = await AuthService().getSavedToken();
        return token != null ? 'Bearer $token' : null;
      },
    );

    final Link link = authLink.concat(httpLink);

    return ValueNotifier(
      GraphQLClient(
        link: link,
        cache: GraphQLCache(store: InMemoryStore()),
      ),
    );
  }
}
