export interface Env {
  DB: D1Database;
  ANTHROPIC_API_KEY: string;
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
