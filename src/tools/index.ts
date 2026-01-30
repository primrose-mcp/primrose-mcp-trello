/**
 * Trello MCP Tools
 *
 * This module exports all Trello tool registration functions.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { TrelloClient } from '../client.js';

import { registerBoardTools } from './boards.js';
import { registerCardTools } from './cards.js';
import { registerChecklistTools } from './checklists.js';
import { registerCustomFieldTools } from './customfields.js';
import { registerLabelTools } from './labels.js';
import { registerListTools } from './lists.js';
import { registerMemberTools } from './members.js';
import { registerOrganizationTools } from './organizations.js';
import { registerSearchTools } from './search.js';
import { registerWebhookTools } from './webhooks.js';

/**
 * Register all Trello tools with the MCP server
 */
export function registerAllTools(server: McpServer, client: TrelloClient): void {
  registerBoardTools(server, client);
  registerListTools(server, client);
  registerCardTools(server, client);
  registerChecklistTools(server, client);
  registerLabelTools(server, client);
  registerMemberTools(server, client);
  registerOrganizationTools(server, client);
  registerSearchTools(server, client);
  registerWebhookTools(server, client);
  registerCustomFieldTools(server, client);
}

// Re-export individual tool registration functions
export {
  registerBoardTools,
  registerCardTools,
  registerChecklistTools,
  registerCustomFieldTools,
  registerLabelTools,
  registerListTools,
  registerMemberTools,
  registerOrganizationTools,
  registerSearchTools,
  registerWebhookTools,
};
