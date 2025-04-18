import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { FaGoogle } from 'react-icons/fa';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(tabParam === 'signup' ? 'signup' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState<{id: string, name: string}[]>([]);
  const [userCount, setUserCount] = useState<number>(0);

  // Hardcoded universities data
  const hardcodedUniversities = [
    { id: "1", name: "UT Austin" },
    { id: "2", name: "Georgia Tech" },
    { id: "4", name: "Harvard" },
    { id: "5", name: "Stanford" },
    { id: "6", name: "Ole Miss" },
  ];

  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Signup form state
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [signupConfirmPassword, setSignupConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [campus, setCampus] = useState('');

  // Error states
  const [loginError, setLoginError] = useState('');
  const [signupError, setSignupError] = useState('');

  // Fetch universities and user count on component mount
  useEffect(() => {
    const fetchUniversities = async () => {
      console.log('Fetching universities...');
      
      try {
        // First try to fetch from the database
        const { data, error } = await supabase
          .from('universities')
          .select('id, name')
          .order('name');
        
        if (error) {
          console.error('Error fetching universities:', error);
          // If there's an error or no data, use the hardcoded data
          console.log('Using hardcoded university data instead');
          setUniversities(hardcodedUniversities);
        } else if (data && data.length > 0) {
          console.log('Universities fetched successfully:', data);
          setUniversities(data);
        } else {
          // If there's no error but also no data, use the hardcoded data
          console.log('No universities found in database, using hardcoded data');
          setUniversities(hardcodedUniversities);
        }
      } catch (error) {
        console.error('Exception when fetching universities:', error);
        // In case of any exception, fall back to hardcoded data
        setUniversities(hardcodedUniversities);
      }
    };

    const fetchUserCount = async () => {
      const { count, error } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        console.error('Error fetching user count:', error);
      } else {
        setUserCount(count || 0);
      }
    };

    fetchUniversities();
    fetchUserCount();

    // Subscribe to real-time updates for profiles
    const channel = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'profiles' }, 
        () => {
          setUserCount(prevCount => prevCount + 1);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  // If user is already logged in, redirect to home
  if (user) {
    return <Navigate to="/" />;
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    
    if (!loginEmail || !loginPassword) {
      setLoginError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    try {
      await signIn(loginEmail, loginPassword);
    } catch (error: any) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupError('');
    
    if (!signupEmail || !signupPassword || !signupConfirmPassword) {
      setSignupError('Please fill in all required fields');
      return;
    }

    if (!campus) {
      setSignupError('Please select your campus');
      return;
    }

    if (signupPassword !== signupConfirmPassword) {
      setSignupError('Passwords do not match');
      return;
    }

    if (signupPassword.length < 6) {
      setSignupError('Password must be at least 6 characters');
      return;
    }

    setIsLoading(true);
    try {
      console.log('Starting signup process...');
      await signUp(signupEmail, signupPassword, {
        full_name: fullName,
        username: username,
        campus_id: campus,
      });
      console.log('Signup completed successfully');
      setActiveTab('login');
    } catch (error: any) {
      console.error('Signup error details:', error);
      if (error.message?.includes('network') || error.message?.includes('QUIC') || error.message?.includes('protocol')) {
        setSignupError('Network error. Please check your internet connection and try again.');
      } else {
        setSignupError(error.message || 'An unexpected error occurred during signup');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });
      if (error) throw error;
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            <span className="bg-gradient-to-r from-herd-purple-light to-herd-purple bg-clip-text text-transparent">
              Herd
            </span>
          </CardTitle>
          <CardDescription className="text-center">
            Connect with campus events
          </CardDescription>
          <div className="flex justify-center gap-2">
            <div className="bg-herd-purple/10 text-herd-purple font-semibold px-4 py-2 rounded-full text-sm">
              {userCount} users have joined
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <Button
              onClick={handleGoogleSignIn}
              variant="outline"
              className="w-full flex items-center justify-center gap-2"
            >
              <FaGoogle className="w-4 h-4" />
              Continue with Google
            </Button>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>

            <Tabs 
              defaultValue={activeTab} 
              onValueChange={(value) => setActiveTab(value as 'login' | 'signup')} 
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>

              <TabsContent value="login">
                <form onSubmit={handleLogin} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Input
                      id="email"
                      type="email"
                      placeholder="Email"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="password"
                      type="password"
                      placeholder="Password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                    />
                  </div>
                  {loginError && (
                    <div className="text-red-500 text-sm">{loginError}</div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-herd-purple hover:bg-herd-purple-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Signing in...' : 'Sign In'}
                  </Button>
                </form>
              </TabsContent>

              <TabsContent value="signup">
                <form onSubmit={handleSignup} className="space-y-4 mt-4">
                  <div className="space-y-2">
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="Email"
                      value={signupEmail}
                      onChange={(e) => setSignupEmail(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="full-name"
                      type="text"
                      placeholder="Full Name (optional)"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="username"
                      type="text"
                      placeholder="Username (optional)"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Select value={campus} onValueChange={setCampus}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your campus" />
                      </SelectTrigger>
                      <SelectContent>
                        {universities.map((uni) => (
                          <SelectItem key={uni.id} value={uni.id}>
                            {uni.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="Password"
                      value={signupPassword}
                      onChange={(e) => setSignupPassword(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="Confirm Password"
                      value={signupConfirmPassword}
                      onChange={(e) => setSignupConfirmPassword(e.target.value)}
                    />
                  </div>
                  {signupError && (
                    <div className="text-red-500 text-sm">{signupError}</div>
                  )}
                  <Button 
                    type="submit" 
                    className="w-full bg-herd-purple hover:bg-herd-purple-dark"
                    disabled={isLoading}
                  >
                    {isLoading ? 'Creating Account...' : 'Create Account'}
                  </Button>
                </form>
              </TabsContent>
            </Tabs>
          </div>
        </CardContent>
        <CardFooter>
          <p className="text-center text-sm text-gray-500 mt-2 w-full">
            By continuing, you agree to our Terms of Service and Privacy Policy. You'll receive email confirmations for events.
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Auth;
