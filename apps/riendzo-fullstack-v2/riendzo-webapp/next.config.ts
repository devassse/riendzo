import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  devIndicators: false,
  // Allow opening the dev server from other devices on the network (phone, tablet)
  allowedDevOrigins: ['192.168.8.104']
};

export default withNextIntl(nextConfig);