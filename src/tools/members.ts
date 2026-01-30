/**
 * Member Tools
 *
 * MCP tools for Trello member management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all member-related tools
 */
export function registerMemberTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Current User (Me)
  // ===========================================================================
  server.tool(
    'trello_get_me',
    `Get the authenticated user's information.

Args:
  - format: Response format`,
    {
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ format }) => {
      try {
        const member = await client.getMe();
        return formatResponse(member, format, 'member');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Member
  // ===========================================================================
  server.tool(
    'trello_get_member',
    `Get information about a specific member.

Args:
  - idOrUsername: The ID or username of the member
  - format: Response format`,
    {
      idOrUsername: z.string().describe('Member ID or username'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ idOrUsername, format }) => {
      try {
        const member = await client.getMember(idOrUsername);
        return formatResponse(member, format, 'member');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Member Boards
  // ===========================================================================
  server.tool(
    'trello_get_member_boards',
    `Get all boards for a member.

Args:
  - idOrUsername: The ID or username of the member (use 'me' for current user)
  - filter: Filter by board status ('all', 'open', 'closed')
  - format: Response format`,
    {
      idOrUsername: z.string().default('me').describe('Member ID or username'),
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ idOrUsername, filter, format }) => {
      try {
        const boards = await client.getMemberBoards(idOrUsername, filter);
        return formatResponse(boards, format, 'boards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Member Cards
  // ===========================================================================
  server.tool(
    'trello_get_member_cards',
    `Get all cards assigned to a member.

Args:
  - idOrUsername: The ID or username of the member (use 'me' for current user)
  - format: Response format`,
    {
      idOrUsername: z.string().default('me').describe('Member ID or username'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ idOrUsername, format }) => {
      try {
        const cards = await client.getMemberCards(idOrUsername);
        return formatResponse(cards, format, 'cards');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Member Organizations
  // ===========================================================================
  server.tool(
    'trello_get_member_organizations',
    `Get all organizations/workspaces for a member.

Args:
  - idOrUsername: The ID or username of the member (use 'me' for current user)
  - format: Response format`,
    {
      idOrUsername: z.string().default('me').describe('Member ID or username'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ idOrUsername, format }) => {
      try {
        const orgs = await client.getMemberOrganizations(idOrUsername);
        return formatResponse(orgs, format, 'organizations');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Search Members
  // ===========================================================================
  server.tool(
    'trello_search_members',
    `Search for members by name or username.

Args:
  - query: Search query
  - limit: Maximum results (default: 8)
  - format: Response format`,
    {
      query: z.string().describe('Search query'),
      limit: z.number().int().min(1).max(20).default(8).describe('Max results'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ query, limit, format }) => {
      try {
        const members = await client.searchMembers(query, limit);
        return formatResponse(members, format, 'members');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
