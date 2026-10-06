declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    GOOGLE_CLIENT_ID?: string;
    GOOGLE_CLIENT_SECRET?: string;
    APP_ORIGIN?: string;
    TOKEN_ENCRYPTION_KEY?: string;
    BUCKET?: R2Bucket;
  }
}
