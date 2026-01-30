/**
 * Custom Field Tools
 *
 * MCP tools for Trello custom field management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all custom field-related tools
 */
export function registerCustomFieldTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Custom Field
  // ===========================================================================
  server.tool(
    'trello_get_custom_field',
    `Get details of a specific custom field definition.

Args:
  - customFieldId: The ID of the custom field
  - format: Response format`,
    {
      customFieldId: z.string().describe('Custom field ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customFieldId, format }) => {
      try {
        const field = await client.getCustomField(customFieldId);
        return formatResponse(field, format, 'customField');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Custom Field
  // ===========================================================================
  server.tool(
    'trello_create_custom_field',
    `Create a new custom field on a board.

Args:
  - idModel: ID of the board (required)
  - name: Name of the custom field (required)
  - type: Field type (checkbox, date, list, number, text) (required)
  - pos: Position ('top', 'bottom', or number)
  - display_cardFront: Show on card front`,
    {
      idModel: z.string().describe('Board ID'),
      name: z.string().describe('Field name'),
      type: z.enum(['checkbox', 'date', 'list', 'number', 'text']).describe('Field type'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('Position'),
      display_cardFront: z.boolean().optional().describe('Show on card front'),
    },
    async ({ idModel, name, type, pos, display_cardFront }) => {
      try {
        const field = await client.createCustomField({
          idModel,
          modelType: 'board',
          name,
          type,
          pos,
          display_cardFront,
        });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field created', customField: field }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Custom Field
  // ===========================================================================
  server.tool(
    'trello_update_custom_field',
    `Update a custom field definition.

Args:
  - customFieldId: The ID of the custom field to update
  - name: New name
  - pos: New position
  - display_cardFront: Show/hide on card front`,
    {
      customFieldId: z.string().describe('Custom field ID'),
      name: z.string().optional().describe('New name'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('New position'),
      display_cardFront: z.boolean().optional().describe('Show on card front'),
    },
    async ({ customFieldId, ...input }) => {
      try {
        const field = await client.updateCustomField(customFieldId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field updated', customField: field }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Custom Field
  // ===========================================================================
  server.tool(
    'trello_delete_custom_field',
    `Delete a custom field from a board.

WARNING: This will remove the field and all its values from all cards!

Args:
  - customFieldId: The ID of the custom field to delete`,
    {
      customFieldId: z.string().describe('Custom field ID'),
    },
    async ({ customFieldId }) => {
      try {
        await client.deleteCustomField(customFieldId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Custom Field Options (for dropdown/list type)
  // ===========================================================================
  server.tool(
    'trello_get_custom_field_options',
    `Get all options for a dropdown/list type custom field.

Args:
  - customFieldId: The ID of the custom field
  - format: Response format`,
    {
      customFieldId: z.string().describe('Custom field ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ customFieldId, format }) => {
      try {
        const options = await client.getCustomFieldOptions(customFieldId);
        return formatResponse(options, format, 'customFieldOptions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Custom Field Option
  // ===========================================================================
  server.tool(
    'trello_add_custom_field_option',
    `Add an option to a dropdown/list type custom field.

Args:
  - customFieldId: The ID of the custom field
  - value: The option text (required)
  - color: Option color (yellow, purple, blue, red, green, orange, black, sky, pink, lime)`,
    {
      customFieldId: z.string().describe('Custom field ID'),
      value: z.string().describe('Option text'),
      color: z.enum(['yellow', 'purple', 'blue', 'red', 'green', 'orange', 'black', 'sky', 'pink', 'lime']).optional().describe('Option color'),
    },
    async ({ customFieldId, value, color }) => {
      try {
        const option = await client.addCustomFieldOption(customFieldId, value, color);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Option added', option }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Custom Field Option
  // ===========================================================================
  server.tool(
    'trello_delete_custom_field_option',
    `Delete an option from a dropdown/list type custom field.

Args:
  - customFieldId: The ID of the custom field
  - optionId: The ID of the option to delete`,
    {
      customFieldId: z.string().describe('Custom field ID'),
      optionId: z.string().describe('Option ID'),
    },
    async ({ customFieldId, optionId }) => {
      try {
        await client.deleteCustomFieldOption(customFieldId, optionId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Option deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
