/**
 * n8n Integration - Trusted Header Single Sign-On Hook
 *
 * This hook enables n8n to bypass its native login page by accepting authentication
 * via a trusted header from SSO.
 *
 * Original source: https://kb.jarylchng.com/i/n8n-and-authelia-bypass-n8n-native-login-page-usin-sNRmS-7j5u1/
 * Author: Jaryl Chng
 * Modified and refactored for improved readability and documentation
 */

const { dirname, resolve } = require('path');
const Layer = require('express/lib/router/layer');
const { issueCookie } = require(
  resolve(dirname(require.resolve('n8n')), 'auth/jwt'),
);

// Define URL patterns that should bypass authentication checks
const ignoreAuthRegexp = /^\/(assets|healthz|webhook|rest\/oauth2-credential)/;

module.exports = {
  n8n: {
    ready: [
      async function ({ app }, config) {
        // Get the Express router stack
        const { stack } = app._router;

        // Find the position of the cookieParser middleware
        // (we want to insert our middleware right after it)
        const index = stack.findIndex((l) => l.name === 'cookieParser');

        // Create and insert our custom authentication middleware
        stack.splice(
          index + 1,
          0,
          new Layer(
            '/',
            {
              strict: false,
              end: false,
            },
            async (req, res, next) => {
              // Skip authentication for static assets, health checks, webhooks, etc.
              if (ignoreAuthRegexp.test(req.url)) return next();

              // Skip if n8n user management isn't fully set up yet
              if (!config.get('userManagement.isInstanceOwnerSetUp', false))
                return next();

              // Skip if user is already authenticated with n8n
              if (req.cookies?.['n8n-auth']) return next();

              // Skip if the trusted header environment variable isn't configured
              if (!process.env.N8N_FORWARD_AUTH_HEADER) return next();

              // Get the user's email from the configured header
              // (typically set by an SSO solution via reverse proxy)
              const headerName =
                process.env.N8N_FORWARD_AUTH_HEADER.toLowerCase();
              const email = req.headers[headerName];

              // Skip if the header isn't present in the request
              if (!email) return next();

              // Look up the user by email in the n8n database
              try {
                const user = await this.dbCollections.User.findOneBy({ email });

                // If user doesn't exist, return a 401 with a helpful message
                if (!user) {
                  res.statusCode = 401;
                  res.end(
                    `User ${email} not found, please have an admin invite the user first.`,
                  );
                  return;
                }

                // Issue an n8n authentication cookie for the user
                issueCookie(res, user);
                return next();
              } catch (error) {
                console.error('Error during SSO authentication:', error);
                return next();
              }
            },
          ),
        );
      },
    ],
  },
};
