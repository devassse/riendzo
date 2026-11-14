import createMiddleware from 'next-intl/middleware';
import {routing} from './i18n/routing';

export default createMiddleware(routing);

export const config = {
  // `admin` (BackOffice) is outside the i18n routing, like `api`
  matcher: '/((?!api|admin|trpc|_next|_vercel|.*\\..*).*)'
};
