/**
 * Response Formatting Utilities
 *
 * Helpers for formatting tool responses in JSON or Markdown.
 */

import type {
  ResponseFormat,
  TrelloBoard,
  TrelloCard,
  TrelloChecklist,
  TrelloLabel,
  TrelloList,
  TrelloMember,
  TrelloOrganization,
} from '../types/entities.js';
import { ApiError, formatErrorForLogging } from './errors.js';

/**
 * MCP tool response type
 * Note: Index signature required for MCP SDK 1.25+ compatibility
 */
export interface ToolResponse {
  [key: string]: unknown;
  content: Array<{ type: 'text'; text: string }>;
  isError?: boolean;
}

/**
 * Format a successful response
 */
export function formatResponse(
  data: unknown,
  format: ResponseFormat,
  entityType: string
): ToolResponse {
  if (format === 'markdown') {
    return {
      content: [{ type: 'text', text: formatAsMarkdown(data, entityType) }],
    };
  }
  return {
    content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
  };
}

/**
 * Format an error response
 */
export function formatError(error: unknown): ToolResponse {
  const errorInfo = formatErrorForLogging(error);

  let message: string;
  if (error instanceof ApiError) {
    message = `Error: ${error.message}`;
    if (error.retryable) {
      message += ' (retryable)';
    }
  } else if (error instanceof Error) {
    message = `Error: ${error.message}`;
  } else {
    message = `Error: ${String(error)}`;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({ error: message, details: errorInfo }, null, 2),
      },
    ],
    isError: true,
  };
}

/**
 * Format data as Markdown
 */
function formatAsMarkdown(data: unknown, entityType: string): string {
  if (Array.isArray(data)) {
    return formatArrayAsMarkdown(data, entityType);
  }

  if (typeof data === 'object' && data !== null) {
    return formatObjectAsMarkdown(data as Record<string, unknown>, entityType);
  }

  return String(data);
}

/**
 * Format an array as Markdown
 */
function formatArrayAsMarkdown(data: unknown[], entityType: string): string {
  if (data.length === 0) {
    return `## ${capitalize(entityType)}\n\n_No items found._`;
  }

  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType)}`);
  lines.push(`**Count:** ${data.length}`);
  lines.push('');

  switch (entityType) {
    case 'boards':
      lines.push(formatBoardsTable(data as TrelloBoard[]));
      break;
    case 'lists':
      lines.push(formatListsTable(data as TrelloList[]));
      break;
    case 'cards':
      lines.push(formatCardsTable(data as TrelloCard[]));
      break;
    case 'labels':
      lines.push(formatLabelsTable(data as TrelloLabel[]));
      break;
    case 'members':
      lines.push(formatMembersTable(data as TrelloMember[]));
      break;
    case 'checklists':
      lines.push(formatChecklistsTable(data as TrelloChecklist[]));
      break;
    case 'organizations':
      lines.push(formatOrganizationsTable(data as TrelloOrganization[]));
      break;
    default:
      lines.push(formatGenericTable(data));
  }

  return lines.join('\n');
}

/**
 * Format boards as Markdown table
 */
function formatBoardsTable(boards: TrelloBoard[]): string {
  const lines: string[] = [];
  lines.push('| Name | ID | Status | URL |');
  lines.push('|---|---|---|---|');

  for (const board of boards) {
    const status = board.closed ? 'Closed' : 'Open';
    lines.push(`| ${board.name} | \`${board.id}\` | ${status} | ${board.shortUrl} |`);
  }

  return lines.join('\n');
}

/**
 * Format lists as Markdown table
 */
function formatListsTable(lists: TrelloList[]): string {
  const lines: string[] = [];
  lines.push('| Name | ID | Status | Position |');
  lines.push('|---|---|---|---|');

  for (const list of lists) {
    const status = list.closed ? 'Archived' : 'Active';
    lines.push(`| ${list.name} | \`${list.id}\` | ${status} | ${list.pos} |`);
  }

  return lines.join('\n');
}

/**
 * Format cards as Markdown table
 */
