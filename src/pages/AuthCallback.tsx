import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const AuthCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('Starting auth callback...');
        
        // Get the current session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Session error:', error);
          toast.error('Error retrieving session');
          navigate('/auth');
          return;
        }

        console.log('Session:', session);

        if (!session) {
          console.log('No session found, redirecting to auth page');
          navigate('/auth');
          return;
        }

        // If we reach here, we have a valid session
        console.log('Session exists, checking profile...');
        
        // Check if we have a user profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // PGRST116 means no results found, which is expected if profile doesn't exist yet
        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile error:', profileError);
          // Continue anyway - we'll try to create a profile
        }

        // If no profile exists, create one
        if (!profile) {
          console.log('No profile found, creating one...');
          try {
            const { error: upsertError } = await supabase
              .from('profiles')
              .upsert({
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || '',
                avatar_url: session.user.user_metadata?.avatar_url || '',
                username: session.user.user_metadata?.username || '',
                updated_at: new Date().toISOString(),
              });

            if (upsertError) {
              console.error('Profile creation error:', upsertError);
              // Continue anyway - don't show error to user if only profile creation failed
            } else {
              console.log('Profile created successfully');
            }
          } catch (profileCreateError) {
            console.error('Error creating profile:', profileCreateError);
            // Continue anyway - don't show error to user
          }
        } else {
          console.log('Existing profile found:', profile);
        }

        // Navigate to home regardless of profile creation status
        console.log('Authentication successful, redirecting to home...');
        navigate('/');
      } catch (error) {
        // Only show error for critical failures
        console.error('Unexpected error in auth callback:', error);
        navigate('/auth');
      }
    };

    // Add a small delay to ensure the session is properly set
    setTimeout(handleAuthCallback, 1000);
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h2 className="text-2xl font-semibold mb-4">Completing sign in...</h2>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-herd-purple mx-auto"></div>
      </div>
    </div>
  );
};

export default AuthCallback; 