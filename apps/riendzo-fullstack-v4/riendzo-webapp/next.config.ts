import type {NextConfig} from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./i18n/request.ts');

const nextConfig: NextConfig = {
  devIndicators: false,
  // Allow opening the dev server from other devices on the network (phone, tablet)
  // (the address your phone uses to reach this computer changes with the Wi-Fi, so private networks are allowed;
  //  add more with DEV_ORIGINS=ip1,host2 in .env.local)
  allowedDevOrigins: [
    '192.168.*.*',
    '10.*.*.*',
    '172.16.*.*', '172.17.*.*', '172.18.*.*', '172.19.*.*', '172.2*.*.*', '172.30.*.*', '172.31.*.*',
    '*.local',
    ...(process.env.DEV_ORIGINS ?? '').split(',').map((s) => s.trim()).filter(Boolean),
  ]
};

export default withNextIntl(nextConfig);