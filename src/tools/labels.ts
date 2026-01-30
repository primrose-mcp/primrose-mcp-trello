/**
 * Label Tools
 *
 * MCP tools for Trello label management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

const colorSchema = z.enum(['yellow', 'purple', 'blue', 'red', 'green', 'orange', 'black', 'sky', 'pink', 'lime']).nullable();

/**
 * Register all label-related tools
 */
export function registerLabelTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Label
  // ===========================================================================
  server.tool(
    'trello_get_label',
    `Get details of a specific label.

Args:
  - labelId: The ID of the label
  - format: Response format`,
    {
      labelId: z.string().describe('Label ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ labelId, format }) => {
      try {
        const label = await client.getLabel(labelId);
        return formatResponse(label, format, 'label');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Label
  // ===========================================================================
  server.tool(
    'trello_create_label',
    `Create a new label on a board.

Args:
  - idBoard: ID of the board (required)
  - name: Name of the label (required)
  - color: Color (yellow, purple, blue, red, green, orange, black, sky, pink, lime, or null)`,
    {
      idBoard: z.string().describe('Board ID'),
      name: z.string().describe('Label name'),
      color: colorSchema.describe('Label color'),
    },
    async (input) => {
      try {
        const label = await client.createLabel(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label created', label }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Label
  // ===========================================================================
  server.tool(
    'trello_update_label',
    `Update a label.

Args:
  - labelId: The ID of the label to update
  - name: New name
  - color: New color`,
    {
      labelId: z.string().describe('Label ID'),
      name: z.string().optional().describe('New name'),
      color: colorSchema.optional().describe('New color'),
    },
    async ({ labelId, ...input }) => {
      try {
        const label = await client.updateLabel(labelId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label updated', label }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Label
  // ===========================================================================
  server.tool(
    'trello_delete_label',
    `Delete a label from a board.

Args:
  - labelId: The ID of the label to delete`,
    {
      labelId: z.string().describe('Label ID'),
    },
    async ({ labelId }) => {
      try {
        await client.deleteLabel(labelId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
