import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    client: z.string(),
    locations: z.array(z.string()),
    year: z.number(),
    services: z.array(z.string()),
    subEvents: z.array(z.string()).optional(),
    tagline: z.string(),
    brief: z.string(),
    caseNumber: z.string(),
    order: z.number(),
    thumbShape: z.enum(['wide', 'tall', 'square']).default('tall'),
    heroImage: z.string(),
    heroAlt: z.string(),
    thumbImage: z.string().optional(),
    gallery: z
      .array(
        z.object({
          src: z.string(),
          alt: z.string(),
          aspect: z.enum(['4/5', '16/11', '1/1', '3/4', '16/9']).default('4/5'),
        })
      )
      .default([]),
    stats: z
      .array(z.object({ value: z.string(), label: z.string().optional() }))
      .optional(),
    videoId: z.string().optional(),
  }),
});

export const collections = { work };
