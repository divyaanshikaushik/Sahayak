import { createClient } from '@supabase/supabase-js';
import { config } from './config';
import type { Database } from './database.types';

// Create Supabase client with enhanced retry configuration
export const supabase = createClient<Database>(
  config.supabase.url,
  config.supabase.anonKey,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      storage: window.localStorage,
      storageKey: 'supabase.auth.token',
      detectSessionInUrl: true,
      flowType: 'pkce'
    },
    global: {
      headers: {
        'x-application-name': 'medical-diagnostic-assistant',
      },
    },
    // Add retry configuration
    db: {
      schema: 'public',
    },
    realtime: {
      params: {
        eventsPerSecond: 10,
      },
    },
    // Enhanced request configuration
    opts: {
      fetch: (url, options = {}) => {
        const retryCount = 3;
        const baseDelay = 1000; // 1 second

        const fetchWithRetry = async (attempt = 0): Promise<Response> => {
          try {
            const response = await fetch(url, {
              ...options,
              timeout: 30000, // 30 second timeout
            });

            if (!response.ok && attempt < retryCount) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }

            return response;
          } catch (error) {
            if (attempt >= retryCount) {
              throw error;
            }

            // Exponential backoff
            const delay = baseDelay * Math.pow(2, attempt);
            await new Promise(resolve => setTimeout(resolve, delay));
            
            return fetchWithRetry(attempt + 1);
          }
        };

        return fetchWithRetry();
      },
    },
  }
);

// Enhanced error handling helper with better retry logic
export async function handleSupabaseError<T>(
  promise: Promise<{ data: T | null; error: any }>,
  errorContext: string,
  retries = 3,
  delay = 1000
): Promise<T> {
  let lastError: any;
  
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const { data, error } = await promise;
      
      if (error) {
        // Log the error with context
        console.error(`Supabase error (${errorContext}) attempt ${attempt}/${retries}:`, error);
        
        // For certain errors, we want to throw immediately
        if (error.code === 'PGRST116' || error.code === '23505') {
          throw error;
        }
        
        lastError = error;
        
        // If this is not our last attempt, wait before retrying
        if (attempt < retries) {
          await new Promise(resolve => setTimeout(resolve, delay * attempt));
          continue;
        }
        
        throw error;
      }
      
      if (!data) {
        throw new Error('No data returned');
      }
      
      return data;
    } catch (error) {
      lastError = error;
      
      // If this is not our last attempt, wait before retrying
      if (attempt < retries) {
        await new Promise(resolve => setTimeout(resolve, delay * attempt));
        continue;
      }
      
      // On final attempt, throw the error
      console.error(`Error in ${errorContext} (attempt ${attempt}/${retries}):`, error);
      throw lastError;
    }
  }
  
  throw lastError;
}

// Add connection status check with retry
export async function checkSupabaseConnection(retries = 3): Promise<boolean> {
  for (let i = 0; i < retries; i++) {
    try {
      const { data, error } = await supabase.from('doctors').select('id').limit(1);
      if (!error) {
        return true;
      }
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    } catch {
      if (i === retries - 1) return false;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
    }
  }
  return false;
}

export type Tables = Database['public']['Tables'];
export type Doctor = Tables['doctors']['Row'];
export type Patient = Tables['patients']['Row'];
export type MedicalReport = Tables['medical_reports']['Row'];