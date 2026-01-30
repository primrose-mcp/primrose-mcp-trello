/**
 * Webhook Tools
 *
 * MCP tools for Trello webhook management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all webhook-related tools
 */
export function registerWebhookTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // List Webhooks
  // ===========================================================================
  server.tool(
    'trello_list_webhooks',
    `List all webhooks for the current token.

Args:
  - format: Response format`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const webhooks = await client.getWebhooks();
        return formatResponse(webhooks, format, 'webhooks');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Webhook
  // ===========================================================================
  server.tool(
    'trello_get_webhook',
    `Get details of a specific webhook.

Args:
  - webhookId: The ID of the webhook
  - format: Response format`,
    {
      webhookId: z.string().describe('Webhook ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ webhookId, format }) => {
      try {
        const webhook = await client.getWebhook(webhookId);
        return formatResponse(webhook, format, 'webhook');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Webhook
  // ===========================================================================
  server.tool(
    'trello_create_webhook',
    `Create a new webhook to receive notifications.

Args:
  - callbackURL: URL to receive webhook events (required)
  - idModel: ID of the model to watch (board, list, card, etc.) (required)
  - description: Description of the webhook
  - active: Whether the webhook is active (default: true)`,
    {
      callbackURL: z.string().url().describe('Callback URL'),
      idModel: z.string().describe('Model ID to watch'),
      description: z.string().optional().describe('Description'),
      active: z.boolean().default(true).describe('Active status'),
    },
    async (input) => {
      try {
        const webhook = await client.createWebhook(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Webhook created', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Webhook
  // ===========================================================================
  server.tool(
    'trello_update_webhook',
    `Update a webhook.

Args:
  - webhookId: The ID of the webhook to update
  - callbackURL: New callback URL
  - idModel: New model ID to watch
  - description: New description
  - active: Enable/disable the webhook`,
    {
      webhookId: z.string().describe('Webhook ID'),
      callbackURL: z.string().url().optional().describe('New callback URL'),
      idModel: z.string().optional().describe('New model ID'),
      description: z.string().optional().describe('New description'),
      active: z.boolean().optional().describe('Active status'),
    },
    async ({ webhookId, ...input }) => {
      try {
        const webhook = await client.updateWebhook(webhookId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Webhook updated', webhook }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Webhook
  // ===========================================================================
  server.tool(
    'trello_delete_webhook',
    `Delete a webhook.

Args:
  - webhookId: The ID of the webhook to delete`,
    {
      webhookId: z.string().describe('Webhook ID'),
    },
    async ({ webhookId }) => {
      try {
        await client.deleteWebhook(webhookId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Webhook deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
