import { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = 'https://agenticai.dev';

  // These could be dynamic from the DB
  const routes = [
    '',
    '/marketplace',
    '/pricing',
    '/docs',
    '/auth/login',
    '/auth/signup',
  ];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: route === '/marketplace' ? 'hourly' : 'daily',
    priority: route === '' ? 1 : 0.8,
  }));
}
