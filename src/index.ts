/**
 * Trello MCP Server - Main Entry Point
 *
 * This file sets up the MCP server using Cloudflare's Agents SDK.
 * It supports both stateless (McpServer) and stateful (McpAgent) modes.
 *
 * MULTI-TENANT ARCHITECTURE:
 * Tenant credentials (API key + token) are parsed from request headers,
 * allowing a single server deployment to serve multiple customers.
 *
 * Required Headers:
 * - X-Trello-API-Key: Trello API key
 * - X-Trello-Token: Trello API token
 *
 * Get your API key and token from: https://trello.com/power-ups/admin
 */

import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { createTrelloClient } from './client.js';
import { registerAllTools } from './tools/index.js';
import {
  type Env,
  type TenantCredentials,
  parseTenantCredentials,
  validateCredentials,
} from './types/env.js';

// =============================================================================
// MCP Server Configuration
// =============================================================================

const SERVER_NAME = 'primrose-mcp-trello';
const SERVER_VERSION = '1.0.0';

// =============================================================================
// MCP Agent (Stateful - uses Durable Objects)
// =============================================================================

/**
 * McpAgent provides stateful MCP sessions backed by Durable Objects.
 *
 * NOTE: For multi-tenant deployments, use the stateless mode instead.
 * The stateful McpAgent is better suited for single-tenant deployments where
 * credentials can be stored as wrangler secrets.
 *
 * @deprecated For multi-tenant support, use stateless mode with per-request credentials
 */
export class TrelloMcpAgent extends McpAgent<Env> {
  server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  async init() {
    throw new Error(
      'Stateful mode (McpAgent) is not supported for multi-tenant deployments. ' +
        'Use the stateless /mcp endpoint with X-Trello-API-Key and X-Trello-Token headers instead.'
    );
  }
}

// =============================================================================
// Stateless MCP Server (Recommended - no Durable Objects needed)
// =============================================================================

/**
 * Creates a stateless MCP server instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides credentials via headers, allowing
 * a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
function createStatelessServer(credentials: TenantCredentials): McpServer {
  const server = new McpServer({
    name: SERVER_NAME,
    version: SERVER_VERSION,
  });

  // Create client with tenant-specific credentials
  const client = createTrelloClient(credentials);

  // Register all Trello tools
  registerAllTools(server, client);

  // Test connection tool
  server.tool('trello_test_connection', 'Test the connection to the Trello API', {}, async () => {
    try {
      const result = await client.testConnection();
      return {
        content: [{ type: 'text', text: JSON.stringify(result, null, 2) }],
      };
    } catch (error) {
      return {
        content: [
          {
            type: 'text',
            text: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
          },
        ],
        isError: true,
      };
    }
  });

  return server;
}

// =============================================================================
// Worker Export
// =============================================================================

export default {
  /**
   * Main fetch handler for the Worker
   */
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(JSON.stringify({ status: 'ok', server: SERVER_NAME }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // ==========================================================================
    // Stateless MCP with Streamable HTTP (Recommended for multi-tenant)
    // ==========================================================================
    if (url.pathname === '/mcp' && request.method === 'POST') {
      // Parse tenant credentials from request headers
      const credentials = parseTenantCredentials(request);

      // Validate credentials are present
      try {
        validateCredentials(credentials);
      } catch (error) {
        return new Response(
          JSON.stringify({
            error: 'Unauthorized',
            message: error instanceof Error ? error.message : 'Invalid credentials',
            required_headers: ['X-Trello-API-Key', 'X-Trello-Token'],
            get_credentials: 'https://trello.com/power-ups/admin',
          }),
          {
            status: 401,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Create server with tenant-specific credentials
      const server = createStatelessServer(credentials);

      // Import and use createMcpHandler for streamable HTTP
      const { createMcpHandler } = await import('agents/mcp');
      const handler = createMcpHandler(server);
      return handler(request, env, ctx);
    }

    // SSE endpoint for legacy clients
    if (url.pathname === '/sse') {
      return new Response('SSE endpoint requires Durable Objects. Enable in wrangler.jsonc.', {
        status: 501,
      });
    }

    // Default response
    return new Response(
      JSON.stringify({
        name: SERVER_NAME,
        version: SERVER_VERSION,
        description: 'Multi-tenant Trello MCP Server',
        endpoints: {
          mcp: '/mcp (POST) - Streamable HTTP MCP endpoint',
          health: '/health - Health check',
        },
        authentication: {
          description: 'Pass tenant credentials via request headers',
          required_headers: {
            'X-Trello-API-Key': 'Trello API key',
            'X-Trello-Token': 'Trello API token',
          },
          get_credentials: 'https://trello.com/power-ups/admin',
        },
        available_tools: [
          // Boards
          'trello_list_boards',
          'trello_get_board',
          'trello_create_board',
          'trello_update_board',
          'trello_delete_board',
          'trello_get_board_lists',
          'trello_get_board_cards',
          'trello_get_board_members',
          'trello_get_board_labels',
          'trello_get_board_actions',
          'trello_add_board_member',
          'trello_remove_board_member',
          'trello_get_board_custom_fields',
          // Lists
          'trello_get_list',
          'trello_create_list',
          'trello_update_list',
          'trello_archive_list',
          'trello_unarchive_list',
          'trello_get_list_cards',
          'trello_archive_all_cards_in_list',
          'trello_move_all_cards_in_list',
          // Cards
          'trello_get_card',
          'trello_create_card',
          'trello_update_card',
          'trello_delete_card',
          'trello_archive_card',
          'trello_unarchive_card',
          'trello_move_card',
          'trello_add_comment',
          'trello_get_card_comments',
          'trello_add_label_to_card',
          'trello_remove_label_from_card',
          'trello_add_member_to_card',
          'trello_remove_member_from_card',
          'trello_get_card_attachments',
          'trello_add_attachment',
          'trello_delete_attachment',
          'trello_get_card_custom_fields',
          'trello_set_card_custom_field',
          // Checklists
          'trello_get_checklist',
          'trello_create_checklist',
          'trello_update_checklist',
          'trello_delete_checklist',
          'trello_get_card_checklists',
          'trello_create_check_item',
          'trello_update_check_item',
          'trello_delete_check_item',
          // Labels
          'trello_get_label',
          'trello_create_label',
          'trello_update_label',
          'trello_delete_label',
          // Members
          'trello_get_me',
          'trello_get_member',
          'trello_get_member_boards',
          'trello_get_member_cards',
          'trello_get_member_organizations',
          'trello_search_members',
          // Organizations
          'trello_get_organization',
          'trello_create_organization',
          'trello_update_organization',
          'trello_delete_organization',
          'trello_get_organization_members',
          'trello_get_organization_boards',
          // Search
          'trello_search',
          // Webhooks
          'trello_list_webhooks',
          'trello_get_webhook',
          'trello_create_webhook',
          'trello_update_webhook',
          'trello_delete_webhook',
          // Custom Fields
          'trello_get_custom_field',
          'trello_create_custom_field',
          'trello_update_custom_field',
          'trello_delete_custom_field',
          'trello_get_custom_field_options',
          'trello_add_custom_field_option',
          'trello_delete_custom_field_option',
          // Connection
          'trello_test_connection',
        ],
      }),
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
  },
};
