// Environment configuration with validation
export const config = {
  supabase: {
    url: import.meta.env.VITE_SUPABASE_URL as string,
    anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY as string,
  },
  gemini: {
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || null,
  },
  storage: {
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedFileTypes: ['application/pdf', 'image/jpeg', 'image/png', 'image/webp'],
  },
} as const;

// Validate required environment variables
const requiredEnvVars = [
  ['VITE_SUPABASE_URL', config.supabase.url],
  ['VITE_SUPABASE_ANON_KEY', config.supabase.anonKey],
] as const;

for (const [name, value] of requiredEnvVars) {
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}. Please check your .env file.`);
  }
}

// Validate Supabase URL format
try {
  new URL(config.supabase.url);
} catch (error) {
  throw new Error(`Invalid VITE_SUPABASE_URL: ${config.supabase.url}. Please check your .env file.`);
}