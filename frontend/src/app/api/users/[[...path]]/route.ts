import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const authTarget = (process.env.INTERNAL_AUTH_URL || 'http://auth-ms:3001').replace(/\/+$/, '');

async function proxy(request: NextRequest, context: { params: Promise<{ path?: string[] }> }) {
  const { path = [] } = await context.params;
  const suffix = path.length ? `/${path.map(encodeURIComponent).join('/')}` : '';
  const search = request.nextUrl.search || '';
  const target = `${authTarget}/api/users${suffix}${search}`;

  const headers = new Headers();
  const authorization = request.headers.get('authorization');
  const contentType = request.headers.get('content-type');
  if (authorization) headers.set('authorization', authorization);
  if (contentType) headers.set('content-type', contentType);

  let body: BodyInit | undefined;
  if (!['GET', 'HEAD'].includes(request.method)) {
    body = await request.arrayBuffer();
  }

  try {
    const response = await fetch(target, {
      method: request.method,
      headers,
      body,
      cache: 'no-store',
    });

    const responseHeaders = new Headers();
    const responseType = response.headers.get('content-type');
    if (responseType) responseHeaders.set('content-type', responseType);

    return new NextResponse(response.body, {
      status: response.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error('[users-proxy]', error);
    return NextResponse.json(
      { message: 'تعذر الاتصال بخدمة المستخدمين', error: 'AUTH_SERVICE_UNAVAILABLE' },
      { status: 502 },
    );
  }
}

export const GET = proxy;
export const POST = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
export const PUT = proxy;
