import { withAuth } from 'next-auth/middleware';

export default withAuth({
  pages: {
    signIn: '/auth/signin',
  },
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/clients/:path*',
    '/reports/:path*',
    '/data-sources/:path*',
    '/schedules/:path*',
    '/settings/:path*',
    '/api/account/:path*',
    '/api/agency/:path*',
    '/api/api-keys/:path*',
    '/api/clients/:path*',
    '/api/reports/:path*',
    '/api/sources/:path*',
    '/api/schedules/:path*',
  ],
};
