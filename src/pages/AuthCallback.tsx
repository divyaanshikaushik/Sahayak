import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { doctor } = useAuth();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;
        
        if (!session) {
          navigate('/login');
          return;
        }

        // Check if user is a doctor
        const { data: existingDoctor, error: doctorError } = await supabase
          .from('doctors')
          .select('id')
          .eq('user_id', session.user.id)
          .maybeSingle();

        if (doctorError && doctorError.code !== 'PGRST116') {
          throw doctorError;
        }

        // If doctor profile exists, redirect to dashboard
        if (existingDoctor) {
          navigate(`/doctor/${existingDoctor.id}`, { replace: true });
          return;
        }

        // For Google sign-in, create doctor profile if it doesn't exist
        if (session.user.app_metadata.provider === 'google') {
          try {
            const fullName = session.user.user_metadata.full_name || 'Doctor';
            const { data: newDoctor, error: createError } = await supabase
              .from('doctors')
              .insert([
                {
                  user_id: session.user.id,
                  full_name: fullName,
                  specialty: 'General Practice', // Default specialty
                  license_number: 'Pending', // Placeholder license number
                },
              ])
              .select()
              .single();

            if (createError) {
              // If we get a duplicate error, try to fetch the existing profile again
              if (createError.code === '23505') {
                const { data: retryDoctor } = await supabase
                  .from('doctors')
                  .select('id')
                  .eq('user_id', session.user.id)
                  .single();

                if (retryDoctor) {
                  navigate(`/doctor/${retryDoctor.id}`, { replace: true });
                  return;
                }
              }
              throw createError;
            }

            if (newDoctor) {
              navigate(`/doctor/${newDoctor.id}`, { replace: true });
              return;
            }
          } catch (createError) {
            console.error('Error creating doctor profile:', createError);
            // If we fail to create the profile, redirect to registration
            navigate('/register', { replace: true });
            return;
          }
        }

        // If no doctor profile and not Google auth, redirect to registration
        navigate('/register', { replace: true });
      } catch (error) {
        console.error('Error in auth callback:', error);
        navigate('/login', { replace: true });
      }
    };

    // Check if we're handling an OAuth callback
    const hasCode = window.location.search.includes('code=');
    if (hasCode) {
      handleAuthCallback();
    } else if (doctor) {
      navigate(`/doctor/${doctor.id}`, { replace: true });
    } else {
      navigate('/login', { replace: true });
    }
  }, [navigate, doctor]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    </div>
  );
}