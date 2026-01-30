/**
 * Trello API Client
 *
 * This file handles all HTTP communication with the Trello REST API.
 * Reference: https://developer.atlassian.com/cloud/trello/rest/
 *
 * MULTI-TENANT: This client receives credentials per-request via TenantCredentials,
 * allowing a single server to serve multiple tenants with different API keys.
 */

import type {
  TrelloAction,
  TrelloAttachment,
  TrelloAttachmentCreateInput,
  TrelloBoard,
  TrelloBoardCreateInput,
  TrelloBoardUpdateInput,
  TrelloCard,
  TrelloCardCreateInput,
  TrelloCardUpdateInput,
  TrelloCheckItem,
  TrelloCheckItemCreateInput,
  TrelloCheckItemUpdateInput,
  TrelloChecklist,
  TrelloChecklistCreateInput,
  TrelloComment,
  TrelloCustomField,
  TrelloCustomFieldCreateInput,
  TrelloCustomFieldItem,
  TrelloCustomFieldOption,
  TrelloCustomFieldUpdateInput,
  TrelloLabel,
  TrelloLabelCreateInput,
  TrelloLabelUpdateInput,
  TrelloList,
  TrelloListCreateInput,
  TrelloListUpdateInput,
  TrelloMember,
  TrelloOrganization,
  TrelloOrganizationCreateInput,
  TrelloOrganizationUpdateInput,
  TrelloSearchResult,
  TrelloWebhook,
  TrelloWebhookCreateInput,
  TrelloWebhookUpdateInput,
} from './types/entities.js';
import type { TenantCredentials } from './types/env.js';
import { AuthenticationError, ApiError, RateLimitError } from './utils/errors.js';

// =============================================================================
// Configuration
// =============================================================================

const API_BASE_URL = 'https://api.trello.com/1';

// =============================================================================
// Trello Client Interface
// =============================================================================

export interface TrelloClient {
  // Connection
  testConnection(): Promise<{ connected: boolean; message: string }>;

  // Members
  getMe(): Promise<TrelloMember>;
  getMember(idOrUsername: string): Promise<TrelloMember>;
  getMemberBoards(idOrUsername: string, filter?: 'all' | 'open' | 'closed'): Promise<TrelloBoard[]>;
  getMemberCards(idOrUsername: string): Promise<TrelloCard[]>;
  getMemberOrganizations(idOrUsername: string): Promise<TrelloOrganization[]>;

  // Boards
  listBoards(filter?: 'all' | 'open' | 'closed'): Promise<TrelloBoard[]>;
  getBoard(boardId: string): Promise<TrelloBoard>;
  createBoard(input: TrelloBoardCreateInput): Promise<TrelloBoard>;
  updateBoard(boardId: string, input: TrelloBoardUpdateInput): Promise<TrelloBoard>;
  deleteBoard(boardId: string): Promise<void>;
  getBoardMembers(boardId: string): Promise<TrelloMember[]>;
  getBoardLists(boardId: string, filter?: 'all' | 'open' | 'closed'): Promise<TrelloList[]>;
  getBoardCards(boardId: string, filter?: 'all' | 'open' | 'closed'): Promise<TrelloCard[]>;
  getBoardLabels(boardId: string): Promise<TrelloLabel[]>;
  getBoardActions(boardId: string, limit?: number): Promise<TrelloAction[]>;
  getBoardChecklists(boardId: string): Promise<TrelloChecklist[]>;
  getBoardCustomFields(boardId: string): Promise<TrelloCustomField[]>;
  addMemberToBoard(boardId: string, memberId: string, type?: 'admin' | 'normal' | 'observer'): Promise<TrelloMember>;
  removeMemberFromBoard(boardId: string, memberId: string): Promise<void>;

  // Lists
  getList(listId: string): Promise<TrelloList>;
  createList(input: TrelloListCreateInput): Promise<TrelloList>;
  updateList(listId: string, input: TrelloListUpdateInput): Promise<TrelloList>;
  archiveList(listId: string): Promise<TrelloList>;
  unarchiveList(listId: string): Promise<TrelloList>;
  getListCards(listId: string, filter?: 'all' | 'open' | 'closed'): Promise<TrelloCard[]>;
  archiveAllCardsInList(listId: string): Promise<void>;
  moveAllCardsInList(listId: string, idBoard: string, idList: string): Promise<void>;

