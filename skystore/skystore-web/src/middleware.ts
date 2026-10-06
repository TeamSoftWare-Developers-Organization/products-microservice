import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isBackoffice = req.nextUrl.pathname.startsWith("/backoffice");
    const roles = (token?.roles as string[]) || [];

    if (isBackoffice && !roles.includes("ROLE_ADMIN") && !roles.includes("ROLE_WAREHOUSE")) {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  },
  {
    callbacks: {
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = { matcher: ["/backoffice/:path*", "/cart/checkout"] };
