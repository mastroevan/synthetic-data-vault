import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

const isPublicRoute = createRouteMatcher(['/', '/api/templates', '/sign-in', '/sign-up']);

export default clerkMiddleware((auth, request) => {
  if (!isPublicRoute(request)) auth();
});

export const config = {
  matcher: ['/((?!.*\\..*|_next).*)', '/', '/(api|trpc)(.*)'],
};