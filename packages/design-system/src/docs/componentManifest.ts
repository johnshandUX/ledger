export type ComponentLifecycle = "Planned" | "In progress" | "Implemented" | "Deprecated";
export type PublicationStatus = "Published" | "Unpublished" | "Not applicable";
export type ComponentClassification = "Core" | "Core Pattern" | "Domain" | "Product" | "Utility";
export type FigmaParity = "exists" | "needs-update" | "not-created";

export type ComponentDefinition = Readonly<{
  name: string;
  slug: string;
  lifecycle: ComponentLifecycle;
  publication: PublicationStatus;
  classification: ComponentClassification;
  entry: string | null;
  purpose: string;
  contract: string;
  figma: FigmaParity;
}>;

const implementedComponents = [
  ["Button", "button", "Published", "Core", "root", "Triggers an action.", "Primary, secondary and destructive variants with default and small sizes plus native button attributes.", "needs-update"],
  ["Input", "input", "Published", "Core", "root", "Collects a single-line value.", "Requires a label and supports hint and error text with linked accessible descriptions.", "needs-update"],
  ["Textarea", "textarea", "Published", "Core", "root", "Collects longer text.", "Matches Input's shared 1px control treatment and remains vertically resizable.", "needs-update"],
  ["Select", "select", "Published", "Core", "root", "Chooses one value from a defined list.", "Uses a native select, shared 1px control treatment and native keyboard and form behaviour.", "needs-update"],
  ["Checkbox", "checkbox", "Published", "Core", "root", "Toggles an independent choice.", "Uses a native checkbox with a clickable label, hint and error support.", "exists"],
  ["Radio", "radio", "Published", "Core", "root", "Chooses one option in a group.", "Uses a native radio and retains browser keyboard behaviour within a named group.", "exists"],
  ["FormField", "form-field", "Published", "Core Pattern", "root", "Composes shared field state.", "Passes identifiers, labels and state to a compatible child control.", "needs-update"],
  ["Table", "table", "Published", "Core", "root", "Presents structured tabular data.", "Composable semantic table primitives with accessible naming and alignment.", "exists"],
  ["DataTable", "data-table", "Published", "Core Pattern", "./data-table", "Helps users scan, compare, sort and page through datasets.", "Typed columns and product-owned data configuration over semantic Table.", "needs-update"],
  ["Dialog", "dialog", "Published", "Core", "./dialog", "Contains a compact focused task.", "Radix supplies modal semantics, focus management, dismissal and focus return.", "exists"],
  ["Tooltip", "tooltip", "Published", "Core", "./tooltip", "Adds brief non-interactive supplementary text.", "One trigger and required content with a documented opening delay.", "exists"],
  ["Popover", "popover", "Published", "Core", "./popover", "Shows contextual interactive content.", "Non-modal, trigger-anchored content with dismissal and focus return.", "exists"],
  ["DropdownMenu", "dropdown-menu", "Published", "Core", "./dropdown-menu", "Offers a keyboard-navigable action list.", "Supports default and destructive items, disabled items and separators.", "exists"],
  ["AlertDialog", "alert-dialog", "Published", "Core", "./alert-dialog", "Confirms a high-consequence decision.", "Requires a visible title plus explicit cancel and action elements.", "exists"],
  ["Sheet", "sheet", "Published", "Core", "./sheet", "Presents supporting content from a viewport edge.", "Supports left or right placement with modal focus behaviour; it is not primary navigation.", "exists"],
  ["AppearanceToggle", "appearance-toggle", "Published", "Core", "./appearance-toggle", "Switches effective application appearance.", "Controlled light/dark presentation; applications own preference state.", "not-created"],
  ["Icon", "icon", "Published", "Core", "./icons", "Renders an approved icon from the Ledger catalogue.", "Governed sizes, currentColor, filled semantic status artwork and explicit meaningful-name support.", "needs-update"],
  ["Link", "link", "Not applicable", "Utility", "styles.css", "Navigates to another destination.", "Visual convention for semantic anchors; routing remains application-owned and no React component is published.", "needs-update"],
  ["Separator", "separator", "Published", "Core", "root", "Creates a visual or semantic boundary.", "Horizontal or vertical; decorative by default with explicit semantic mode.", "not-created"],
  ["Skeleton", "skeleton", "Published", "Core", "root", "Reserves layout while content loads.", "Decorative placeholder with consumer-owned busy state and loading message.", "not-created"],
  ["Spinner", "spinner", "Published", "Core", "root", "Communicates indeterminate progress.", "Three sizes; decorative beside text or named when used alone.", "not-created"],
  ["AspectRatio", "aspect-ratio", "Published", "Core", "root", "Reserves a responsive shape for media.", "Native CSS ratio wrapper that preserves child semantics.", "not-created"],
  ["Badge", "badge", "Published", "Core", "root", "Communicates compact status or classification.", "Non-interactive neutral, informational, success, warning and error treatments.", "needs-update"],
  ["Alert", "alert", "Published", "Core", "root", "Presents important static feedback.", "Composable title and description with explicit, consumer-owned announcement semantics.", "needs-update"],
  ["Card", "card", "Published", "Core", "root", "Groups related content on a structured surface.", "Header, body and footer composition with no clickable or visual variants.", "needs-update"],
  ["Progress", "progress", "Published", "Core", "./progress", "Communicates measurable or indeterminate operation progress.", "Radix-backed, explicitly named progress with bounded determinate values or a null indeterminate state.", "not-created"],
  ["Avatar", "avatar", "Published", "Core", "./avatar", "Represents a person or organisation with resilient fallback text.", "Radix-backed image loading and fallback with three explicit sizes.", "not-created"],
] as const;

