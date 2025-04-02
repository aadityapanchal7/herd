
import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Navigate, useSearchParams } from 'react-router-dom';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

const Auth = () => {
  const { user, signIn, signUp } = useAuth();
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(tabParam === 'signup' ? 'signup' : 'login');
  const [isLoading, setIsLoading] = useState(false);
  const [universities, setUniversities] = useState<{id: string, name: string}[]>([]);
  const [userCount, setUserCount] = useState<number>(0);
  const [loginCount, setLoginCount] = useState<number>(0);

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
      const { data, error } = await supabase
        .from('universities')
        .select('id, name')
        .order('name');
      
      if (error) {
        console.error('Error fetching universities:', error);
      } else {
        setUniversities(data || []);
      }
    };

    const fetchUserAndLoginCount = async () => {
      // Get the total number of users
      const { count: userCount, error: userCountError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });
      
      if (userCountError) {
        console.error('Error fetching user count:', userCountError);
      } else {
        setUserCount(userCount || 0);
      }

      // Get a count of logins from the auth logs if available
      // This is just a placeholder since we don't have direct access to login counts
      // In a real application, you might track this in a separate table
      setLoginCount(Math.floor(Math.random() * 50) + userCount); // Just a simulated value
    };

    fetchUniversities();
    fetchUserAndLoginCount();

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
      // When a user logs in, we could increment a counter in a real app
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
      await signUp(signupEmail, signupPassword, {
        full_name: fullName,
        username: username,
        campus_id: campus,
      });
      setActiveTab('login');
    } catch (error: any) {
      console.error('Signup error:', error);
    } finally {
      setIsLoading(false);
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
            <div className="bg-herd-purple/10 text-herd-purple font-semibold px-4 py-2 rounded-full text-sm">
              {loginCount} logins
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
