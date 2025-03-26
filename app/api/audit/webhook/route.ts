import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { z } from 'zod';

// Define the webhook configuration schema
const webhookConfigSchema = z.object({
  url: z.string().url('Invalid webhook URL format'),
  secret: z.string().min(1, 'Webhook secret is required'),
  events: z.array(z.string()).default(['all']),
  headers: z.record(z.string()).optional(),
});

// Type for the webhook configuration
type WebhookConfig = z.infer<typeof webhookConfigSchema>;

// Path to the webhooks configuration file
const getWebhooksConfigPath = () => {
  const dataDir = path.join(process.cwd(), '.data', 'openwebui');

  // Create directory if it doesn't exist
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  return path.join(dataDir, 'webhooks.json');
};

// Get current webhook configurations
const getWebhookConfigurations = (): WebhookConfig[] => {
  const configPath = getWebhooksConfigPath();

  if (!fs.existsSync(configPath)) {
    return [];
  }

  try {
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.error('Error reading webhook configurations:', error);
    return [];
  }
};

// Save webhook configurations
const saveWebhookConfigurations = (configs: WebhookConfig[]) => {
  const configPath = getWebhooksConfigPath();
  fs.writeFileSync(configPath, JSON.stringify(configs, null, 2));
};

/**
 * GET /api/audit/webhook - List all configured webhooks
 */
export async function GET(request: NextRequest) {
  try {
    const webhooks = getWebhookConfigurations();

    // Mask secrets for security
    const maskedWebhooks = webhooks.map((webhook) => ({
      ...webhook,
      secret: webhook.secret ? '••••••••' : '',
    }));

    return NextResponse.json({ webhooks: maskedWebhooks });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to retrieve webhook configurations',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * POST /api/audit/webhook - Configure a new webhook
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate request body against schema
    const validationResult = webhookConfigSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid webhook configuration',
          details: validationResult.error.format(),
        },
        { status: 400 },
      );
    }

    const newWebhook = validationResult.data;

    // Get existing webhooks and add the new one
    const webhooks = getWebhookConfigurations();

    // Check if a webhook with the same URL already exists
    const existingWebhookIndex = webhooks.findIndex(
      (wh) => wh.url === newWebhook.url,
    );

    if (existingWebhookIndex >= 0) {
      // Update existing webhook
      webhooks[existingWebhookIndex] = newWebhook;
    } else {
      // Add new webhook
      webhooks.push(newWebhook);
    }

    // Save the updated webhooks
    saveWebhookConfigurations(webhooks);

    return NextResponse.json({
      success: true,
      message: 'Webhook configured successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to configure webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}

/**
 * DELETE /api/audit/webhook - Remove a webhook configuration
 */
export async function DELETE(request: NextRequest) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: 'Webhook URL is required' },
        { status: 400 },
      );
    }

    // Get existing webhooks
    const webhooks = getWebhookConfigurations();

    // Filter out the webhook to delete
    const updatedWebhooks = webhooks.filter((wh) => wh.url !== url);

    if (webhooks.length === updatedWebhooks.length) {
      return NextResponse.json({ error: 'Webhook not found' }, { status: 404 });
    }

    // Save the updated webhooks
    saveWebhookConfigurations(updatedWebhooks);

    return NextResponse.json({
      success: true,
      message: 'Webhook removed successfully',
    });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      {
        error: 'Failed to remove webhook',
        message: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    );
  }
}
