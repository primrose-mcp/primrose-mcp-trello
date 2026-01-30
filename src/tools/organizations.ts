/**
 * Organization (Workspace) Tools
 *
 * MCP tools for Trello organization/workspace management.
 */

import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { TrelloClient } from '../client.js';
import { formatError, formatResponse } from '../utils/formatters.js';

/**
 * Register all organization-related tools
 */
export function registerOrganizationTools(server: McpServer, client: TrelloClient): void {
  // ===========================================================================
  // Get Organization
  // ===========================================================================
  server.tool(
    'trello_get_organization',
    `Get details of an organization (workspace).

Args:
  - orgId: The ID or name of the organization
  - format: Response format`,
    {
      orgId: z.string().describe('Organization ID or name'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orgId, format }) => {
      try {
        const org = await client.getOrganization(orgId);
        return formatResponse(org, format, 'organization');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Create Organization
  // ===========================================================================
  server.tool(
    'trello_create_organization',
    `Create a new organization (workspace).

Args:
  - displayName: Display name (required)
  - name: URL-friendly name
  - desc: Description
  - website: Website URL`,
    {
      displayName: z.string().describe('Display name'),
      name: z.string().optional().describe('URL-friendly name'),
      desc: z.string().optional().describe('Description'),
      website: z.string().optional().describe('Website URL'),
    },
    async (input) => {
      try {
        const org = await client.createOrganization(input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Organization created', organization: org }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Update Organization
  // ===========================================================================
  server.tool(
    'trello_update_organization',
    `Update an organization (workspace).

Args:
  - orgId: The ID or name of the organization
  - displayName: New display name
  - name: New URL-friendly name
  - desc: New description
  - website: New website URL`,
    {
      orgId: z.string().describe('Organization ID or name'),
      displayName: z.string().optional().describe('New display name'),
      name: z.string().optional().describe('New URL-friendly name'),
      desc: z.string().optional().describe('New description'),
      website: z.string().optional().describe('New website URL'),
    },
    async ({ orgId, ...input }) => {
      try {
        const org = await client.updateOrganization(orgId, input);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: 'Organization updated', organization: org }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Delete Organization
  // ===========================================================================
  server.tool(
    'trello_delete_organization',
    `Delete an organization (workspace).

WARNING: This action cannot be undone!

Args:
  - orgId: The ID or name of the organization to delete`,
    {
      orgId: z.string().describe('Organization ID or name'),
    },
    async ({ orgId }) => {
      try {
        await client.deleteOrganization(orgId);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ success: true, message: `Organization ${orgId} deleted` }, null, 2),
            },
          ],
        };
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Organization Members
  // ===========================================================================
  server.tool(
    'trello_get_organization_members',
    `Get all members of an organization.

Args:
  - orgId: The ID or name of the organization
  - format: Response format`,
    {
      orgId: z.string().describe('Organization ID or name'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orgId, format }) => {
      try {
        const members = await client.getOrganizationMembers(orgId);
        return formatResponse(members, format, 'members');
      } catch (error) {
        return formatError(error);
      }
    }
  );

  // ===========================================================================
  // Get Organization Boards
  // ===========================================================================
  server.tool(
    'trello_get_organization_boards',
    `Get all boards in an organization.

Args:
  - orgId: The ID or name of the organization
  - filter: Filter by board status ('all', 'open', 'closed')
  - format: Response format`,
    {
      orgId: z.string().describe('Organization ID or name'),
      filter: z.enum(['all', 'open', 'closed']).default('open').describe('Filter by status'),
      format: z.enum(['json', 'markdown']).default('json'),
    },
    async ({ orgId, filter, format }) => {
      try {
        const boards = await client.getOrganizationBoards(orgId, filter);
        return formatResponse(boards, format, 'boards');
      } catch (error) {
        return formatError(error);
      }
    }
  );
}
