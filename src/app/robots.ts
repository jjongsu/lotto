import type { MetadataRoute } from 'next';
import { SITE_URL } from './seo';

export default function robots(): MetadataRoute.Robots {
    const siteOrigin = new URL(SITE_URL).origin;

    return {
        rules: {
            userAgent: '*',
            allow: '/',
        },
        sitemap: `${siteOrigin}/sitemap.xml`,
        host: siteOrigin,
    };
}