function formatCardsTable(cards: TrelloCard[]): string {
  const lines: string[] = [];
  lines.push('| Name | ID | Due | Status | URL |');
  lines.push('|---|---|---|---|---|');

  for (const card of cards) {
    const status = card.closed ? 'Archived' : 'Active';
    const due = card.due ? new Date(card.due).toLocaleDateString() : '-';
    const dueStatus = card.dueComplete ? ' (Done)' : '';
    lines.push(`| ${escapeMarkdown(card.name)} | \`${card.id}\` | ${due}${dueStatus} | ${status} | ${card.shortUrl} |`);
  }

  return lines.join('\n');
}

/**
 * Format labels as Markdown table
 */
function formatLabelsTable(labels: TrelloLabel[]): string {
  const lines: string[] = [];
  lines.push('| Name | ID | Color |');
  lines.push('|---|---|---|');

  for (const label of labels) {
    const name = label.name || '(no name)';
    const color = label.color || 'none';
    lines.push(`| ${escapeMarkdown(name)} | \`${label.id}\` | ${color} |`);
  }

  return lines.join('\n');
}

/**
 * Format members as Markdown table
 */
function formatMembersTable(members: TrelloMember[]): string {
  const lines: string[] = [];
  lines.push('| Name | Username | ID |');
  lines.push('|---|---|---|');

  for (const member of members) {
    lines.push(`| ${escapeMarkdown(member.fullName)} | @${member.username} | \`${member.id}\` |`);
  }

  return lines.join('\n');
}

/**
 * Format checklists as Markdown
 */
function formatChecklistsTable(checklists: TrelloChecklist[]): string {
  const lines: string[] = [];

  for (const checklist of checklists) {
    const completed = checklist.checkItems.filter(item => item.state === 'complete').length;
    const total = checklist.checkItems.length;
    lines.push(`### ${escapeMarkdown(checklist.name)} (${completed}/${total})`);
    lines.push(`**ID:** \`${checklist.id}\``);
    lines.push('');

    if (checklist.checkItems.length > 0) {
      for (const item of checklist.checkItems) {
        const checkbox = item.state === 'complete' ? '[x]' : '[ ]';
        lines.push(`- ${checkbox} ${escapeMarkdown(item.name)}`);
      }
    } else {
      lines.push('_No items_');
    }
    lines.push('');
  }

  return lines.join('\n');
}

/**
 * Format organizations as Markdown table
 */
function formatOrganizationsTable(orgs: TrelloOrganization[]): string {
  const lines: string[] = [];
  lines.push('| Name | ID | URL |');
  lines.push('|---|---|---|');

  for (const org of orgs) {
    lines.push(`| ${escapeMarkdown(org.displayName)} | \`${org.id}\` | ${org.url} |`);
  }

  return lines.join('\n');
}

/**
 * Format a generic array as Markdown table
 */
function formatGenericTable(items: unknown[]): string {
  if (items.length === 0) return '_No items_';

  const first = items[0] as Record<string, unknown>;
  const keys = Object.keys(first).slice(0, 5); // Limit columns

  const lines: string[] = [];
  lines.push(`| ${keys.join(' | ')} |`);
  lines.push(`|${keys.map(() => '---').join('|')}|`);

  for (const item of items) {
    const record = item as Record<string, unknown>;
    const values = keys.map((k) => {
      const val = record[k];
      if (val === null || val === undefined) return '-';
      if (typeof val === 'object') return '(object)';
      return String(val).slice(0, 50);
    });
    lines.push(`| ${values.join(' | ')} |`);
  }

  return lines.join('\n');
}

/**
 * Format a single object as Markdown
 */
function formatObjectAsMarkdown(data: Record<string, unknown>, entityType: string): string {
  const lines: string[] = [];
  lines.push(`## ${capitalize(entityType.replace(/s$/, ''))}`);
  lines.push('');

  for (const [key, value] of Object.entries(data)) {
    if (value === null || value === undefined) continue;

    if (typeof value === 'object') {
      lines.push(`**${formatKey(key)}:**`);
      lines.push('```json');
      lines.push(JSON.stringify(value, null, 2));
      lines.push('```');
    } else {
      lines.push(`**${formatKey(key)}:** ${value}`);
    }
  }

  return lines.join('\n');
}

/**
 * Capitalize first letter
 */
function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a key for display (camelCase to Title Case)
 */
function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (str) => str.toUpperCase())
    .trim();
}

/**
 * Escape markdown special characters
 */
function escapeMarkdown(text: string): string {
  return text.replace(/[|]/g, '\\|').replace(/\n/g, ' ');
}