  // Cards
  getCard(cardId: string): Promise<TrelloCard>;
  createCard(input: TrelloCardCreateInput): Promise<TrelloCard>;
  updateCard(cardId: string, input: TrelloCardUpdateInput): Promise<TrelloCard>;
  deleteCard(cardId: string): Promise<void>;
  archiveCard(cardId: string): Promise<TrelloCard>;
  unarchiveCard(cardId: string): Promise<TrelloCard>;
  moveCard(cardId: string, idList: string, idBoard?: string): Promise<TrelloCard>;
  getCardActions(cardId: string, limit?: number): Promise<TrelloAction[]>;
  getCardAttachments(cardId: string): Promise<TrelloAttachment[]>;
  addAttachmentToCard(cardId: string, input: TrelloAttachmentCreateInput): Promise<TrelloAttachment>;
  deleteAttachment(cardId: string, attachmentId: string): Promise<void>;
  getCardChecklists(cardId: string): Promise<TrelloChecklist[]>;
  addCommentToCard(cardId: string, text: string): Promise<TrelloComment>;
  getCardComments(cardId: string): Promise<TrelloAction[]>;
  updateComment(cardId: string, actionId: string, text: string): Promise<TrelloAction>;
  deleteComment(cardId: string, actionId: string): Promise<void>;
  addLabelToCard(cardId: string, labelId: string): Promise<void>;
  removeLabelFromCard(cardId: string, labelId: string): Promise<void>;
  addMemberToCard(cardId: string, memberId: string): Promise<void>;
  removeMemberFromCard(cardId: string, memberId: string): Promise<void>;
  getCardCustomFieldItems(cardId: string): Promise<TrelloCustomFieldItem[]>;
  setCardCustomFieldValue(cardId: string, customFieldId: string, value: Record<string, unknown>): Promise<void>;

  // Labels
  getLabel(labelId: string): Promise<TrelloLabel>;
  createLabel(input: TrelloLabelCreateInput): Promise<TrelloLabel>;
  updateLabel(labelId: string, input: TrelloLabelUpdateInput): Promise<TrelloLabel>;
  deleteLabel(labelId: string): Promise<void>;

  // Checklists
  getChecklist(checklistId: string): Promise<TrelloChecklist>;
  createChecklist(input: TrelloChecklistCreateInput): Promise<TrelloChecklist>;
  updateChecklist(checklistId: string, name: string): Promise<TrelloChecklist>;
  deleteChecklist(checklistId: string): Promise<void>;
  getCheckItems(checklistId: string): Promise<TrelloCheckItem[]>;
  createCheckItem(checklistId: string, input: TrelloCheckItemCreateInput): Promise<TrelloCheckItem>;
  updateCheckItem(cardId: string, checkItemId: string, input: TrelloCheckItemUpdateInput): Promise<TrelloCheckItem>;
  deleteCheckItem(checklistId: string, checkItemId: string): Promise<void>;

  // Custom Fields
  getCustomField(customFieldId: string): Promise<TrelloCustomField>;
  createCustomField(input: TrelloCustomFieldCreateInput): Promise<TrelloCustomField>;
  updateCustomField(customFieldId: string, input: TrelloCustomFieldUpdateInput): Promise<TrelloCustomField>;
  deleteCustomField(customFieldId: string): Promise<void>;
  getCustomFieldOptions(customFieldId: string): Promise<TrelloCustomFieldOption[]>;
  addCustomFieldOption(customFieldId: string, value: string, color?: string): Promise<TrelloCustomFieldOption>;
  deleteCustomFieldOption(customFieldId: string, optionId: string): Promise<void>;

  // Organizations (Workspaces)
  getOrganization(orgId: string): Promise<TrelloOrganization>;
  createOrganization(input: TrelloOrganizationCreateInput): Promise<TrelloOrganization>;
  updateOrganization(orgId: string, input: TrelloOrganizationUpdateInput): Promise<TrelloOrganization>;
  deleteOrganization(orgId: string): Promise<void>;
  getOrganizationMembers(orgId: string): Promise<TrelloMember[]>;
  getOrganizationBoards(orgId: string, filter?: 'all' | 'open' | 'closed'): Promise<TrelloBoard[]>;

  // Actions
  getAction(actionId: string): Promise<TrelloAction>;

  // Search
  search(query: string, options?: {
    idBoards?: string[];
    idOrganizations?: string[];
    modelTypes?: ('actions' | 'boards' | 'cards' | 'members' | 'organizations')[];
    cards_limit?: number;
    boards_limit?: number;
    partial?: boolean;
  }): Promise<TrelloSearchResult>;
  searchMembers(query: string, limit?: number): Promise<TrelloMember[]>;

