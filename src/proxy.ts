export { auth as proxy } from "@/auth";

export const config = {
  matcher: ["/login", "/dashboard/:path*", "/menu/:path*", "/pos/:path*", "/orders/:path*", "/settings/:path*"],
};
