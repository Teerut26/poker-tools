import { getToken } from "next-auth/jwt";
import { withAuth } from "next-auth/middleware";
import { NextRequest, NextResponse } from "next/server";

export default withAuth(
  async function middleware(req) {
    // if (req.nextauth.token && req.nextUrl.pathname.startsWith("/staff")) {

    //   if (isStaff) {
    //     return NextResponse.next();
    //   } else {
    //     return NextResponse.rewrite(new URL("/404", req.nextUrl));
    //   }

    //   const token = await getToken({ req, secret: process.env.SECRET });
    //   if (token?.email === "teerut.sr@ku.th") {
    //     return NextResponse.next();
    //   }
    //   return NextResponse.rewrite(new URL("/404", req.url));
    return NextResponse.next();
    // }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        if (token) {
          return true;
        }
        return false;
      },
    },
  },
);

export const config = {
  matcher: ["/", "/((?!api|sign-in|error|_next/static|_next/image|favicon.ico).*)"],
};
