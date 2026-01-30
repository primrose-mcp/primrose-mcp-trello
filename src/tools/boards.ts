/**
 * Board Tools
 *
 * MCP tools for Trello board management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all board-related tools
 */
export function registerBoardTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // List Boards
  // ===========================================================================
  server.tool(
    'trello_list_boards',
    `List all Trello boards for the authenticated user.

Returns boards with their names, IDs, and URLs.

Args:
  - filter: Filter by board status ('all', 'open', 'closed'). Default: 'open'
  - format: Response format ('json' or 'markdown')`,
    {
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by board status'),
      format: z.enum(['json', 'markdown']).default('json').describe('Response format'),
    },
    async ({ filter, format }) => {
      try {
        const boards = await client.listBoards(filter);
        return formatResponse(boards, format, 'boards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board
  // ===========================================================================
  server.tool(
    'trello_get_board',
    `Get details of a specific Trello board.

Args:
  - boardId: The ID of the board
  - format: Response format`,
    {
      boardId: z.string().describe('The ID of the board'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, format }) => {
      try {
        const board = await client.getBoard(boardId);
        return formatResponse(board, format, 'board');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Board
  // ===========================================================================
  server.tool(
    'trello_create_board',
    `Create a new Trello board.

Args:
  - name: Name of the board (required)
  - desc: Description of the board
  - idOrganization: ID of the organization/workspace
  - prefs_permissionLevel: Permission level ('private', 'org', 'public')
  - defaultLists: Whether to create default lists (To Do, Doing, Done)`,
    {
      name: z.string().describe('Name of the board'),
      desc: z.string().optional().describe('Description'),
      idOrganization: z.string().optional().describe('Organization/workspace ID'),
      prefs_permissionLevel: z.enum(['private', 'org', 'public']).optional().describe('Permission level'),
      defaultLists: z.boolean().default(true).describe('Create default lists'),
    },
    async (input) => {
      try {
        const board = await client.createBoard(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Board created', board }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Board
  // ===========================================================================
  server.tool(
    'trello_update_board',
    `Update a Trello board.

Args:
  - boardId: The ID of the board to update
  - name: New name
  - desc: New description
  - closed: Archive/unarchive the board
  - prefs_permissionLevel: New permission level`,
    {
      boardId: z.string().describe('Board ID to update'),
      name: z.string().optional().describe('New name'),
      desc: z.string().optional().describe('New description'),
      closed: z.boolean().optional().describe('Archive (true) or unarchive (false)'),
      prefs_permissionLevel: z.enum(['private', 'org', 'public']).optional().describe('Permission level'),
    },
    async ({ boardId, ...input }) => {
      try {
        const board = await client.updateBoard(boardId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Board updated', board }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Board
  // ===========================================================================
  server.tool(
    'trello_delete_board',
    `Delete a Trello board permanently.

WARNING: This action cannot be undone!

Args:
  - boardId: The ID of the board to delete`,
    {
      boardId: z.string().describe('Board ID to delete'),
    },
    async ({ boardId }) => {
      try {
        await client.deleteBoard(boardId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Board ${boardId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Lists
  // ===========================================================================
  server.tool(
    'trello_get_board_lists',
    `Get all lists on a board.

Args:
  - boardId: The ID of the board
  - filter: Filter by list status ('all', 'open', 'closed')
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, filter, format }) => {
      try {
        const lists = await client.getBoardLists(boardId, filter);
        return formatResponse(lists, format, 'lists');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Cards
  // ===========================================================================
  server.tool(
    'trello_get_board_cards',
    `Get all cards on a board.

Args:
  - boardId: The ID of the board
  - filter: Filter by card status ('all', 'open', 'closed')
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, filter, format }) => {
      try {
        const cards = await client.getBoardCards(boardId, filter);
        return formatResponse(cards, format, 'cards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Members
  // ===========================================================================
  server.tool(
    'trello_get_board_members',
    `Get all members of a board.

Args:
  - boardId: The ID of the board
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, format }) => {
      try {
        const members = await client.getBoardMembers(boardId);
        return formatResponse(members, format, 'members');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Labels
  // ===========================================================================
  server.tool(
    'trello_get_board_labels',
    `Get all labels defined on a board.

Args:
  - boardId: The ID of the board
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, format }) => {
      try {
        const labels = await client.getBoardLabels(boardId);
        return formatResponse(labels, format, 'labels');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Actions (Activity)
  // ===========================================================================
  server.tool(
    'trello_get_board_actions',
    `Get recent activity on a board.

Args:
  - boardId: The ID of the board
  - limit: Maximum number of actions to return (default: 50)
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      limit: z.number().int().min(1).max(1000).default(50).describe('Max actions to return'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, limit, format }) => {
      try {
        const actions = await client.getBoardActions(boardId, limit);
        return formatResponse(actions, format, 'actions');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Add Member to Board
  // ===========================================================================
  server.tool(
    'trello_add_board_member',
    `Add a member to a board.

Args:
  - boardId: The ID of the board
  - memberId: The ID of the member to add
  - type: Member type ('admin', 'normal', 'observer')`,
    {
      boardId: z.string().describe('Board ID'),
      memberId: z.string().describe('Member ID to add'),
      type: z.enum(['admin', 'normal', 'observer']).default('normal').describe('Member type'),
    },
    async ({ boardId, memberId, type }) => {
      try {
        const member = await client.addMemberToBoard(boardId, memberId, type);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Member added to board', member }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Remove Member from Board
  // ===========================================================================
  server.tool(
    'trello_remove_board_member',
    `Remove a member from a board.

Args:
  - boardId: The ID of the board
  - memberId: The ID of the member to remove`,
    {
      boardId: z.string().describe('Board ID'),
      memberId: z.string().describe('Member ID to remove'),
    },
    async ({ boardId, memberId }) => {
      try {
        await client.removeMemberFromBoard(boardId, memberId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Member removed from board' }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Board Custom Fields
  // ===========================================================================
  server.tool(
    'trello_get_board_custom_fields',
    `Get all custom fields defined on a board.

Args:
  - boardId: The ID of the board
  - format: Response format`,
    {
      boardId: z.string().describe('Board ID'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ boardId, format }) => {
      try {
        const customFields = await client.getBoardCustomFields(boardId);
        return formatResponse(customFields, format, 'customFields');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
