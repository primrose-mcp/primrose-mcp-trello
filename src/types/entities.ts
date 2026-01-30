/**
 * Trello Entity Types
 *
 * Type definitions for Trello API entities.
 */

// =============================================================================
// Response Format
// =============================================================================

export type ResponseFormat = 'json' | 'markdown';

// =============================================================================
// Board
// =============================================================================

export interface TrelloBoard {
  id: string;
  name: string;
  desc: string;
  descData: string | null;
  closed: boolean;
  idOrganization: string | null;
  idEnterprise: string | null;
  pinned: boolean;
  url: string;
  shortUrl: string;
  shortLink: string;
  prefs: TrelloBoardPrefs;
  starred: boolean;
  memberships?: TrelloMembership[];
  dateLastActivity?: string;
  dateLastView?: string;
}

export interface TrelloBoardPrefs {
  permissionLevel: 'private' | 'org' | 'public';
  hideVotes: boolean;
  voting: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  comments: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  invitations: 'members' | 'admins';
  selfJoin: boolean;
  cardCovers: boolean;
  isTemplate: boolean;
  cardAging: 'regular' | 'pirate';
  calendarFeedEnabled: boolean;
  background: string;
  backgroundColor: string | null;
  backgroundImage: string | null;
  backgroundTile: boolean;
  backgroundBrightness: 'light' | 'dark';
  canBePublic: boolean;
  canBeEnterprise: boolean;
  canBeOrg: boolean;
  canBePrivate: boolean;
  canInvite: boolean;
}

export interface TrelloMembership {
  id: string;
  idMember: string;
  memberType: 'admin' | 'normal' | 'observer';
  unconfirmed: boolean;
  deactivated: boolean;
}

export interface TrelloBoardCreateInput {
  name: string;
  desc?: string;
  idOrganization?: string;
  idBoardSource?: string;
  keepFromSource?: 'cards' | 'none';
  powerUps?: 'all' | 'calendar' | 'cardAging' | 'recap' | 'voting';
  prefs_permissionLevel?: 'private' | 'org' | 'public';
  prefs_voting?: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  prefs_comments?: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  prefs_invitations?: 'members' | 'admins';
  prefs_selfJoin?: boolean;
  prefs_cardCovers?: boolean;
  prefs_background?: string;
  prefs_cardAging?: 'regular' | 'pirate';
  defaultLabels?: boolean;
  defaultLists?: boolean;
}

export interface TrelloBoardUpdateInput {
  name?: string;
  desc?: string;
  closed?: boolean;
  subscribed?: boolean;
  idOrganization?: string;
  prefs_permissionLevel?: 'private' | 'org' | 'public';
  prefs_selfJoin?: boolean;
  prefs_cardCovers?: boolean;
  prefs_hideVotes?: boolean;
  prefs_invitations?: 'members' | 'admins';
  prefs_voting?: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  prefs_comments?: 'disabled' | 'members' | 'observers' | 'org' | 'public';
  prefs_background?: string;
  prefs_cardAging?: 'regular' | 'pirate';
  prefs_calendarFeedEnabled?: boolean;
  labelNames_green?: string;
  labelNames_yellow?: string;
  labelNames_orange?: string;
  labelNames_red?: string;
  labelNames_purple?: string;
  labelNames_blue?: string;
}

// =============================================================================
// List
// =============================================================================

export interface TrelloList {
  id: string;
  name: string;
  closed: boolean;
  idBoard: string;
  pos: number;
  subscribed?: boolean;
  softLimit?: number | null;
}

export interface TrelloListCreateInput {
  name: string;
  idBoard: string;
  idListSource?: string;
  pos?: 'top' | 'bottom' | number;
}

export interface TrelloListUpdateInput {
  name?: string;
  closed?: boolean;
  idBoard?: string;
  pos?: 'top' | 'bottom' | number;
  subscribed?: boolean;
}

// =============================================================================
// Card
// =============================================================================

export interface TrelloCard {
  id: string;
  name: string;
  desc: string;
  closed: boolean;
  idBoard: string;
  idList: string;
  idShort: number;
  pos: number;
  due: string | null;
  dueComplete: boolean;
  dueReminder: number | null;
  start: string | null;
  dateLastActivity: string;
  idMembers: string[];
  idLabels: string[];
  labels: TrelloLabel[];
  shortUrl: string;
  shortLink: string;
  url: string;
  subscribed?: boolean;
  badges?: TrelloCardBadges;
  idChecklists?: string[];
  idAttachmentCover: string | null;
  manualCoverAttachment?: boolean;
  cover?: TrelloCardCover;
  isTemplate?: boolean;
  cardRole?: string | null;
}

