import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { Leaf, User, Truck, Store, AlertTriangle, CheckCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { projectId, publicAnonKey } from '../utils/supabase/info';
import { useLanguage } from './LanguageContext';

interface AuthModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onAuthSuccess: (user: any) => void;
}

export function AuthModal({ isOpen, onOpenChange, onAuthSuccess }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState('signin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const { t } = useLanguage();

  // Sign in form state
  const [signinData, setSigninData] = useState({
    email: '',
    password: ''
  });

  // Sign up form state
  const [signupData, setSignupData] = useState({
    name: '',
    email: '',
    password: '',
    userType: '',
    location: '',
    aadhaarNumber: ''
  });

  const supabase = createClient(
    `https://${projectId}.supabase.co`,
    publicAnonKey
  );

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: signinData.email,
        password: signinData.password,
      });

      if (error) {
        setError(`Sign in error: ${error.message}`);
        return;
      }

      if (data.session) {
        setSuccess('Successfully signed in!');
        onAuthSuccess(data.user);
        onOpenChange(false);
      }
    } catch (err) {
      console.error('Sign in error:', err);
      setError('Failed to sign in. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!signupData.name || !signupData.email || !signupData.password || !signupData.userType || !signupData.location || !signupData.aadhaarNumber) {
      setError('All fields are required');
      setLoading(false);
      return;
    }

    // Validate Aadhaar number (12 digits)
    const aadhaarRegex = /^\d{12}$/;
    if (!aadhaarRegex.test(signupData.aadhaarNumber)) {
      setError('Aadhaar number must be exactly 12 digits');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-2a067818/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${publicAnonKey}`
        },
        body: JSON.stringify(signupData)
      });

      const result = await response.json();

      if (!response.ok) {
        setError(`Sign up error: ${result.error || 'Unknown error'}`);
        return;
      }

      setSuccess('Account created successfully! You can now sign in.');
      setActiveTab('signin');
      setSignupData({
        name: '',
        email: '',
        password: '',
        userType: '',
        location: '',
        aadhaarNumber: ''
      });
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getUserTypeIcon = (type: string) => {
    switch (type) {
      case 'farmer': return <Leaf className="size-4" />;
      case 'wholesaler': return <Truck className="size-4" />;
      case 'retailer': return <Store className="size-4" />;
      case 'consumer': return <User className="size-4" />;
      default: return <User className="size-4" />;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md bg-gradient-to-br from-white to-green-50/50 border-green-200">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 justify-center">
            <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white p-3 rounded-xl shadow-lg">
              <Leaf className="size-6" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              SmartBhoomi Access
            </span>
          </DialogTitle>
          <DialogDescription className="text-center text-lg">
            Join the blockchain-powered agricultural revolution
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="size-4 text-green-600" />
            <AlertDescription className="text-green-800">{success}</AlertDescription>
          </Alert>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="signin">{t('signin')}</TabsTrigger>
            <TabsTrigger value="signup">{t('signup')}</TabsTrigger>
          </TabsList>

          <TabsContent value="signin" className="space-y-4">
            <form onSubmit={handleSignIn} className="space-y-4">
              <div>
                <Label htmlFor="signin-email">Email</Label>
                <Input
                  id="signin-email"
                  type="email"
                  value={signinData.email}
                  onChange={(e) => setSigninData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signin-password">Password</Label>
                <Input
                  id="signin-password"
                  type="password"
                  value={signinData.password}
                  onChange={(e) => setSigninData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Enter your password"
                  required
                />
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="signup" className="space-y-4">
            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <Label htmlFor="signup-name">Full Name</Label>
                <Input
                  id="signup-name"
                  type="text"
                  value={signupData.name}
                  onChange={(e) => setSignupData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter your full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-email">Email</Label>
                <Input
                  id="signup-email"
                  type="email"
                  value={signupData.email}
                  onChange={(e) => setSignupData(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="signup-password">Password</Label>
                <Input
                  id="signup-password"
                  type="password"
                  value={signupData.password}
                  onChange={(e) => setSignupData(prev => ({ ...prev, password: e.target.value }))}
                  placeholder="Create a password"
                  required
                />
              </div>

              <div>
                <Label htmlFor="user-type">User Type</Label>
                <Select value={signupData.userType} onValueChange={(value) => setSignupData(prev => ({ ...prev, userType: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="farmer">
                      <div className="flex items-center gap-2">
                        <Leaf className="size-4" />
                        Farmer
                      </div>
                    </SelectItem>
                    <SelectItem value="wholesaler">
                      <div className="flex items-center gap-2">
                        <Truck className="size-4" />
                        Wholesaler
                      </div>
                    </SelectItem>
                    <SelectItem value="retailer">
                      <div className="flex items-center gap-2">
                        <Store className="size-4" />
                        Retailer
                      </div>
                    </SelectItem>
                    <SelectItem value="consumer">
                      <div className="flex items-center gap-2">
                        <User className="size-4" />
                        Consumer
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="signup-location">Location</Label>
                <Input
                  id="signup-location"
                  type="text"
                  value={signupData.location}
                  onChange={(e) => setSignupData(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="e.g., Bhubaneswar, Odisha"
                  required
                />
              </div>

              <div>
                <Label htmlFor="aadhaar-number">Aadhaar Number</Label>
                <Input
                  id="aadhaar-number"
                  type="text"
                  value={signupData.aadhaarNumber}
                  onChange={(e) => {
                    const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                    setSignupData(prev => ({ ...prev, aadhaarNumber: value }));
                  }}
                  placeholder="Enter 12-digit Aadhaar number"
                  maxLength={12}
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Required for identity verification as per Indian regulations
                </p>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 transition-all duration-300" 
                disabled={loading}
              >
                {loading ? 'Creating account...' : 'Sign Up'}
              </Button>
            </form>
          </TabsContent>
        </Tabs>

        <div className="text-center text-sm text-gray-500">
          <p>Demo credentials for testing:</p>
          <p>Email: demo@farmer.com | Password: demo123</p>
        </div>
      </DialogContent>
    </Dialog>
  );
}