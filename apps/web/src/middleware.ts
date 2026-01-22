
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isProtected = createRouteMatcher(["/dashboard(.*)"]);

export default clerkMiddleware(async (auth, req) => {
  if (isProtected(req)) {
    try {
      const { userId, redirectToSignIn } = await auth();
      if (!userId) return redirectToSignIn();
    } catch (error) {
      console.error("Clerk Auth Error in Middleware:", error);
      // Throwing ensures the 500 is still returned but now logged in server console
      throw error;
    }
  }
});

export const config = {
  matcher: ["/((?!_next|.*\..*).*)"],
};
