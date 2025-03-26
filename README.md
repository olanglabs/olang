# olang

A collaborative AI development workspace with unified authentication.

## Features

- Single Sign-On via Authelia
- Integrated AI tools: OpenWebUI, n8n, Supabase, and more
- Next.js frontend with React 19 and Tailwind CSS

## Quick Start

1. Start the services:

   ```bash
   ./start.sh
   ```

   This will:

   - Install the necessary certificates
   - Run Docker Compose to start all services

2. Access services at:
   - Authelia: https://auth.app.localhost/
   - OpenWebUI: https://openwebui.app.localhost/
   - n8n: https://n8n.app.localhost/
   - Supabase: https://supabase.app.localhost/

## Services

| Service                   | URL                                 |
|---------------------------|-------------------------------------|
| Main Application          | https://app.localhost               |
| Authentication (Authelia) | https://auth.app.localhost          |
| OpenWebUI                 | https://openwebui.app.localhost     |
| n8n                       | https://n8n.app.localhost           |
| Supabase Studio           | https://supabase.app.localhost      |
| Supabase Meta             | https://meta.supabase.app.localhost |
| Langflow                  | https://langflow.app.localhost      |

Default logins:

| Username | Password | Email             |
|----------|----------|-------------------|
| admin    | admin    | admin@example.com |
| dev      | dev      | dev@example.com   |
| user     | user     | user@example.com  |

> **Note:** To log out, navigate to https://auth.app.localhost if you are not using SSO.

## Certificate Setup

The certificate is automatically installed by the startup script:

- macOS: Added to Keychain
- Windows/Linux: Follow prompts during installation

## Development

```bash
npm run next:dev   # Run Next.js in development mode
npm run format     # Format code with Prettier
npm run stop       # Stop all Docker services
```

## Tech Stack

- Next.js 15
- React 19
- Tailwind CSS 4
- Docker & Docker Compose
- Caddy (reverse proxy)
