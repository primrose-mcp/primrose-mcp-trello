/**
 * Search Tools
 *
 * MCP tools for Trello search functionality.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all search-related tools
 */
export function registerSearchTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Search
  // ===========================================================================
  server.tool(
    'trello_search',
    `Search across Trello for boards, cards, members, and organizations.

Uses Trello's search syntax. Examples:
- "bug fix" - Search for "bug fix"
- "@username" - Search by member
- "#label" - Search by label
- "board:BoardName" - Search in specific board
- "is:open" - Filter by open items
- "due:week" - Cards due this week

Args:
  - query: Search query (required)
  - modelTypes: Types to search (boards, cards, members, organizations)
  - idBoards: Limit search to specific board IDs
  - cards_limit: Max cards to return (default: 10)
  - boards_limit: Max boards to return (default: 10)
  - partial: Enable partial matching
  - format: Response format`,
    {
      query: z.string().describe('Search query'),
      modelTypes: z.array(z.enum(['boards', 'cards', 'members', 'organizations'])).optional().describe('Types to search'),
      idBoards: z.array(z.string()).optional().describe('Limit to board IDs'),
      cards_limit: z.number().int().min(1).max(1000).default(10).describe('Max cards'),
      boards_limit: z.number().int().min(1).max(1000).default(10).describe('Max boards'),
      partial: z.boolean().default(true).describe('Enable partial matching'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, modelTypes, idBoards, cards_limit, boards_limit, partial, format }) => {
      try {
        const results = await client.search(query, {
          modelTypes,
          idBoards,
          cards_limit,
          boards_limit,
          partial,
        });
        return formatResponse(results, format, 'searchResults');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
