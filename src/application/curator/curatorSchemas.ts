import { z } from 'zod';

export const resourceSchema = z.object({
  title: z
    .string()
    .min(1, 'El título es obligatorio')
    .max(200, 'El título no puede superar 200 caracteres'),
  type: z.enum(['news', 'scientific_article', 'video'], {
    error: 'Selecciona el tipo de recurso',
  }),
  url: z.string(),
  description: z.string(),
});

export type ResourceFormValues = z.infer<typeof resourceSchema>;
