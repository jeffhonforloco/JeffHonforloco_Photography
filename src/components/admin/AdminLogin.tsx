import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Label } from '../ui/label';
import { useToast } from '../../hooks/use-toast';
import { authSecurity } from '../../lib/auth-security';
import { AlertTriangle, Shield, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';

interface AdminLoginProps {
  onLogin: (success: boolean) => void;
}

const AdminLogin = ({ onLogin }: AdminLoginProps) => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const [lockoutInfo, setLockoutInfo] = useState<{ locked: boolean; timeLeft: number } | null>(null);
  const [showSecureInfo, setShowSecureInfo] = useState(false);
  const { toast } = useToast();

  // Check lockout status on component mount
  useEffect(() => {
    const checkLockout = () => {
      // This will be handled by the auth service
    };
    checkLockout();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    // Use secure authentication
    try {
      const result = await authSecurity.login(credentials.username, credentials.password);
      
      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Welcome to the secure admin panel!",
        });
        onLogin(true);
      } else {
        toast({
          title: "Login Failed",
          description: result.message,
          variant: "destructive",
        });

        // Handle lockout
        if (result.lockoutTime) {
          const timeLeft = result.lockoutTime - Date.now();
          setLockoutInfo({ locked: true, timeLeft });
        }
      }
    } catch (error) {
      toast({
        title: "Authentication Error",
        description: "An error occurred during authentication. Please try again.",
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const formatLockoutTime = (ms: number): string => {
    const minutes = Math.ceil(ms / (1000 * 60));
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-black border-gray-800">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center mb-2">
            <Shield className="h-8 w-8 text-photo-red mr-2" />
            <CardTitle className="text-2xl font-bold text-white">Secure Admin Panel</CardTitle>
          </div>
          <CardDescription className="text-gray-400">
            Protected access to Jeff Honforloco Photography admin dashboard
          </CardDescription>
        </CardHeader>
        <CardContent>
          {lockoutInfo?.locked && (
            <Alert className="mb-4 border-red-600 bg-red-900/20">
              <AlertTriangle className="h-4 w-4 text-red-400" />
              <AlertDescription className="text-red-300">
                Account temporarily locked. Try again in {formatLockoutTime(lockoutInfo.timeLeft)}.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white">Username</Label>
              <Input
                id="username"
                type="text"
                value={credentials.username}
                onChange={(e) => setCredentials({ ...credentials, username: e.target.value.trim() })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter your username"
                required
                disabled={lockoutInfo?.locked}
                maxLength={50}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-white">Password</Label>
              <Input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                className="bg-gray-800 border-gray-700 text-white"
                placeholder="Enter your password"
                required
                disabled={lockoutInfo?.locked}
                maxLength={100}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-photo-red hover:bg-photo-red-hover"
              disabled={isLoading || lockoutInfo?.locked}
            >
              {isLoading ? (
                <>
                  <Clock className="mr-2 h-4 w-4 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Sign In Securely'
              )}
            </Button>
          </form>

          {/* Security Information */}
          <div className="mt-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSecureInfo(!showSecureInfo)}
              className="text-gray-400 hover:text-white w-full"
            >
              {showSecureInfo ? 'Hide' : 'Show'} Security Information
            </Button>
            
            {showSecureInfo && (
              <div className="mt-2 p-3 bg-gray-900 rounded-lg text-sm text-gray-400 space-y-2">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>AES-256 encryption for session data</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>SHA-256 password hashing with salt</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>Rate limiting & account lockout protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-green-400" />
                  <span>30-minute secure session timeout</span>
                </div>
                <div className="text-xs text-gray-500 mt-2 border-t border-gray-800 pt-2">
                  <p><strong>New Secure Credentials:</strong></p>
                  <p>Username: <code className="bg-gray-800 px-1 rounded">jeff.admin</code></p>
                  <p>Password: <code className="bg-gray-800 px-1 rounded">JeffPhoto2024!</code></p>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminLogin;