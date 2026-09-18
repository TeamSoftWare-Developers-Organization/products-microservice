import 'package:flutter/material.dart';
import 'package:graphql_flutter/graphql_flutter.dart';

class GraphQLConfiguration {
  static final HttpLink httpLink = HttpLink(
    'https://api.skystore.local/graphql',
  );

  static ValueNotifier<GraphQLClient> initializeClient() {
    return ValueNotifier(
      GraphQLClient(
        link: httpLink,
        cache: GraphQLCache(store: InMemoryStore()),
      ),
    );
  }
}