  // Webhooks
  getWebhook(webhookId: string): Promise<TrelloWebhook>;
  getWebhooks(): Promise<TrelloWebhook[]>;
  createWebhook(input: TrelloWebhookCreateInput): Promise<TrelloWebhook>;
  updateWebhook(webhookId: string, input: TrelloWebhookUpdateInput): Promise<TrelloWebhook>;
  deleteWebhook(webhookId: string): Promise<void>;
}

// =============================================================================
// Trello Client Implementation
// =============================================================================

class TrelloClientImpl implements TrelloClient {
  private credentials: TenantCredentials;

  constructor(credentials: TenantCredentials) {
    this.credentials = credentials;
  }

  // ===========================================================================
  // HTTP Request Helper
  // ===========================================================================

  private getAuthParams(): URLSearchParams {
    return new URLSearchParams({
      key: this.credentials.apiKey,
      token: this.credentials.token,
    });
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {},
    extraParams?: Record<string, string>
  ): Promise<T> {
    const params = this.getAuthParams();
    if (extraParams) {
      Object.entries(extraParams).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== '') {
          params.set(k, v);
        }
      });
    }

    const url = `${API_BASE_URL}${endpoint}?${params}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    // Handle rate limiting
    if (response.status === 429) {
      const retryAfter = response.headers.get('Retry-After');
      throw new RateLimitError('Rate limit exceeded', retryAfter ? parseInt(retryAfter, 10) : 60);
    }

    // Handle authentication errors
    if (response.status === 401) {
      throw new AuthenticationError('Invalid API key or token');
    }

    // Handle other errors
    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiError(`Trello API error: ${errorBody}`, response.status);
    }

    // Handle 200 with empty body
    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  // ===========================================================================
  // Connection
  // ===========================================================================

  async testConnection(): Promise<{ connected: boolean; message: string }> {
    try {
      const member = await this.getMe();
      return { connected: true, message: `Connected as ${member.fullName} (@${member.username})` };
    } catch (error) {
      return {
        connected: false,
        message: error instanceof Error ? error.message : 'Connection failed',
      };
    }
  }

  // ===========================================================================
  // Members
  // ===========================================================================

  async getMe(): Promise<TrelloMember> {
    return this.request<TrelloMember>('/members/me');
  }

  async getMember(idOrUsername: string): Promise<TrelloMember> {
    return this.request<TrelloMember>(`/members/${idOrUsername}`);
  }

  async getMemberBoards(idOrUsername: string, filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloBoard[]> {
    return this.request<TrelloBoard[]>(`/members/${idOrUsername}/boards`, {}, { filter });
  }

  async getMemberCards(idOrUsername: string): Promise<TrelloCard[]> {
    return this.request<TrelloCard[]>(`/members/${idOrUsername}/cards`);
  }

  async getMemberOrganizations(idOrUsername: string): Promise<TrelloOrganization[]> {
    return this.request<TrelloOrganization[]>(`/members/${idOrUsername}/organizations`);
  }

  // ===========================================================================
  // Boards
  // ===========================================================================

  async listBoards(filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloBoard[]> {
    return this.getMemberBoards('me', filter);
  }

  async getBoard(boardId: string): Promise<TrelloBoard> {
    return this.request<TrelloBoard>(`/boards/${boardId}`);
  }

  async createBoard(input: TrelloBoardCreateInput): Promise<TrelloBoard> {
    const params: Record<string, string> = { name: input.name };
    if (input.desc) params.desc = input.desc;
    if (input.idOrganization) params.idOrganization = input.idOrganization;
    if (input.idBoardSource) params.idBoardSource = input.idBoardSource;
    if (input.keepFromSource) params.keepFromSource = input.keepFromSource;
    if (input.powerUps) params.powerUps = input.powerUps;
    if (input.prefs_permissionLevel) params['prefs_permissionLevel'] = input.prefs_permissionLevel;
    if (input.prefs_voting) params['prefs_voting'] = input.prefs_voting;
    if (input.prefs_comments) params['prefs_comments'] = input.prefs_comments;
    if (input.prefs_invitations) params['prefs_invitations'] = input.prefs_invitations;
    if (input.prefs_selfJoin !== undefined) params['prefs_selfJoin'] = String(input.prefs_selfJoin);
    if (input.prefs_cardCovers !== undefined) params['prefs_cardCovers'] = String(input.prefs_cardCovers);
    if (input.prefs_background) params['prefs_background'] = input.prefs_background;
    if (input.prefs_cardAging) params['prefs_cardAging'] = input.prefs_cardAging;
    if (input.defaultLabels !== undefined) params.defaultLabels = String(input.defaultLabels);
    if (input.defaultLists !== undefined) params.defaultLists = String(input.defaultLists);

    return this.request<TrelloBoard>('/boards', { method: 'POST' }, params);
  }

  async updateBoard(boardId: string, input: TrelloBoardUpdateInput): Promise<TrelloBoard> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.desc !== undefined) params.desc = input.desc;
    if (input.closed !== undefined) params.closed = String(input.closed);
    if (input.subscribed !== undefined) params.subscribed = String(input.subscribed);
    if (input.idOrganization) params.idOrganization = input.idOrganization;
    if (input.prefs_permissionLevel) params['prefs/permissionLevel'] = input.prefs_permissionLevel;
    if (input.prefs_selfJoin !== undefined) params['prefs/selfJoin'] = String(input.prefs_selfJoin);
    if (input.prefs_cardCovers !== undefined) params['prefs/cardCovers'] = String(input.prefs_cardCovers);
    if (input.prefs_hideVotes !== undefined) params['prefs/hideVotes'] = String(input.prefs_hideVotes);
    if (input.prefs_invitations) params['prefs/invitations'] = input.prefs_invitations;
    if (input.prefs_voting) params['prefs/voting'] = input.prefs_voting;
    if (input.prefs_comments) params['prefs/comments'] = input.prefs_comments;
    if (input.prefs_background) params['prefs/background'] = input.prefs_background;
    if (input.prefs_cardAging) params['prefs/cardAging'] = input.prefs_cardAging;
    if (input.prefs_calendarFeedEnabled !== undefined) params['prefs/calendarFeedEnabled'] = String(input.prefs_calendarFeedEnabled);
    if (input.labelNames_green) params['labelNames/green'] = input.labelNames_green;
    if (input.labelNames_yellow) params['labelNames/yellow'] = input.labelNames_yellow;
    if (input.labelNames_orange) params['labelNames/orange'] = input.labelNames_orange;
    if (input.labelNames_red) params['labelNames/red'] = input.labelNames_red;
    if (input.labelNames_purple) params['labelNames/purple'] = input.labelNames_purple;
    if (input.labelNames_blue) params['labelNames/blue'] = input.labelNames_blue;

    return this.request<TrelloBoard>(`/boards/${boardId}`, { method: 'PUT' }, params);
  }

  async deleteBoard(boardId: string): Promise<void> {
    await this.request<void>(`/boards/${boardId}`, { method: 'DELETE' });
  }

  async getBoardMembers(boardId: string): Promise<TrelloMember[]> {
    return this.request<TrelloMember[]>(`/boards/${boardId}/members`);
  }

  async getBoardLists(boardId: string, filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloList[]> {
    return this.request<TrelloList[]>(`/boards/${boardId}/lists`, {}, { filter });
  }

  async getBoardCards(boardId: string, filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloCard[]> {
    return this.request<TrelloCard[]>(`/boards/${boardId}/cards`, {}, { filter });
  }

  async getBoardLabels(boardId: string): Promise<TrelloLabel[]> {
    return this.request<TrelloLabel[]>(`/boards/${boardId}/labels`);
  }

  async getBoardActions(boardId: string, limit = 50): Promise<TrelloAction[]> {
    return this.request<TrelloAction[]>(`/boards/${boardId}/actions`, {}, { limit: String(limit) });
  }

  async getBoardChecklists(boardId: string): Promise<TrelloChecklist[]> {
    return this.request<TrelloChecklist[]>(`/boards/${boardId}/checklists`);
  }

  async getBoardCustomFields(boardId: string): Promise<TrelloCustomField[]> {
    return this.request<TrelloCustomField[]>(`/boards/${boardId}/customFields`);
  }

  async addMemberToBoard(boardId: string, memberId: string, type: 'admin' | 'normal' | 'observer' = 'normal'): Promise<TrelloMember> {
    return this.request<TrelloMember>(`/boards/${boardId}/members/${memberId}`, { method: 'PUT' }, { type });
  }

  async removeMemberFromBoard(boardId: string, memberId: string): Promise<void> {
    await this.request<void>(`/boards/${boardId}/members/${memberId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Lists
  // ===========================================================================

  async getList(listId: string): Promise<TrelloList> {
    return this.request<TrelloList>(`/lists/${listId}`);
  }

  async createList(input: TrelloListCreateInput): Promise<TrelloList> {
    const params: Record<string, string> = {
      name: input.name,
      idBoard: input.idBoard,
    };
    if (input.idListSource) params.idListSource = input.idListSource;
    if (input.pos !== undefined) params.pos = String(input.pos);

    return this.request<TrelloList>('/lists', { method: 'POST' }, params);
  }

  async updateList(listId: string, input: TrelloListUpdateInput): Promise<TrelloList> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.closed !== undefined) params.closed = String(input.closed);
    if (input.idBoard) params.idBoard = input.idBoard;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.subscribed !== undefined) params.subscribed = String(input.subscribed);

    return this.request<TrelloList>(`/lists/${listId}`, { method: 'PUT' }, params);
  }

  async archiveList(listId: string): Promise<TrelloList> {
    return this.updateList(listId, { closed: true });
  }

  async unarchiveList(listId: string): Promise<TrelloList> {
    return this.updateList(listId, { closed: false });
  }

  async getListCards(listId: string, filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloCard[]> {
    return this.request<TrelloCard[]>(`/lists/${listId}/cards`, {}, { filter });
  }

  async archiveAllCardsInList(listId: string): Promise<void> {
    await this.request<void>(`/lists/${listId}/archiveAllCards`, { method: 'POST' });
  }

  async moveAllCardsInList(listId: string, idBoard: string, idList: string): Promise<void> {
    await this.request<void>(`/lists/${listId}/moveAllCards`, { method: 'POST' }, { idBoard, idList });
  }

  // ===========================================================================
  // Cards
  // ===========================================================================

  async getCard(cardId: string): Promise<TrelloCard> {
    return this.request<TrelloCard>(`/cards/${cardId}`, {}, { checklists: 'all', attachments: 'true' });
  }

  async createCard(input: TrelloCardCreateInput): Promise<TrelloCard> {
    const params: Record<string, string> = {
      idList: input.idList,
      name: input.name,
    };
    if (input.desc) params.desc = input.desc;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.due) params.due = input.due;
    if (input.start) params.start = input.start;
    if (input.dueComplete !== undefined) params.dueComplete = String(input.dueComplete);
    if (input.idMembers?.length) params.idMembers = input.idMembers.join(',');
    if (input.idLabels?.length) params.idLabels = input.idLabels.join(',');
    if (input.urlSource) params.urlSource = input.urlSource;
    if (input.idCardSource) params.idCardSource = input.idCardSource;
    if (input.keepFromSource) params.keepFromSource = input.keepFromSource;
    if (input.address) params.address = input.address;
    if (input.locationName) params.locationName = input.locationName;
    if (input.coordinates) params.coordinates = input.coordinates;

    return this.request<TrelloCard>('/cards', { method: 'POST' }, params);
  }

  async updateCard(cardId: string, input: TrelloCardUpdateInput): Promise<TrelloCard> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.desc !== undefined) params.desc = input.desc;
    if (input.closed !== undefined) params.closed = String(input.closed);
    if (input.idList) params.idList = input.idList;
    if (input.idBoard) params.idBoard = input.idBoard;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.due !== undefined) params.due = input.due === null ? '' : input.due;
    if (input.start !== undefined) params.start = input.start === null ? '' : input.start;
    if (input.dueComplete !== undefined) params.dueComplete = String(input.dueComplete);
    if (input.subscribed !== undefined) params.subscribed = String(input.subscribed);

    return this.request<TrelloCard>(`/cards/${cardId}`, { method: 'PUT' }, params);
  }

  async deleteCard(cardId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}`, { method: 'DELETE' });
  }

  async archiveCard(cardId: string): Promise<TrelloCard> {
    return this.updateCard(cardId, { closed: true });
  }

  async unarchiveCard(cardId: string): Promise<TrelloCard> {
    return this.updateCard(cardId, { closed: false });
  }

  async moveCard(cardId: string, idList: string, idBoard?: string): Promise<TrelloCard> {
    const input: TrelloCardUpdateInput = { idList };
    if (idBoard) input.idBoard = idBoard;
    return this.updateCard(cardId, input);
  }

  async getCardActions(cardId: string, limit = 50): Promise<TrelloAction[]> {
    return this.request<TrelloAction[]>(`/cards/${cardId}/actions`, {}, { limit: String(limit) });
  }

  async getCardAttachments(cardId: string): Promise<TrelloAttachment[]> {
    return this.request<TrelloAttachment[]>(`/cards/${cardId}/attachments`);
  }

  async addAttachmentToCard(cardId: string, input: TrelloAttachmentCreateInput): Promise<TrelloAttachment> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.url) params.url = input.url;
    if (input.mimeType) params.mimeType = input.mimeType;
    if (input.setCover !== undefined) params.setCover = String(input.setCover);

    return this.request<TrelloAttachment>(`/cards/${cardId}/attachments`, { method: 'POST' }, params);
  }

  async deleteAttachment(cardId: string, attachmentId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/attachments/${attachmentId}`, { method: 'DELETE' });
  }

  async getCardChecklists(cardId: string): Promise<TrelloChecklist[]> {
    return this.request<TrelloChecklist[]>(`/cards/${cardId}/checklists`);
  }

  async addCommentToCard(cardId: string, text: string): Promise<TrelloComment> {
    return this.request<TrelloComment>(`/cards/${cardId}/actions/comments`, { method: 'POST' }, { text });
  }

  async getCardComments(cardId: string): Promise<TrelloAction[]> {
    return this.request<TrelloAction[]>(`/cards/${cardId}/actions`, {}, { filter: 'commentCard' });
  }

  async updateComment(cardId: string, actionId: string, text: string): Promise<TrelloAction> {
    return this.request<TrelloAction>(`/cards/${cardId}/actions/${actionId}/comments`, { method: 'PUT' }, { text });
  }

  async deleteComment(cardId: string, actionId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/actions/${actionId}/comments`, { method: 'DELETE' });
  }

  async addLabelToCard(cardId: string, labelId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/idLabels`, { method: 'POST' }, { value: labelId });
  }

  async removeLabelFromCard(cardId: string, labelId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/idLabels/${labelId}`, { method: 'DELETE' });
  }

  async addMemberToCard(cardId: string, memberId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/idMembers`, { method: 'POST' }, { value: memberId });
  }

  async removeMemberFromCard(cardId: string, memberId: string): Promise<void> {
    await this.request<void>(`/cards/${cardId}/idMembers/${memberId}`, { method: 'DELETE' });
  }

  async getCardCustomFieldItems(cardId: string): Promise<TrelloCustomFieldItem[]> {
    return this.request<TrelloCustomFieldItem[]>(`/cards/${cardId}/customFieldItems`);
  }

  async setCardCustomFieldValue(cardId: string, customFieldId: string, value: Record<string, unknown>): Promise<void> {
    await this.request<void>(
      `/cards/${cardId}/customField/${customFieldId}/item`,
      {
        method: 'PUT',
        body: JSON.stringify(value),
      }
    );
  }

  // ===========================================================================
  // Labels
  // ===========================================================================

  async getLabel(labelId: string): Promise<TrelloLabel> {
    return this.request<TrelloLabel>(`/labels/${labelId}`);
  }

  async createLabel(input: TrelloLabelCreateInput): Promise<TrelloLabel> {
    const params: Record<string, string> = {
      name: input.name,
      idBoard: input.idBoard,
    };
    if (input.color) params.color = input.color;

    return this.request<TrelloLabel>('/labels', { method: 'POST' }, params);
  }

  async updateLabel(labelId: string, input: TrelloLabelUpdateInput): Promise<TrelloLabel> {
    const params: Record<string, string> = {};
    if (input.name !== undefined) params.name = input.name;
    if (input.color !== undefined) params.color = input.color || '';

    return this.request<TrelloLabel>(`/labels/${labelId}`, { method: 'PUT' }, params);
  }

  async deleteLabel(labelId: string): Promise<void> {
    await this.request<void>(`/labels/${labelId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Checklists
  // ===========================================================================

  async getChecklist(checklistId: string): Promise<TrelloChecklist> {
    return this.request<TrelloChecklist>(`/checklists/${checklistId}`, {}, { checkItems: 'all' });
  }

  async createChecklist(input: TrelloChecklistCreateInput): Promise<TrelloChecklist> {
    const params: Record<string, string> = { idCard: input.idCard };
    if (input.name) params.name = input.name;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.idChecklistSource) params.idChecklistSource = input.idChecklistSource;

    return this.request<TrelloChecklist>('/checklists', { method: 'POST' }, params);
  }

  async updateChecklist(checklistId: string, name: string): Promise<TrelloChecklist> {
    return this.request<TrelloChecklist>(`/checklists/${checklistId}`, { method: 'PUT' }, { name });
  }

  async deleteChecklist(checklistId: string): Promise<void> {
    await this.request<void>(`/checklists/${checklistId}`, { method: 'DELETE' });
  }

  async getCheckItems(checklistId: string): Promise<TrelloCheckItem[]> {
    return this.request<TrelloCheckItem[]>(`/checklists/${checklistId}/checkItems`);
  }

  async createCheckItem(checklistId: string, input: TrelloCheckItemCreateInput): Promise<TrelloCheckItem> {
    const params: Record<string, string> = { name: input.name };
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.checked !== undefined) params.checked = String(input.checked);
    if (input.due) params.due = input.due;
    if (input.idMember) params.idMember = input.idMember;

    return this.request<TrelloCheckItem>(`/checklists/${checklistId}/checkItems`, { method: 'POST' }, params);
  }

  async updateCheckItem(cardId: string, checkItemId: string, input: TrelloCheckItemUpdateInput): Promise<TrelloCheckItem> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.state) params.state = input.state;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.due !== undefined) params.due = input.due === null ? '' : input.due;
    if (input.idMember !== undefined) params.idMember = input.idMember === null ? '' : input.idMember;

    return this.request<TrelloCheckItem>(`/cards/${cardId}/checkItem/${checkItemId}`, { method: 'PUT' }, params);
  }

  async deleteCheckItem(checklistId: string, checkItemId: string): Promise<void> {
    await this.request<void>(`/checklists/${checklistId}/checkItems/${checkItemId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Custom Fields
  // ===========================================================================

  async getCustomField(customFieldId: string): Promise<TrelloCustomField> {
    return this.request<TrelloCustomField>(`/customFields/${customFieldId}`);
  }

  async createCustomField(input: TrelloCustomFieldCreateInput): Promise<TrelloCustomField> {
    const params: Record<string, string> = {
      idModel: input.idModel,
      modelType: input.modelType,
      name: input.name,
      type: input.type,
    };
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.display_cardFront !== undefined) params['display_cardFront'] = String(input.display_cardFront);

    return this.request<TrelloCustomField>('/customFields', { method: 'POST' }, params);
  }

  async updateCustomField(customFieldId: string, input: TrelloCustomFieldUpdateInput): Promise<TrelloCustomField> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.pos !== undefined) params.pos = String(input.pos);
    if (input.display_cardFront !== undefined) params['display/cardFront'] = String(input.display_cardFront);

    return this.request<TrelloCustomField>(`/customFields/${customFieldId}`, { method: 'PUT' }, params);
  }

  async deleteCustomField(customFieldId: string): Promise<void> {
    await this.request<void>(`/customFields/${customFieldId}`, { method: 'DELETE' });
  }

  async getCustomFieldOptions(customFieldId: string): Promise<TrelloCustomFieldOption[]> {
    return this.request<TrelloCustomFieldOption[]>(`/customFields/${customFieldId}/options`);
  }

  async addCustomFieldOption(customFieldId: string, value: string, color?: string): Promise<TrelloCustomFieldOption> {
    const body: Record<string, unknown> = {
      value: { text: value },
    };
    if (color) body.color = color;

    return this.request<TrelloCustomFieldOption>(
      `/customFields/${customFieldId}/options`,
      {
        method: 'POST',
        body: JSON.stringify(body),
      }
    );
  }

  async deleteCustomFieldOption(customFieldId: string, optionId: string): Promise<void> {
    await this.request<void>(`/customFields/${customFieldId}/options/${optionId}`, { method: 'DELETE' });
  }

  // ===========================================================================
  // Organizations (Workspaces)
  // ===========================================================================

  async getOrganization(orgId: string): Promise<TrelloOrganization> {
    return this.request<TrelloOrganization>(`/organizations/${orgId}`);
  }

  async createOrganization(input: TrelloOrganizationCreateInput): Promise<TrelloOrganization> {
    const params: Record<string, string> = { displayName: input.displayName };
    if (input.desc) params.desc = input.desc;
    if (input.name) params.name = input.name;
    if (input.website) params.website = input.website;

    return this.request<TrelloOrganization>('/organizations', { method: 'POST' }, params);
  }

  async updateOrganization(orgId: string, input: TrelloOrganizationUpdateInput): Promise<TrelloOrganization> {
    const params: Record<string, string> = {};
    if (input.name) params.name = input.name;
    if (input.displayName) params.displayName = input.displayName;
    if (input.desc !== undefined) params.desc = input.desc;
    if (input.website !== undefined) params.website = input.website || '';
    if (input.prefs_permissionLevel) params['prefs/permissionLevel'] = input.prefs_permissionLevel;
    if (input.prefs_orgInviteRestrict) params['prefs/orgInviteRestrict'] = input.prefs_orgInviteRestrict;
    if (input.prefs_boardVisibilityRestrict_private) params['prefs/boardVisibilityRestrict/private'] = input.prefs_boardVisibilityRestrict_private;
    if (input.prefs_boardVisibilityRestrict_org) params['prefs/boardVisibilityRestrict/org'] = input.prefs_boardVisibilityRestrict_org;
    if (input.prefs_boardVisibilityRestrict_public) params['prefs/boardVisibilityRestrict/public'] = input.prefs_boardVisibilityRestrict_public;

    return this.request<TrelloOrganization>(`/organizations/${orgId}`, { method: 'PUT' }, params);
  }

  async deleteOrganization(orgId: string): Promise<void> {
    await this.request<void>(`/organizations/${orgId}`, { method: 'DELETE' });
  }

  async getOrganizationMembers(orgId: string): Promise<TrelloMember[]> {
    return this.request<TrelloMember[]>(`/organizations/${orgId}/members`);
  }

  async getOrganizationBoards(orgId: string, filter: 'all' | 'open' | 'closed' = 'open'): Promise<TrelloBoard[]> {
    return this.request<TrelloBoard[]>(`/organizations/${orgId}/boards`, {}, { filter });
  }

  // ===========================================================================
  // Actions
  // ===========================================================================

  async getAction(actionId: string): Promise<TrelloAction> {
    return this.request<TrelloAction>(`/actions/${actionId}`);
  }

  // ===========================================================================
  // Search
  // ===========================================================================

  async search(query: string, options?: {
    idBoards?: string[];
    idOrganizations?: string[];
    modelTypes?: ('actions' | 'boards' | 'cards' | 'members' | 'organizations')[];
    cards_limit?: number;
    boards_limit?: number;
    partial?: boolean;
  }): Promise<TrelloSearchResult> {
    const params: Record<string, string> = { query };
    if (options?.idBoards?.length) params.idBoards = options.idBoards.join(',');
    if (options?.idOrganizations?.length) params.idOrganizations = options.idOrganizations.join(',');
    if (options?.modelTypes?.length) params.modelTypes = options.modelTypes.join(',');
    if (options?.cards_limit) params.cards_limit = String(options.cards_limit);
    if (options?.boards_limit) params.boards_limit = String(options.boards_limit);
    if (options?.partial !== undefined) params.partial = String(options.partial);

    return this.request<TrelloSearchResult>('/search', {}, params);
  }

  async searchMembers(query: string, limit = 8): Promise<TrelloMember[]> {
    return this.request<TrelloMember[]>('/search/members', {}, { query, limit: String(limit) });
  }

  // ===========================================================================
  // Webhooks
  // ===========================================================================

  async getWebhook(webhookId: string): Promise<TrelloWebhook> {
    return this.request<TrelloWebhook>(`/webhooks/${webhookId}`);
  }

  async getWebhooks(): Promise<TrelloWebhook[]> {
    return this.request<TrelloWebhook[]>(`/tokens/${this.credentials.token}/webhooks`);
  }

  async createWebhook(input: TrelloWebhookCreateInput): Promise<TrelloWebhook> {
    const params: Record<string, string> = {
      callbackURL: input.callbackURL,
      idModel: input.idModel,
    };
    if (input.description) params.description = input.description;
    if (input.active !== undefined) params.active = String(input.active);

    return this.request<TrelloWebhook>('/webhooks', { method: 'POST' }, params);
  }

  async updateWebhook(webhookId: string, input: TrelloWebhookUpdateInput): Promise<TrelloWebhook> {
    const params: Record<string, string> = {};
    if (input.description !== undefined) params.description = input.description;
    if (input.callbackURL) params.callbackURL = input.callbackURL;
    if (input.idModel) params.idModel = input.idModel;
    if (input.active !== undefined) params.active = String(input.active);

    return this.request<TrelloWebhook>(`/webhooks/${webhookId}`, { method: 'PUT' }, params);
  }

  async deleteWebhook(webhookId: string): Promise<void> {
    await this.request<void>(`/webhooks/${webhookId}`, { method: 'DELETE' });
  }
}

// =============================================================================
// Factory Function
// =============================================================================

/**
 * Create a Trello client instance with tenant-specific credentials.
 *
 * MULTI-TENANT: Each request provides its own credentials via headers,
 * allowing a single server deployment to serve multiple tenants.
 *
 * @param credentials - Tenant credentials parsed from request headers
 */
export function createTrelloClient(credentials: TenantCredentials): TrelloClient {
  return new TrelloClientImpl(credentials);
}
