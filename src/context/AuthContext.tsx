import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

type UserProfile = {
  id: string;
  username?: string | null;
  full_name?: string | null;
  avatar_url?: string | null;
  campus_id?: string | null;
};

type AuthContextType = {
  user: User | null;
  session: Session | null;
  userProfile: UserProfile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, userData?: any) => Promise<void>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      console.log('Fetching user profile for user ID:', userId);
      
      // Check if profile exists first
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (checkError) {
        // If the error is that the profile doesn't exist, create it
        if (checkError.code === 'PGRST116') { // No rows returned error
          console.log('Profile not found, creating new profile');
          const { data: newProfile, error: insertError } = await supabase
            .from('profiles')
            .insert({
              id: userId,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            })
            .select('*')
            .single();
          
          if (insertError) {
            console.error('Error creating user profile:', insertError);
            
            // If there's an issue with the data type, let's try a different approach
            if (insertError.code === '22P02') { // Invalid syntax for data type
              console.log('Attempting to fetch user data from auth.users');
              
              // Try to get user data from auth
              const { data: userData, error: userError } = await supabase.auth.getUser();
              
              if (!userError && userData?.user) {
                console.log('Setting profile from auth user data');
                
                // Set minimal profile from auth data
                setUserProfile({
                  id: userData.user.id,
                  username: userData.user.email?.split('@')[0] || null,
                  full_name: userData.user.user_metadata?.full_name || null,
                  avatar_url: userData.user.user_metadata?.avatar_url || null,
                  campus_id: null
                });
              }
            }
            return;
          }
          
          setUserProfile(newProfile);
          return;
        } else {
          console.error('Error checking for user profile:', checkError);
          return;
        }
      }
      
      // Profile exists, use it
      console.log('Profile found:', existingProfile);
      setUserProfile(existingProfile);
    } catch (error) {
      console.error('Unexpected error in fetchUserProfile:', error);
    }
  };

  useEffect(() => {
    let mounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        try {
          console.log('Auth state changed:', event, session);
          
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            await fetchUserProfile(session.user.id);
            if (event === 'SIGNED_IN' && window.location.pathname !== '/auth/callback') {
              toast.success('Signed in successfully');
              navigate('/');
            }
          } else {
            setUserProfile(null);
            if (event === 'SIGNED_OUT') {
              toast.success('Signed out successfully');
            }
          }
        } catch (error) {
          console.error('Error in auth state change:', error);
        } finally {
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;

      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          fetchUserProfile(session.user.id);
        }
      } catch (error) {
        console.error('Error getting session:', error);
        toast.error('Failed to get session');
      } finally {
        setIsLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [navigate]);

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
    } catch (error: any) {
      toast.error(error.message || 'Error signing in');
      throw error;
    }
  };

  const signUp = async (email: string, password: string, userData?: any) => {
    let retries = 3;
    while (retries > 0) {
      try {
        console.log('Attempting signup...');
        const { error, data } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: userData,
            emailRedirectTo: `${window.location.origin}/auth/callback`
          }
        });
        
        if (error) {
          console.error('Signup error:', error);
          throw error;
        }
        
        console.log('Signup response:', data);
        toast.success('Signup successful! Please check your email for confirmation.');
        return;
      } catch (error: any) {
        console.error(`Signup attempt failed (${retries} retries left):`, error);
        if (error.message?.includes('network') || error.message?.includes('protocol') || error.message?.includes('fetch')) {
          // Network-related error, retry
          retries--;
          if (retries > 0) {
            toast.info(`Connection issue detected. Retrying... (${retries} attempts left)`);
            await new Promise(resolve => setTimeout(resolve, 1000));
            continue;
          }
        } else {
          // Non-network error, don't retry
          retries = 0;
        }
        
        toast.error(error.message || 'Error signing up');
        throw error;
      }
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting logout process...');
      
      // Add a timeout to prevent getting stuck
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Logout timeout')), 3000);
      });
      
      // Try to sign out with timeout protection
      const signOutPromise = supabase.auth.signOut();
      
      try {
        // Race between the signOut and timeout
        await Promise.race([signOutPromise, timeoutPromise]);
      } catch (error) {
        console.error('Signout operation timed out or failed:', error);
        // Continue with cleanup even if signOut failed
      }
      
      // Force clean up regardless of Supabase API response
      console.log('Clearing local storage and state...');
      
      // Clear all Supabase-related localStorage values
      try {
        // Clear any Supabase tokens from localStorage by key pattern
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i);
          if (key && (key.includes('supabase') || key.includes('sb-'))) {
            console.log('Removing localStorage key:', key);
            localStorage.removeItem(key);
          }
        }
      } catch (e) {
        console.error('Error clearing localStorage:', e);
      }
      
      // Reset all auth-related state
      setUser(null);
      setSession(null);
      setUserProfile(null);
      
      // Success message and navigate
      toast.success('Logged out successfully');
      
      // Redirect and force reload to ensure clean state
      window.location.href = '/auth';
    } catch (error) {
      console.error('Error during sign out:', error);
      
      // Force cleanup even on error
      setUser(null);
      setSession(null);
      setUserProfile(null);
      localStorage.clear(); // Last resort - clear all localStorage
      
      // Redirect and force reload
      window.location.href = '/auth';
    }
  };

  const signInWithGoogle = async () => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent'
          }
        }
      });
      
      if (error) {
        console.error('Google sign in error:', error);
        toast.error(error.message || 'Failed to sign in with Google');
        throw error;
      }
    } catch (error) {
      console.error('Error during Google sign in:', error);
      toast.error('An error occurred during Google sign in');
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      session, 
      userProfile, 
      isLoading, 
      signIn, 
      signUp, 
      signOut,
      signInWithGoogle 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