export interface TrelloCardBadges {
  attachmentsByType: {
    trello: { board: number; card: number };
  };
  location: boolean;
  votes: number;
  viewingMemberVoted: boolean;
  subscribed: boolean;
  fogbugz: string;
  checkItems: number;
  checkItemsChecked: number;
  checkItemsEarliestDue: string | null;
  comments: number;
  attachments: number;
  description: boolean;
  due: string | null;
  dueComplete: boolean;
  start: string | null;
}

export interface TrelloCardCover {
  idAttachment: string | null;
  color: TrelloColor | null;
  idUploadedBackground: string | null;
  size: 'normal' | 'full';
  brightness: 'light' | 'dark';
  idPlugin: string | null;
}

export interface TrelloCardCreateInput {
  idList: string;
  name: string;
  desc?: string;
  pos?: 'top' | 'bottom' | number;
  due?: string;
  start?: string;
  dueComplete?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  urlSource?: string;
  fileSource?: string;
  mimeType?: string;
  idCardSource?: string;
  keepFromSource?: 'all' | 'attachments' | 'checklists' | 'comments' | 'customFields' | 'due' | 'start' | 'labels' | 'members' | 'stickers';
  address?: string;
  locationName?: string;
  coordinates?: string;
}

export interface TrelloCardUpdateInput {
  name?: string;
  desc?: string;
  closed?: boolean;
  idList?: string;
  idBoard?: string;
  pos?: 'top' | 'bottom' | number;
  due?: string | null;
  start?: string | null;
  dueComplete?: boolean;
  subscribed?: boolean;
  idMembers?: string[];
  idLabels?: string[];
  cover?: {
    color?: TrelloColor;
    brightness?: 'light' | 'dark';
    size?: 'normal' | 'full';
  };
}

// =============================================================================
// Label
// =============================================================================

export type TrelloColor = 'yellow' | 'purple' | 'blue' | 'red' | 'green' | 'orange' | 'black' | 'sky' | 'pink' | 'lime' | null;

export interface TrelloLabel {
  id: string;
  idBoard: string;
  name: string;
  color: TrelloColor;
}

export interface TrelloLabelCreateInput {
  name: string;
  color: TrelloColor;
  idBoard: string;
}

export interface TrelloLabelUpdateInput {
  name?: string;
  color?: TrelloColor;
}

// =============================================================================
// Checklist
// =============================================================================

export interface TrelloChecklist {
  id: string;
  name: string;
  idBoard: string;
  idCard: string;
  pos: number;
  checkItems: TrelloCheckItem[];
}

export interface TrelloCheckItem {
  id: string;
  name: string;
  nameData: { emoji: Record<string, unknown> } | null;
  pos: number;
  state: 'complete' | 'incomplete';
  idChecklist: string;
  due: string | null;
  idMember: string | null;
}

export interface TrelloChecklistCreateInput {
  idCard: string;
  name?: string;
  pos?: 'top' | 'bottom' | number;
  idChecklistSource?: string;
}

export interface TrelloCheckItemCreateInput {
  name: string;
  pos?: 'top' | 'bottom' | number;
  checked?: boolean;
  due?: string;
  idMember?: string;
}

export interface TrelloCheckItemUpdateInput {
  name?: string;
  state?: 'complete' | 'incomplete';
  pos?: 'top' | 'bottom' | number;
  due?: string | null;
  idMember?: string | null;
}

// =============================================================================
// Member
// =============================================================================

export interface TrelloMember {
  id: string;
  username: string;
  fullName: string;
  initials: string;
  avatarHash: string | null;
  avatarUrl: string | null;
  memberType?: 'admin' | 'normal' | 'observer';
  confirmed?: boolean;
  activityBlocked?: boolean;
  bio?: string;
  url?: string;
  email?: string;
  status?: 'active' | 'deactivated' | 'disconnected';
  idBoards?: string[];
  idOrganizations?: string[];
  idEnterprisesAdmin?: string[];
}

// =============================================================================
// Organization (Workspace)
// =============================================================================

export interface TrelloOrganization {
  id: string;
  name: string;
  displayName: string;
  desc: string;
  descData: string | null;
  url: string;
  website: string | null;
  teamType: string | null;
  logoHash: string | null;
  logoUrl: string | null;
  products: number[];
  powerUps: number[];
  idBoards?: string[];
  idMemberCreator?: string;
  memberships?: TrelloMembership[];
  members?: TrelloMember[];
  prefs?: TrelloOrganizationPrefs;
}

export interface TrelloOrganizationPrefs {
  permissionLevel: 'private' | 'org' | 'public';
  orgInviteRestrict: string[];
  boardVisibilityRestrict: {
    private: string;
    org: string;
    public: string;
  };
  attachmentRestrictions: string[] | null;
}

