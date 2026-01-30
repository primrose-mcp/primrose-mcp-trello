# Trello MCP Server

[![Primrose MCP](https://img.shields.io/badge/Primrose-MCP-blue)](https://primrose.dev/mcp/trello)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange)](https://workers.cloudflare.com/)

A Model Context Protocol (MCP) server for Trello, enabling project management, board operations, and task tracking.

## Features

- **Boards** - Board management and configuration
- **Lists** - List organization within boards
- **Cards** - Card creation and management
- **Checklists** - Checklist and checklist item management
- **Labels** - Label creation and assignment
- **Members** - Member management and permissions
- **Organizations** - Workspace administration
- **Search** - Global search across Trello
- **Webhooks** - Event webhook configuration
- **Custom Fields** - Custom field management

## Quick Start

### Recommended: Primrose SDK

The easiest way to use this MCP server is with the Primrose SDK:

```bash
npm install primrose-mcp
```

```typescript
import { PrimroseMCP } from 'primrose-mcp';

const client = new PrimroseMCP({
  server: 'trello',
  credentials: {
    apiKey: 'your-trello-api-key',
    token: 'your-trello-token'
  }
});
```

### Manual Installation

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Deploy to Cloudflare Workers:
   ```bash
   npm run deploy
   ```

## Configuration

### Required Headers

| Header | Description |
|--------|-------------|
| `X-Trello-API-Key` | Trello API key |
| `X-Trello-Token` | Trello API token |

Get your API key and token from: https://trello.com/power-ups/admin

## Available Tools

### Boards
- `trello_list_boards` - List all boards
- `trello_get_board` - Get board details
- `trello_create_board` - Create a new board
- `trello_update_board` - Update board settings
- `trello_delete_board` - Delete a board
- `trello_get_board_members` - Get board members
- `trello_add_board_member` - Add member to board

### Lists
- `trello_list_lists` - List all lists on a board
- `trello_get_list` - Get list details
- `trello_create_list` - Create a new list
- `trello_update_list` - Update list
- `trello_archive_list` - Archive a list
- `trello_move_list` - Move list to another board

### Cards
- `trello_list_cards` - List cards in a list
- `trello_get_card` - Get card details
- `trello_create_card` - Create a new card
- `trello_update_card` - Update card
- `trello_delete_card` - Delete a card
- `trello_move_card` - Move card to another list
- `trello_add_card_comment` - Add comment to card
- `trello_add_card_attachment` - Add attachment to card

### Checklists
- `trello_list_checklists` - List checklists on a card
- `trello_get_checklist` - Get checklist details
- `trello_create_checklist` - Create a checklist
- `trello_delete_checklist` - Delete a checklist
- `trello_add_checklist_item` - Add item to checklist
- `trello_update_checklist_item` - Update checklist item
- `trello_delete_checklist_item` - Delete checklist item

### Labels
- `trello_list_labels` - List labels on a board
- `trello_get_label` - Get label details
- `trello_create_label` - Create a label
- `trello_update_label` - Update label
- `trello_delete_label` - Delete a label
- `trello_add_label_to_card` - Add label to card
- `trello_remove_label_from_card` - Remove label from card

### Members
- `trello_get_member` - Get member details
- `trello_get_member_boards` - Get member's boards
- `trello_get_member_organizations` - Get member's organizations

### Organizations
- `trello_list_organizations` - List organizations
- `trello_get_organization` - Get organization details
- `trello_create_organization` - Create organization
- `trello_update_organization` - Update organization
- `trello_get_organization_members` - Get org members
- `trello_get_organization_boards` - Get org boards

### Search
- `trello_search` - Search cards, boards, members, organizations
- `trello_search_members` - Search for members

### Webhooks
- `trello_list_webhooks` - List webhooks
- `trello_create_webhook` - Create a webhook
- `trello_update_webhook` - Update webhook
- `trello_delete_webhook` - Delete webhook

### Custom Fields
- `trello_list_custom_fields` - List custom fields on a board
- `trello_get_custom_field` - Get custom field details
- `trello_create_custom_field` - Create custom field
- `trello_update_card_custom_field` - Update card's custom field value

## Development

```bash
# Install dependencies
npm install

# Run locally
npm run dev

# Type checking
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Related Resources

- [Primrose SDK Documentation](https://primrose.dev/docs)
- [Trello API Documentation](https://developer.atlassian.com/cloud/trello/rest/)
- [Trello Developer Portal](https://developer.atlassian.com/cloud/trello/)
- [Model Context Protocol](https://modelcontextprotocol.io/)
