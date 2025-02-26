import React, { createContext, useContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import type { Doctor } from '../lib/supabase';

interface AuthContextType {
  user: User | null;
  doctor: Doctor | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signUp: (email: string, password: string, data: any) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        setDoctor(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch doctor profile when user changes
  useEffect(() => {
    async function fetchDoctorProfile() {
      if (!user) {
        setDoctor(null);
        setLoading(false);
        return;
      }

      try {
        const { data: doctorData, error } = await supabase
          .from('doctors')
          .select('*')
          .eq('user_id', user.id)
          .maybeSingle();

        if (error && error.code !== 'PGRST116') {
          throw error;
        }

        if (doctorData) {
          setDoctor(doctorData);
        }
      } catch (error) {
        console.error('Error fetching doctor profile:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchDoctorProfile();
  }, [user]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}`+`/auth/callback`, 
        queryParams: {
          access_type: 'online',
          prompt: 'consent',
        },
      },
    });
    if (error) throw error;
  };

  const signUp = async (email: string, password: string, data: any) => {
    try {
      const { error: signUpError, data: authData } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (signUpError) throw signUpError;
      if (!authData.user) throw new Error('User creation failed');

      const { error: profileError } = await supabase.from('doctors').insert([
        {
          user_id: authData.user.id,
          full_name: data.fullName,
          specialty: data.specialty,
          license_number: data.licenseNumber,
        },
      ]);
      
      if (profileError) throw profileError;

      // Sign in the user immediately after successful registration
      await signIn(email, password);
    } catch (error) {
      // If there's an error during profile creation, clean up the auth user
      if (error instanceof Error && error.message !== 'User already registered') {
        const session = await supabase.auth.getSession();
        if (session.data.session) {
          await supabase.auth.signOut();
        }
      }
      throw error;
    }
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const value = {
    user,
    doctor,
    loading,
    signIn,
    signInWithGoogle,
    signUp,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}