// This file configures the initialization of Sentry on the server.
// The config you add here will be used whenever the server handles a request.
// https://docs.sentry.io/platforms/javascript/guides/nextjs/

import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,

  // Adjust this value in production, or use tracesSampler for greater control
  tracesSampleRate: 1.0,

  // Setting this option to true will print useful information to the console while you're setting up Sentry.
  debug: false,

  // Environment-specific configuration
  environment: process.env.SENTRY_ENVIRONMENT || "development",

  // Filter out sensitive data
  beforeSend(event, hint) {
    // Filter out events from development
    if (process.env.NODE_ENV === "development") {
      return null;
    }

    // Remove sensitive request data
    if (event.request) {
      // Remove authorization headers
      if (event.request.headers) {
        delete event.request.headers.authorization;
        delete event.request.headers.cookie;
      }

      // Remove sensitive query params
      if (event.request.query_string) {
        event.request.query_string = event.request.query_string
          .split("&")
          .filter(
            (param) =>
              !param.startsWith("token=") &&
              !param.startsWith("password=") &&
              !param.startsWith("api_key=")
          )
          .join("&");
      }
    }

    // Remove sensitive data from extra context
    if (event.extra) {
      delete event.extra.password;
      delete event.extra.token;
      delete event.extra.apiKey;
      delete event.extra.ssn;
    }

    return event;
  },
});
