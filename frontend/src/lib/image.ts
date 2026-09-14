/** Resolve product images without coupling the UI to a gateway IP/port. */
export function resolveProductImage(raw?: string | null): string {
  const value = String(raw || '').trim();
  if (!value) return '';
  if (value.startsWith('data:') || value.startsWith('blob:')) return value;
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith('//')) return `${typeof window !== 'undefined' ? window.location.protocol : 'http:'}${value}`;
  // Uploaded product images are served by the Next.js same-origin /uploads rewrite.
  if (value.startsWith('/uploads/')) return value;
  if (value.startsWith('uploads/')) return `/${value}`;
  return value.startsWith('/') ? value : `/${value}`;
}
