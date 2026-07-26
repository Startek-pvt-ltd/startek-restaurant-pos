export { auth as proxy } from "@/auth";

export const config = {
  matcher: [
    "/login",
    "/dashboard/:path*",
    "/menu/:path*",
    "/pos/:path*",
    "/orders/:path*",
    "/reports/:path*",
    "/expenses/:path*",
    "/staff/:path*",
    "/settings/:path*",
    "/notifications/:path*",
  ],
};
