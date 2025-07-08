import crypto from 'crypto-js';

interface AuthSession {
  token: string;
  expires: number;
  lastActivity: number;
  attempts: number;
}

interface LoginAttempt {
  timestamp: number;
  ip?: string;
}

// Secure admin credentials (in production, these should be environment variables)
const ADMIN_CREDENTIALS = {
  // Password: "JeffPhoto2024!" - hashed with SHA-256
  username: 'jeff.admin',
  passwordHash: '8d969eef6ecad3c29a3a629280e686cf0c3f5d5a86aff3ca12020c923adc6c92',
  salt: 'jeff-honforloco-salt-2024'
};

class AuthSecurity {
  private readonly SESSION_DURATION = 30 * 60 * 1000; // 30 minutes
  private readonly MAX_LOGIN_ATTEMPTS = 5;
  private readonly LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes
  private readonly SESSION_KEY = 'admin_session_secure';
  private readonly ATTEMPTS_KEY = 'login_attempts';

  // Generate secure session token
  private generateSessionToken(): string {
    const timestamp = Date.now().toString();
    const random = Math.random().toString(36).substring(2);
    return crypto.SHA256(timestamp + random + ADMIN_CREDENTIALS.salt).toString();
  }

  // Hash password with salt
  private hashPassword(password: string): string {
    return crypto.SHA256(password + ADMIN_CREDENTIALS.salt).toString();
  }

  // Encrypt session data
  private encryptSession(session: AuthSession): string {
    return crypto.AES.encrypt(JSON.stringify(session), ADMIN_CREDENTIALS.salt).toString();
  }

  // Decrypt session data
  private decryptSession(encryptedSession: string): AuthSession | null {
    try {
      const bytes = crypto.AES.decrypt(encryptedSession, ADMIN_CREDENTIALS.salt);
      const decrypted = bytes.toString(crypto.enc.Utf8);
      return JSON.parse(decrypted);
    } catch {
      return null;
    }
  }

  // Check if account is locked due to too many attempts
  private isAccountLocked(): boolean {
    const attemptsData = localStorage.getItem(this.ATTEMPTS_KEY);
    if (!attemptsData) return false;

    try {
      const attempts: LoginAttempt[] = JSON.parse(attemptsData);
      const recentAttempts = attempts.filter(
        attempt => Date.now() - attempt.timestamp < this.LOCKOUT_DURATION
      );

      return recentAttempts.length >= this.MAX_LOGIN_ATTEMPTS;
    } catch {
      return false;
    }
  }

  // Record failed login attempt
  private recordFailedAttempt(): void {
    const attemptsData = localStorage.getItem(this.ATTEMPTS_KEY);
    let attempts: LoginAttempt[] = [];

    try {
      attempts = attemptsData ? JSON.parse(attemptsData) : [];
    } catch {
      attempts = [];
    }

    attempts.push({ timestamp: Date.now() });
    
    // Keep only recent attempts
    const recentAttempts = attempts.filter(
      attempt => Date.now() - attempt.timestamp < this.LOCKOUT_DURATION
    );

    localStorage.setItem(this.ATTEMPTS_KEY, JSON.stringify(recentAttempts));
  }

  // Clear failed attempts on successful login
  private clearFailedAttempts(): void {
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  // Validate input to prevent injection attacks
  private validateInput(input: string): boolean {
    // Check for basic injection patterns
    const dangerousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /on\w+\s*=/gi,
      /\beval\s*\(/gi,
      /\bFunction\s*\(/gi,
    ];

    return !dangerousPatterns.some(pattern => pattern.test(input));
  }

  // Login with security checks
  async login(username: string, password: string): Promise<{ success: boolean; message: string; lockoutTime?: number }> {
    // Validate inputs
    if (!this.validateInput(username) || !this.validateInput(password)) {
      return { success: false, message: 'Invalid input detected' };
    }

    // Check if account is locked
    if (this.isAccountLocked()) {
      const attemptsData = localStorage.getItem(this.ATTEMPTS_KEY);
      if (attemptsData) {
        const attempts: LoginAttempt[] = JSON.parse(attemptsData);
        const lastAttempt = Math.max(...attempts.map(a => a.timestamp));
        const lockoutTime = lastAttempt + this.LOCKOUT_DURATION;
        return { 
          success: false, 
          message: 'Account temporarily locked due to multiple failed attempts',
          lockoutTime 
        };
      }
    }

    // Verify credentials
    const hashedPassword = this.hashPassword(password);
    
    if (username !== ADMIN_CREDENTIALS.username || hashedPassword !== ADMIN_CREDENTIALS.passwordHash) {
      this.recordFailedAttempt();
      return { success: false, message: 'Invalid credentials' };
    }

    // Create secure session
    const session: AuthSession = {
      token: this.generateSessionToken(),
      expires: Date.now() + this.SESSION_DURATION,
      lastActivity: Date.now(),
      attempts: 0
    };

    // Store encrypted session
    const encryptedSession = this.encryptSession(session);
    localStorage.setItem(this.SESSION_KEY, encryptedSession);

    // Clear failed attempts
    this.clearFailedAttempts();

    return { success: true, message: 'Login successful' };
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    const encryptedSession = localStorage.getItem(this.SESSION_KEY);
    if (!encryptedSession) return false;

    const session = this.decryptSession(encryptedSession);
    if (!session) return false;

    // Check if session is expired
    if (Date.now() > session.expires) {
      this.logout();
      return false;
    }

    // Check if session is inactive for too long
    if (Date.now() - session.lastActivity > this.SESSION_DURATION / 2) {
      this.logout();
      return false;
    }

    // Update last activity
    session.lastActivity = Date.now();
    const updatedEncryptedSession = this.encryptSession(session);
    localStorage.setItem(this.SESSION_KEY, updatedEncryptedSession);

    return true;
  }

  // Logout and clear session
  logout(): void {
    localStorage.removeItem(this.SESSION_KEY);
    localStorage.removeItem(this.ATTEMPTS_KEY);
  }

  // Get session info
  getSessionInfo(): { timeLeft: number; lastActivity: number } | null {
    const encryptedSession = localStorage.getItem(this.SESSION_KEY);
    if (!encryptedSession) return null;

    const session = this.decryptSession(encryptedSession);
    if (!session) return null;

    return {
      timeLeft: session.expires - Date.now(),
      lastActivity: session.lastActivity
    };
  }

  // Force logout all sessions (useful for security)
  forceLogoutAll(): void {
    localStorage.clear();
  }
}

export const authSecurity = new AuthSecurity();
