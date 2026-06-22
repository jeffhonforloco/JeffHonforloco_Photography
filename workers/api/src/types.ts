export interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
  SIREIQ_HF_TOKEN?: string;
  SIREIQ_HF_MODEL?: string;
  OPENAI_API_KEY: string;
  RESEND_API_KEY: string;
  JWT_SECRET: string;
  ADMIN_EMAIL: string;
  ALLOWED_ORIGIN: string;
}

export type AppEnv = {
  Bindings: Env;
  Variables: {
    userId: number;
    userRole: string;
    username: string;
  };
};

export interface JWTPayload {
  id: number;
  username: string;
  role: string;
  exp: number;
  iat: number;
}
