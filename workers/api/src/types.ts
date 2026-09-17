export interface Env {
  DB: D1Database;
  MEDIA_BUCKET: R2Bucket;
  SUPABASE_URL: string;
  SUPABASE_SERVICE_ROLE_KEY: string;
  ANTHROPIC_API_KEY: string;
  SIREIQ_HF_TOKEN?: string;
  SEOAGENTPRO_HF_TOKEN?: string;
  SIREIQ_HF_MODEL?: string;
  OPENAI_API_KEY: string;
  RESEND_API_KEY: string;
  STREAM_API_TOKEN?: string;
  STREAM_ACCOUNT_ID?: string;
  PAYPAL_CLIENT_ID?: string;
  PAYPAL_CLIENT_SECRET?: string;
  PAYPAL_WEBHOOK_ID?: string;
  PAYPAL_MODE?: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ALLOWED_ORIGIN: string;
  ALLOWED_ORIGINS?: string;
  PUBLIC_API_BASE_URL?: string;
  BUSINESS_POSTAL_ADDRESS?: string;
  GOOGLE_SEARCH_CONSOLE_CLIENT_EMAIL?: string;
  GOOGLE_SEARCH_CONSOLE_PRIVATE_KEY?: string;
  GOOGLE_BUSINESS_PROFILE_ACCOUNT_ID?: string;
  GITHUB_APP_ID?: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    userId: number;
    userRole: string;
    username: string;
    sessionId: string;
    sessionExpiresAt: number;
  };
};

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
  jti?: string;
}
