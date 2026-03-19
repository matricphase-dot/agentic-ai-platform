import * as Sentry from "@sentry/node";
import { nodeProfilingIntegration } from "@sentry/profiling-node";

export function initSentry(app: any) {
  Sentry.init({
    dsn: process.env.SENTRY_DSN || "YOUR_DSN_HERE",
    integrations: [
      nodeProfilingIntegration(),
      new Sentry.Integrations.Http({ tracing: true }),
      new Sentry.Integrations.Express({ app }),
    ],
    tracesSampleRate: 1.0, // Adjust in production
    profilesSampleRate: 1.0,
    environment: process.env.NODE_ENV || 'development',
  });

  // RequestHandler creates a separate execution context using domains, so that every transaction is isolated.
  app.use(Sentry.Handlers.requestHandler());
  // TracingHandler creates a trace for every incoming request
  app.use(Sentry.Handlers.tracingHandler());
}
