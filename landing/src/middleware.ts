import { clerkMiddleware } from '@clerk/nextjs/server';

export default clerkMiddleware();

export const config = {
  matcher: [
    '/',
    '/api/templates',
    '/api/generate',
    '/api/webbhooks/clerk',
  ],
};