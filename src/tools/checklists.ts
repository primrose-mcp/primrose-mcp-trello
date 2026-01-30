/**
 * Checklist Tools
 *
 * MCP tools for Trello checklist management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all checklist-related tools
 */
export function registerChecklistTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Checklist
  // ===========================================================================
  server.tool(
    'trello_get_checklist',
    `Get details of a checklist including all check items.

Args:
  - checklistId: The ID of the checklist
  - format: Response format`,
    {
      checklistId: z.string().describe('Checklist ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ checklistId, format }) => {
      try {
        const checklist = await client.getChecklist(checklistId);
        return formatResponse(checklist, format, 'checklist');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Checklist
  // ===========================================================================
  server.tool(
    'trello_create_checklist',
    `Create a new checklist on a card.

Args:
  - idCard: ID of the card (required)
  - name: Name of the checklist
  - pos: Position ('top', 'bottom', or number)`,
    {
      idCard: z.string().describe('Card ID'),
      name: z.string().optional().describe('Checklist name'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('Position'),
    },
    async (input) => {
      try {
        const checklist = await client.createChecklist(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Checklist created', checklist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Checklist
  // ===========================================================================
  server.tool(
    'trello_update_checklist',
    `Update a checklist name.

Args:
  - checklistId: The ID of the checklist
  - name: New name for the checklist`,
    {
      checklistId: z.string().describe('Checklist ID'),
      name: z.string().describe('New name'),
    },
    async ({ checklistId, name }) => {
      try {
        const checklist = await client.updateChecklist(checklistId, name);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Checklist updated', checklist }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Checklist
  // ===========================================================================
  server.tool(
    'trello_delete_checklist',
    `Delete a checklist from a card.

Args:
  - checklistId: The ID of the checklist to delete`,
    {
      checklistId: z.string().describe('Checklist ID'),
    },
    async ({ checklistId }) => {
      try {
        await client.deleteChecklist(checklistId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Checklist deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Card Checklists
  // ===========================================================================
  server.tool(
    'trello_get_card_checklists',
    `Get all checklists on a card.

Args:
  - cardId: The ID of the card
  - format: Response format`,
    {
      cardId: z.string().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cardId, format }) => {
      try {
        const checklists = await client.getCardChecklists(cardId);
        return formatResponse(checklists, format, 'checklists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Check Item
  // ===========================================================================
  server.tool(
    'trello_create_check_item',
    `Create a new check item (task) in a checklist.

Args:
  - checklistId: ID of the checklist
  - name: Name of the check item (required)
  - checked: Whether it starts checked
  - pos: Position ('top', 'bottom', or number)`,
    {
      checklistId: z.string().describe('Checklist ID'),
      name: z.string().describe('Check item name'),
      checked: z.boolean().optional().describe('Start checked'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('Position'),
    },
    async ({ checklistId, ...input }) => {
      try {
        const checkItem = await client.createCheckItem(checklistId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Check item created', checkItem }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Check Item
  // ===========================================================================
  server.tool(
    'trello_update_check_item',
    `Update a check item (mark complete/incomplete, rename, etc).

Args:
  - cardId: ID of the card containing the checklist
  - checkItemId: ID of the check item
  - name: New name
  - state: New state ('complete' or 'incomplete')
  - pos: New position`,
    {
      cardId: z.string().describe('Card ID'),
      checkItemId: z.string().describe('Check item ID'),
      name: z.string().optional().describe('New name'),
      state: z.enum(['complete', 'incomplete']).optional().describe('Complete/incomplete'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('New position'),
    },
    async ({ cardId, checkItemId, ...input }) => {
      try {
        const checkItem = await client.updateCheckItem(cardId, checkItemId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Check item updated', checkItem }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Check Item
  // ===========================================================================
  server.tool(
    'trello_delete_check_item',
    `Delete a check item from a checklist.

Args:
  - checklistId: ID of the checklist
  - checkItemId: ID of the check item to delete`,
    {
      checklistId: z.string().describe('Checklist ID'),
      checkItemId: z.string().describe('Check item ID'),
    },
    async ({ checklistId, checkItemId }) => {
      try {
        await client.deleteCheckItem(checklistId, checkItemId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Check item deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
