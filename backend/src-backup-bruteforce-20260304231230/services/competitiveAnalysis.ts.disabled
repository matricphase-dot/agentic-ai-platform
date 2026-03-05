import { PrismaClient } from '@prisma/client';
import puppeteer from 'puppeteer';

const prisma = new PrismaClient();

const COMPETITORS = [
  { name: 'OpenAI', url: 'https://openai.com/blog/' },
  { name: 'Anthropic', url: 'https://www.anthropic.com/news' },
  // Add more as needed
];

export async function scanCompetitors() {
  const browser = await puppeteer.launch({ headless: true });

  for (const comp of COMPETITORS) {
    try {
      const page = await browser.newPage();
      await page.goto(comp.url, { waitUntil: 'networkidle2' });
      const content = await page.content();
      const features = extractFeatures(content);
      for (const feature of features) {
        await prisma.competitor_insights.create({ data: { 
            competitor: comp.name,
            feature: feature,
            description: feature,
          }
        });
      }
    } catch (error) { const err = error instanceof Error ? error : new Error(String(error));
      console.error('Failed to scan:', error);
    }
  }
  await browser.close();
}

function extractFeatures(html: string): string[] {
  // Simple placeholder – replace with actual extraction logic
  return ['New multi-modal support', 'Lower pricing tier'];
}

// Run weekly
setInterval(scanCompetitors, 7 * 24 * 60 * 60 * 1000);







