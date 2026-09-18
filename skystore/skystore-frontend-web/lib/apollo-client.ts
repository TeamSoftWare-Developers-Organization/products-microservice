import { ApolloClient, InMemoryCache, HttpLink } from "@apollo/client";

export const client = new ApolloClient({
  link: new HttpLink({
    uri: "https://api.skystore.local/graphql",
  }),
  cache: new InMemoryCache(),
});
