import type { MetadataRoute } from 'next';
import { SITE_URL } from './seo';

const ROUTE_PATHS = ['/', '/results', '/recommendations'] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const lastModified = new Date();

    return ROUTE_PATHS.map((path) => ({
        url: new URL(path, SITE_URL).toString(),
        lastModified,
        changeFrequency: path === '/' ? 'daily' : 'weekly',
        priority: path === '/' ? 1 : 0.8,
    }));
}