export interface TrelloOrganizationCreateInput {
  displayName: string;
  desc?: string;
  name?: string;
  website?: string;
}

export interface TrelloOrganizationUpdateInput {
  name?: string;
  displayName?: string;
  desc?: string;
  website?: string;
  prefs_permissionLevel?: 'private' | 'org' | 'public';
  prefs_orgInviteRestrict?: string;
  prefs_boardVisibilityRestrict_private?: string;
  prefs_boardVisibilityRestrict_org?: string;
  prefs_boardVisibilityRestrict_public?: string;
}

// =============================================================================
// Action (Activity)
// =============================================================================

export interface TrelloAction {
  id: string;
  idMemberCreator: string;
  type: string;
  date: string;
  data: TrelloActionData;
  memberCreator?: TrelloMember;
  display?: {
    translationKey: string;
    entities: Record<string, unknown>;
  };
}

export interface TrelloActionData {
  text?: string;
  card?: { id: string; name: string; idShort?: number; shortLink?: string };
  board?: { id: string; name: string; shortLink?: string };
  list?: { id: string; name: string };
  listBefore?: { id: string; name: string };
  listAfter?: { id: string; name: string };
  old?: Record<string, unknown>;
  attachment?: { id: string; name: string; url?: string };
  checklist?: { id: string; name: string };
  checkItem?: { id: string; name: string; state?: string };
  member?: { id: string; name: string };
  organization?: { id: string; name: string };
}

// =============================================================================
// Attachment
// =============================================================================

export interface TrelloAttachment {
  id: string;
  bytes: number | null;
  date: string;
  edgeColor: string | null;
  idMember: string;
  isUpload: boolean;
  mimeType: string;
  name: string;
  pos: number;
  previews: TrelloAttachmentPreview[];
  url: string;
  fileName: string;
}

export interface TrelloAttachmentPreview {
  id: string;
  _id: string;
  scaled: boolean;
  url: string;
  bytes: number;
  height: number;
  width: number;
}

export interface TrelloAttachmentCreateInput {
  name?: string;
  file?: string;
  mimeType?: string;
  url?: string;
  setCover?: boolean;
}

// =============================================================================
// Custom Field
// =============================================================================

export interface TrelloCustomField {
  id: string;
  idModel: string;
  modelType: 'board';
  fieldGroup: string;
  name: string;
  pos: number;
  display: {
    cardFront: boolean;
  };
  type: 'checkbox' | 'date' | 'list' | 'number' | 'text';
  options?: TrelloCustomFieldOption[];
}

export interface TrelloCustomFieldOption {
  id: string;
  idCustomField: string;
  value: {
    text: string;
  };
  color: TrelloColor;
  pos: number;
}

export interface TrelloCustomFieldItem {
  id: string;
  idCustomField: string;
  idModel: string;
  modelType: 'card';
  idValue?: string;
  value?: {
    text?: string;
    number?: string;
    date?: string;
    checked?: string;
  };
}

export interface TrelloCustomFieldCreateInput {
  idModel: string;
  modelType: 'board';
  name: string;
  type: 'checkbox' | 'date' | 'list' | 'number' | 'text';
  pos?: 'top' | 'bottom' | number;
  display_cardFront?: boolean;
}

export interface TrelloCustomFieldUpdateInput {
  name?: string;
  pos?: 'top' | 'bottom' | number;
  display_cardFront?: boolean;
}

// =============================================================================
// Webhook
// =============================================================================

export interface TrelloWebhook {
  id: string;
  description: string;
  idModel: string;
  callbackURL: string;
  active: boolean;
  consecutiveFailures: number;
  firstConsecutiveFailDate: string | null;
}

export interface TrelloWebhookCreateInput {
  callbackURL: string;
  idModel: string;
  description?: string;
  active?: boolean;
}

export interface TrelloWebhookUpdateInput {
  description?: string;
  callbackURL?: string;
  idModel?: string;
  active?: boolean;
}

// =============================================================================
// Search
// =============================================================================

export interface TrelloSearchResult {
  options: {
    terms: { text: string }[];
    modifiers: unknown[];
    modelTypes: string[];
    partial: boolean;
  };
  boards?: TrelloBoard[];
  cards?: TrelloCard[];
  members?: TrelloMember[];
  organizations?: TrelloOrganization[];
}

// =============================================================================
// Comment
// =============================================================================

export interface TrelloComment {
  id: string;
  idMemberCreator: string;
  data: {
    text: string;
    card: { id: string; name: string; shortLink: string; idShort: number };
    board: { id: string; name: string; shortLink: string };
    list: { id: string; name: string };
  };
  type: 'commentCard';
  date: string;
  memberCreator: TrelloMember;
}
