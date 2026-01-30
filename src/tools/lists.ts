/**
 * List Tools
 *
 * MCP tools for Trello list management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all list-related tools
 */
export function registerListTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get List
  // ===========================================================================
  server.tool(
    'trello_get_list',
    `Get details of a specific list.

Args:
  - listId: The ID of the list
  - format: Response format`,
    {
      listId: z.string().describe('List ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ listId, format }) => {
      try {
        const list = await client.getList(listId);
        return formatResponse(list, format, 'list');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create List
  // ===========================================================================
  server.tool(
    'trello_create_list',
    `Create a new list on a board.

Args:
  - name: Name of the list (required)
  - idBoard: ID of the board (required)
  - pos: Position ('top', 'bottom', or a number)`,
    {
      name: z.string().describe('Name of the list'),
      idBoard: z.string().describe('Board ID'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('Position'),
    },
    async (input) => {
      try {
        const list = await client.createList(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List created', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update List
  // ===========================================================================
  server.tool(
    'trello_update_list',
    `Update a list.

Args:
  - listId: The ID of the list to update
  - name: New name
  - closed: Archive (true) or unarchive (false)
  - pos: New position`,
    {
      listId: z.string().describe('List ID to update'),
      name: z.string().optional().describe('New name'),
      closed: z.boolean().optional().describe('Archive/unarchive'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('New position'),
    },
    async ({ listId, ...input }) => {
      try {
        const list = await client.updateList(listId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List updated', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Archive List
  // ===========================================================================
  server.tool(
    'trello_archive_list',
    `Archive a list.

Args:
  - listId: The ID of the list to archive`,
    {
      listId: z.string().describe('List ID to archive'),
    },
    async ({ listId }) => {
      try {
        const list = await client.archiveList(listId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List archived', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Unarchive List
  // ===========================================================================
  server.tool(
    'trello_unarchive_list',
    `Unarchive a list.

Args:
  - listId: The ID of the list to unarchive`,
    {
      listId: z.string().describe('List ID to unarchive'),
    },
    async ({ listId }) => {
      try {
        const list = await client.unarchiveList(listId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'List unarchived', list }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get List Cards
  // ===========================================================================
  server.tool(
    'trello_get_list_cards',
    `Get all cards in a list.

Args:
  - listId: The ID of the list
  - filter: Filter by card status ('all', 'open', 'closed')
  - format: Response format`,
    {
      listId: z.string().describe('List ID'),
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ listId, filter, format }) => {
      try {
        const cards = await client.getListCards(listId, filter);
        return formatResponse(cards, format, 'cards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Archive All Cards in List
  // ===========================================================================
  server.tool(
    'trello_archive_all_cards_in_list',
    `Archive all cards in a list.

Args:
  - listId: The ID of the list`,
    {
      listId: z.string().describe('List ID'),
    },
    async ({ listId }) => {
      try {
        await client.archiveAllCardsInList(listId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'All cards in list archived' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Move All Cards in List
  // ===========================================================================
  server.tool(
    'trello_move_all_cards_in_list',
    `Move all cards from one list to another.

Args:
  - listId: The ID of the source list
  - idBoard: The ID of the destination board
  - idList: The ID of the destination list`,
    {
      listId: z.string().describe('Source list ID'),
      idBoard: z.string().describe('Destination board ID'),
      idList: z.string().describe('Destination list ID'),
    },
    async ({ listId, idBoard, idList }) => {
      try {
        await client.moveAllCardsInList(listId, idBoard, idList);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'All cards moved' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
