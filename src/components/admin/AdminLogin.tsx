import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Lock, User } from 'lucide-react';
import { adminPath } from '@/lib/admin-routing';
import { apiUrl } from '@/lib/api-base';

interface LoginFormData {
  username: string;
  password: string;
}

const AdminLogin: React.FC = () => {
  const [formData, setFormData] = useState<LoginFormData>({
    username: 'info@jeffhonforlocophotos.com',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const usernameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  // Password managers and browser autofill can fill the inputs without
  // firing React's onChange. That left the controlled state empty, so the
  // Sign In button stayed disabled even though credentials were visible.
  // Sync the real DOM values into state shortly after mount so autofilled
  // credentials register and enable the button.
  useEffect(() => {
    const syncAutofill = () => {
      setFormData(prev => {
        const username = usernameRef.current?.value ?? prev.username;
        const password = passwordRef.current?.value ?? prev.password;
        if (username === prev.username && password === prev.password) return prev;
        return { username, password };
      });
    };
    const timers = [100, 400, 1000, 2000].map(ms => window.setTimeout(syncAutofill, ms));
    return () => {
      timers.forEach(t => window.clearTimeout(t));
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError(null);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Read credentials from the form itself: autofill may have bypassed
    // React state, so the DOM is the source of truth here.
    const fd = new FormData(e.currentTarget);
    const username = String(fd.get('username') || '').trim();
    const password = String(fd.get('password') || '');
    if (!username || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setFormData({ username, password });
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(apiUrl('/api/v1/admin-auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ username, password })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || data.message || 'Login failed');
      }

      if (data.success) {
        // Store token and user info
        localStorage.setItem('adminToken', data.data.token);
        localStorage.setItem('adminUser', JSON.stringify(data.data.user));
        
        // Redirect to admin dashboard
        navigate(adminPath('overview'), { replace: true });
      } else {
        throw new Error(data.error || data.message || 'Login failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <Lock className="mx-auto h-12 w-12 text-gray-400" />
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Growth Command Center
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Private access for authorized studio operators
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Enter your admin credentials to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Email</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="username"
                      name="username"
                      type="text"
                      autoComplete="username"
                      required
                      ref={usernameRef}
                      value={formData.username}
                      onChange={handleInputChange}
                      className="pl-10"
                      placeholder="info@jeffhonforlocophotos.com"
                      disabled={loading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      required
                      ref={passwordRef}
                      value={formData.password}
                      onChange={handleInputChange}
                      className="pl-10 pr-10"
                      placeholder="Enter your password"
                      disabled={loading}
                    />
                    <button
                      type="button"
                      className="absolute right-3 top-3 h-4 w-4 text-gray-400 hover:text-gray-600"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={loading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <Button
                type="submit"
                className="w-full"
                disabled={loading || !formData.username || !formData.password}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Forgot your password? Contact the system administrator.
              </p>
            </div>
          </CardContent>
        </Card>

        <div className="text-center">
          <p className="text-xs text-gray-500">
            Jeff Honforloco Photography Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
