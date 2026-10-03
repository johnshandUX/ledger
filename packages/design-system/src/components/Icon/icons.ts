import type { LucideIcon } from "lucide-react";
import {
  ArrowDown, ArrowLeft, ArrowLeftRight, ArrowRight, ArrowUp, ArrowUpDown, Bell, Building2, Calendar, Check,
  ChevronDown, ChevronLeft, ChevronRight, ChevronUp, CircleUserRound,
  CircleX, CreditCard, Download, Eye, FileText, Filter, House, Info, Menu, Moon, Pencil,
  Plus, Search, Send, Settings, Sun, Trash2, TriangleAlert, Upload, UserRound, X,
} from "lucide-react";

export const iconCategories = ["Actions", "Navigation", "Status", "Finance", "Objects / content"] as const;
export type IconCategory = (typeof iconCategories)[number];

type IconDefinition = { component: LucideIcon; lucideName: string; category: IconCategory };
const defineIcon = (component: LucideIcon, lucideName: string, category: IconCategory): IconDefinition => ({ component, lucideName, category });

export const iconRegistry = {
  search: defineIcon(Search, "Search", "Actions"),
  add: defineIcon(Plus, "Plus", "Actions"),
  edit: defineIcon(Pencil, "Pencil", "Actions"),
  delete: defineIcon(Trash2, "Trash2", "Actions"),
  close: defineIcon(X, "X", "Actions"),
  download: defineIcon(Download, "Download", "Actions"),
  upload: defineIcon(Upload, "Upload", "Actions"),
  filter: defineIcon(Filter, "Filter", "Actions"),
  sort: defineIcon(ArrowUpDown, "ArrowUpDown", "Actions"),
  visibility: defineIcon(Eye, "Eye", "Actions"),
  menu: defineIcon(Menu, "Menu", "Navigation"),
  home: defineIcon(House, "House", "Navigation"),
  "chevron-left": defineIcon(ChevronLeft, "ChevronLeft", "Navigation"),
  "chevron-right": defineIcon(ChevronRight, "ChevronRight", "Navigation"),
  "chevron-up": defineIcon(ChevronUp, "ChevronUp", "Navigation"),
  "chevron-down": defineIcon(ChevronDown, "ChevronDown", "Navigation"),
  "arrow-left": defineIcon(ArrowLeft, "ArrowLeft", "Navigation"),
  "arrow-right": defineIcon(ArrowRight, "ArrowRight", "Navigation"),
  "arrow-up": defineIcon(ArrowUp, "ArrowUp", "Navigation"),
  "arrow-down": defineIcon(ArrowDown, "ArrowDown", "Navigation"),
  information: defineIcon(Info, "Info", "Status"),
  warning: defineIcon(TriangleAlert, "TriangleAlert", "Status"),
  success: defineIcon(Check, "Check", "Status"),
  error: defineIcon(CircleX, "CircleX", "Status"),
  card: defineIcon(CreditCard, "CreditCard", "Finance"),
  payment: defineIcon(Send, "Send", "Finance"),
  transfer: defineIcon(ArrowLeftRight, "ArrowLeftRight", "Finance"),
  user: defineIcon(UserRound, "UserRound", "Objects / content"),
  profile: defineIcon(CircleUserRound, "CircleUserRound", "Objects / content"),
  business: defineIcon(Building2, "Building2", "Objects / content"),
  document: defineIcon(FileText, "FileText", "Objects / content"),
  calendar: defineIcon(Calendar, "Calendar", "Objects / content"),
  settings: defineIcon(Settings, "Settings", "Objects / content"),
  notifications: defineIcon(Bell, "Bell", "Objects / content"),
  sun: defineIcon(Sun, "Sun", "Objects / content"),
  moon: defineIcon(Moon, "Moon", "Objects / content"),
} as const satisfies Record<string, IconDefinition>;

export type IconName = keyof typeof iconRegistry;

export const iconCatalog: ReadonlyArray<{ name: IconName; lucideName: string; category: IconCategory }> =
  (Object.entries(iconRegistry) as [IconName, IconDefinition][]).map(([name, { lucideName, category }]) => ({ name, lucideName, category }));
