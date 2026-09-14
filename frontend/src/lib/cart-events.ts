export const CART_CHANGED_EVENT = 'microstore:cart-changed';

export type CartChangedDetail = {
  delta?: number;
  count?: number;
};

export function notifyCartChanged(detail: CartChangedDetail = {}) {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new CustomEvent<CartChangedDetail>(CART_CHANGED_EVENT, { detail }));
}
