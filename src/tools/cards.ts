/**
 * Card Tools
 *
 * MCP tools for Trello card management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all card-related tools
 */
export function registerCardTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Card
  // ===========================================================================
  server.tool(
    'trello_get_card',
    `Get details of a specific card including checklists and attachments.

Args:
  - cardId: The ID of the card
  - format: Response format`,
    {
      cardId: z.string().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cardId, format }) => {
      try {
        const card = await client.getCard(cardId);
        return formatResponse(card, format, 'card');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Card
  // ===========================================================================
  server.tool(
    'trello_create_card',
    `Create a new card in a list.

Args:
  - idList: ID of the list (required)
  - name: Name of the card (required)
  - desc: Description
  - pos: Position ('top', 'bottom', or number)
  - due: Due date (ISO 8601 format)
  - start: Start date (ISO 8601 format)
  - idMembers: Array of member IDs to assign
  - idLabels: Array of label IDs to add`,
    {
      idList: z.string().describe('List ID'),
      name: z.string().describe('Card name'),
      desc: z.string().optional().describe('Description'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('Position'),
      due: z.string().optional().describe('Due date (ISO 8601)'),
      start: z.string().optional().describe('Start date (ISO 8601)'),
      idMembers: z.array(z.string()).optional().describe('Member IDs to assign'),
      idLabels: z.array(z.string()).optional().describe('Label IDs to add'),
    },
    async (input) => {
      try {
        const card = await client.createCard(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Card created', card }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Card
  // ===========================================================================
  server.tool(
    'trello_update_card',
    `Update a card.

Args:
  - cardId: The ID of the card to update
  - name: New name
  - desc: New description
  - closed: Archive (true) or unarchive (false)
  - idList: Move to a different list
  - pos: New position
  - due: New due date (ISO 8601 format, or null to remove)
  - dueComplete: Mark due date as complete`,
    {
      cardId: z.string().describe('Card ID to update'),
      name: z.string().optional().describe('New name'),
      desc: z.string().optional().describe('New description'),
      closed: z.boolean().optional().describe('Archive/unarchive'),
      idList: z.string().optional().describe('Move to list ID'),
      pos: z.union([z.enum(['top', 'bottom']), z.number()]).optional().describe('New position'),
      due: z.string().nullable().optional().describe('Due date or null'),
      dueComplete: z.boolean().optional().describe('Mark due complete'),
    },
    async ({ cardId, ...input }) => {
      try {
        const card = await client.updateCard(cardId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Card updated', card }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Card
  // ===========================================================================
  server.tool(
    'trello_delete_card',
    `Delete a card permanently.

WARNING: This action cannot be undone!

Args:
  - cardId: The ID of the card to delete`,
    {
      cardId: z.string().describe('Card ID to delete'),
    },
    async ({ cardId }) => {
      try {
        await client.deleteCard(cardId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Card ${cardId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Archive Card
  // ===========================================================================
  server.tool(
    'trello_archive_card',
    `Archive a card.

Args:
  - cardId: The ID of the card to archive`,
    {
      cardId: z.string().describe('Card ID to archive'),
    },
    async ({ cardId }) => {
      try {
        const card = await client.archiveCard(cardId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Card archived', card }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Unarchive Card
  // ===========================================================================
  server.tool(
    'trello_unarchive_card',
    `Unarchive a card.

Args:
  - cardId: The ID of the card to unarchive`,
    {
      cardId: z.string().describe('Card ID to unarchive'),
    },
    async ({ cardId }) => {
      try {
        const card = await client.unarchiveCard(cardId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Card unarchived', card }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Move Card
  // ===========================================================================
  server.tool(
    'trello_move_card',
    `Move a card to a different list.

Args:
  - cardId: The ID of the card to move
  - idList: The ID of the destination list
  - idBoard: The ID of the destination board (optional, for cross-board moves)`,
    {
      cardId: z.string().describe('Card ID to move'),
      idList: z.string().describe('Destination list ID'),
      idBoard: z.string().optional().describe('Destination board ID (for cross-board)'),
    },
    async ({ cardId, idList, idBoard }) => {
      try {
        const card = await client.moveCard(cardId, idList, idBoard);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Card moved', card }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Comment to Card
  // ===========================================================================
  server.tool(
    'trello_add_comment',
    `Add a comment to a card.

Args:
  - cardId: The ID of the card
  - text: Comment text`,
    {
      cardId: z.string().describe('Card ID'),
      text: z.string().describe('Comment text'),
    },
    async ({ cardId, text }) => {
      try {
        const comment = await client.addCommentToCard(cardId, text);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Comment added', comment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Card Comments
  // ===========================================================================
  server.tool(
    'trello_get_card_comments',
    `Get all comments on a card.

Args:
  - cardId: The ID of the card
  - format: Response format`,
    {
      cardId: z.string().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cardId, format }) => {
      try {
        const comments = await client.getCardComments(cardId);
        return formatResponse(comments, format, 'comments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Label to Card
  // ===========================================================================
  server.tool(
    'trello_add_label_to_card',
    `Add a label to a card.

Args:
  - cardId: The ID of the card
  - labelId: The ID of the label to add`,
    {
      cardId: z.string().describe('Card ID'),
      labelId: z.string().describe('Label ID to add'),
    },
    async ({ cardId, labelId }) => {
      try {
        await client.addLabelToCard(cardId, labelId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label added to card' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Label from Card
  // ===========================================================================
  server.tool(
    'trello_remove_label_from_card',
    `Remove a label from a card.

Args:
  - cardId: The ID of the card
  - labelId: The ID of the label to remove`,
    {
      cardId: z.string().describe('Card ID'),
      labelId: z.string().describe('Label ID to remove'),
    },
    async ({ cardId, labelId }) => {
      try {
        await client.removeLabelFromCard(cardId, labelId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Label removed from card' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Member to Card
  // ===========================================================================
  server.tool(
    'trello_add_member_to_card',
    `Add a member to a card.

Args:
  - cardId: The ID of the card
  - memberId: The ID of the member to add`,
    {
      cardId: z.string().describe('Card ID'),
      memberId: z.string().describe('Member ID to add'),
    },
    async ({ cardId, memberId }) => {
      try {
        await client.addMemberToCard(cardId, memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Member added to card' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Member from Card
  // ===========================================================================
  server.tool(
    'trello_remove_member_from_card',
    `Remove a member from a card.

Args:
  - cardId: The ID of the card
  - memberId: The ID of the member to remove`,
    {
      cardId: z.string().describe('Card ID'),
      memberId: z.string().describe('Member ID to remove'),
    },
    async ({ cardId, memberId }) => {
      try {
        await client.removeMemberFromCard(cardId, memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Member removed from card' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Card Attachments
  // ===========================================================================
  server.tool(
    'trello_get_card_attachments',
    `Get all attachments on a card.

Args:
  - cardId: The ID of the card
  - format: Response format`,
    {
      cardId: z.string().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cardId, format }) => {
      try {
        const attachments = await client.getCardAttachments(cardId);
        return formatResponse(attachments, format, 'attachments');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Attachment to Card
  // ===========================================================================
  server.tool(
    'trello_add_attachment',
    `Add an attachment to a card via URL.

Args:
  - cardId: The ID of the card
  - url: URL of the attachment
  - name: Name for the attachment (optional)
  - setCover: Set as card cover (optional)`,
    {
      cardId: z.string().describe('Card ID'),
      url: z.string().url().describe('Attachment URL'),
      name: z.string().optional().describe('Attachment name'),
      setCover: z.boolean().optional().describe('Set as cover'),
    },
    async ({ cardId, url, name, setCover }) => {
      try {
        const attachment = await client.addAttachmentToCard(cardId, { url, name, setCover });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Attachment added', attachment }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Attachment
  // ===========================================================================
  server.tool(
    'trello_delete_attachment',
    `Delete an attachment from a card.

Args:
  - cardId: The ID of the card
  - attachmentId: The ID of the attachment to delete`,
    {
      cardId: z.string().describe('Card ID'),
      attachmentId: z.string().describe('Attachment ID to delete'),
    },
    async ({ cardId, attachmentId }) => {
      try {
        await client.deleteAttachment(cardId, attachmentId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Attachment deleted' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Card Custom Field Items
  // ===========================================================================
  server.tool(
    'trello_get_card_custom_fields',
    `Get custom field values for a card.

Args:
  - cardId: The ID of the card
  - format: Response format`,
    {
      cardId: z.string().describe('Card ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ cardId, format }) => {
      try {
        const items = await client.getCardCustomFieldItems(cardId);
        return formatResponse(items, format, 'customFieldItems');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Set Card Custom Field Value
  // ===========================================================================
  server.tool(
    'trello_set_card_custom_field',
    `Set a custom field value on a card.

Args:
  - cardId: The ID of the card
  - customFieldId: The ID of the custom field
  - value: The value object (e.g., {"text": "value"} for text, {"number": "123"} for number)`,
    {
      cardId: z.string().describe('Card ID'),
      customFieldId: z.string().describe('Custom field ID'),
      value: z.record(z.string(), z.unknown()).describe('Value object'),
    },
    async ({ cardId, customFieldId, value }) => {
      try {
        await client.setCardCustomFieldValue(cardId, customFieldId, value);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Custom field value set' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
