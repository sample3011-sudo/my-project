import { Cashfree, CFEnvironment } from 'cashfree-pg';
import { env } from './env.config';

/**
 * Singleton Cashfree SDK instance.
 * v6+ uses constructor-based initialisation: new Cashfree(env, clientId, secretKey).
 */
const cfEnv: CFEnvironment =
  env.CASHFREE_ENV === 'production' ? CFEnvironment.PRODUCTION : CFEnvironment.SANDBOX;

export const cashfree = new Cashfree(cfEnv, env.CASHFREE_APP_ID, env.CASHFREE_SECRET_KEY);