const plannedComponents = [
  ["Tabs", "tabs", "Core", "Organises related views within one context."],
  ["Breadcrumb", "breadcrumb", "Core", "Shows the current location in a hierarchy."],
  ["Pagination", "pagination", "Core", "Moves through a paged collection."],
  ["Collapsible", "collapsible", "Core", "Reveals or hides a section of content."],
  ["Sidebar", "sidebar", "Core Pattern", "Composes fully expanded or fully closed application navigation."],
  ["MobileNavigationOverlay", "mobile-navigation-overlay", "Core Pattern", "Presents application navigation in a dedicated small-screen overlay composition."],
  ["EmptyState", "empty-state", "Core", "Explains an empty collection or absent result."],
  ["ToastRegion", "toast-region", "Core", "Presents transient application feedback."],
  ["VisuallyHidden", "visually-hidden", "Core", "Keeps content available to assistive technology without visual display."],
  ["AsyncStatus", "async-status", "Core Pattern", "Composes status primitives for background work."],
  ["ButtonGroup", "button-group", "Core", "Groups related actions."],
  ["ToggleGroup", "toggle-group", "Core", "Selects one or more options from visible toggles."],
  ["Switch", "switch", "Core", "Changes an immediate binary setting."],
  ["SearchField", "search-field", "Core", "Collects a search query with appropriate control affordances."],
  ["Combobox", "combobox", "Core", "Selects from a searchable collection."],
  ["ListBox", "list-box", "Core", "Provides the selectable-collection contract used by advanced controls."],
  ["FilterBar", "filter-bar", "Core Pattern", "Coordinates search and filter controls."],
  ["Calendar", "calendar", "Core", "Presents dates for keyboard-accessible selection."],
  ["DateField", "date-field", "Core", "Collects a structured date value."],
  ["DatePicker", "date-picker", "Core", "Combines date entry with calendar selection."],
  ["DateRangePicker", "date-range-picker", "Core", "Collects a bounded date range."],
  ["FileUpload", "file-upload", "Core", "Selects files using native input and drop-zone affordances."],
  ["UploadQueue", "upload-queue", "Core Pattern", "Tracks per-file upload progress and outcomes."],
  ["Stepper", "stepper", "Core Pattern", "Communicates progress through a multi-step workflow."],
  ["Accordion", "accordion", "Core", "Reveals sections within a grouped disclosure set."],
  ["ScrollArea", "scroll-area", "Core", "Enhances overflow only where native scrolling is insufficient."],
  ["Resizable", "resizable", "Core", "Supports adjustable adjacent panels when demonstrated by product need."],
  ["Panel", "panel", "Core", "Groups application content without implying Card semantics."],
  ["DescriptionList", "description-list", "Core", "Presents terms and corresponding values."],
  ["StructuredList", "structured-list", "Core", "Presents repeated structured records outside a table."],
  ["Stat", "stat", "Core", "Presents a labelled metric."],
  ["Timeline", "timeline", "Core", "Presents ordered activity or history."],
  ["MultiSelect", "multi-select", "Core", "Selects multiple values from a collection."],
  ["TagInput", "tag-input", "Core", "Edits a collection of tokenised values."],
  ["TimeField", "time-field", "Core", "Collects a structured time value."],
  ["TimePicker", "time-picker", "Core", "Selects a time with appropriate entry controls."],
  ["Tree", "tree", "Core", "Navigates hierarchical data."],
  ["Slider", "slider", "Core", "Selects a value or range on a bounded scale."],
  ["SegmentedControl", "segmented-control", "Core", "Selects one compact view or mode."],
  ["Toolbar", "toolbar", "Core Pattern", "Groups controls for a related work surface."],
  ["PageHeader", "page-header", "Core Pattern", "Composes page title, context and actions."],
  ["Result", "result", "Core Pattern", "Presents a durable workflow outcome."],
  ["FormGroup", "form-group", "Core", "Provides native grouped-field semantics."],
  ["ValidationSummary", "validation-summary", "Core Pattern", "Summarises form validation and links to affected fields."],
] as const;

export const componentManifest: ReadonlyArray<ComponentDefinition> = [
  ...implementedComponents.map(([name, slug, publication, classification, entry, purpose, contract, figma]) => ({ name, slug, lifecycle: "Implemented" as const, publication, classification, entry, purpose, contract, figma })),
  ...plannedComponents.map(([name, slug, classification, purpose]) => ({ name, slug, lifecycle: "Planned" as const, publication: "Unpublished" as const, classification, entry: null, purpose, contract: "No public API is defined. Implementation requires an approved component-family specification.", figma: "not-created" as const })),
];

export const availableComponentManifest = componentManifest.filter(
  (component) => component.lifecycle !== "Planned" && component.lifecycle !== "In progress" && component.publication !== "Unpublished",
);

export function getComponentDefinition(slug: string): ComponentDefinition | undefined {
  return componentManifest.find((component) => component.slug === slug);
}

export function getAvailableComponentDefinition(slug: string): ComponentDefinition | undefined {
  return availableComponentManifest.find((component) => component.slug === slug);
}
