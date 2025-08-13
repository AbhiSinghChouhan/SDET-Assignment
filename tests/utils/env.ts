import dotenv from 'dotenv';
import { z } from 'zod';
import { envFilePath } from './paths';

// Load a single root .env file anchored from this file's directory
dotenv.config({ path: envFilePath });

const EnvSchema = z.object({
  BASE_URL: z.string().url().or(z.string().min(1)),
  USERNAME: z.string().min(1),
  PASSWORD: z.string().min(1),
});

const safeParseResult = EnvSchema.safeParse(process.env);

if (!safeParseResult.success) {
  console.warn(
    'Environment validation warning. Missing or invalid variables in .env. Using placeholders if present. Errors:',
    safeParseResult.error.flatten().fieldErrors,
  );
}

export const env = {
  baseUrl: process.env.BASE_URL ?? '',
  username: process.env.USERNAME,
  password: process.env.PASSWORD,
};

export const isHttpBaseUrl: boolean = /^https?:\/\//i.test(env.baseUrl);
