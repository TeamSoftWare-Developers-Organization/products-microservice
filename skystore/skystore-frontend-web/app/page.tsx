'use client';
import { gql, useQuery, useMutation } from '@apollo/client';

const GET_PRODUCTS = gql`
  query GetProducts {
    products(limit: 10) {
      id
      name
      price
      stockQuantity
    }
  }
`;

const ADD_TO_CART = gql`
  mutation AddToCart($userId: ID!, $input: CartItemInput!) {
    addToCart(userId: $userId, input: $input) {
      userId
      totalPrice
    }
  }
`;

export default function ProductCatalog() {
  const { data, loading, error } = useQuery(GET_PRODUCTS);
  const [addToCart] = useMutation(ADD_TO_CART);

  if (loading) return <p className="p-6">جاري التحميل...</p>;
  if (error) return <p className="p-6 text-red-500">حدث خطأ: {error.message}</p>;

  return (
    <main className="p-8 max-w-5xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">كتالوج منتجات SkyStore</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {data?.products?.map((p: any) => (
          <div key={p.id} className="border p-4 rounded-xl shadow-sm bg-white">
            <h2 className="text-xl font-semibold">{p.name}</h2>
            <p className="text-gray-600 mt-1">${p.price}</p>
            <button
              onClick={() => addToCart({ variables: { userId: "user_101", input: { productId: p.id, quantity: 1 } } })}
              className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded-lg"
            >
              أضف إلى السلة
            </button>
          </div>
        ))}
      </div>
    </main>
  );
}
