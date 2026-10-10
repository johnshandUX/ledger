# Application Navigation

## Purpose

Application Navigation is a design-system pattern for complex product shells. It combines `AppShell`, `WorkspaceHeader`, `AppWorkspace`, `SideNav`, navigation destinations and groups, organisation context, and personal context. The design system owns layout, interaction, responsive modal behaviour, focus management and presentation. The consuming product owns information architecture, routes, permissions, active-state resolution and business data.

**Products configure navigation content and context. The design system governs navigation appearance and interaction.**

## Architectural layers

### Component

The individual public components own their specific UI contract: semantic markup, presentation, keyboard and pointer interaction, accessibility, layout behavior, responsive behavior, and Ledger token use. They do not contain product destinations, routes, permissions, or domain data.

### Pattern

Application Navigation is the reusable arrangement of those components: product identity and the hide control in `SideNavHeader`; organisation or workspace context in `SideNavContext`; configured destination groups in `SideNavNavigation`; secondary destinations in `SideNavUtility`; personal identity in `SideNavUser`; and product content in `WorkspaceHeader` and `AppWorkspace`.

Navigation destinations and groups are well suited to application-owned typed configuration. Contextual regions remain composed React content because organisations, user actions, and header content vary by product. No additional public configuration renderer is required: applications map their resolved configuration to `SideNavGroup` and `SideNavItem` after applying routes, permissions, and feature availability.

### Product implementation

A product supplies its identity, typed navigation configuration, group labels, active destination, routes, permission-filtered availability, organisation context, user data, utility destinations, and workspace content. Ledger Bank, an accounting product, or another enterprise application can therefore use the same pattern without adding domain-specific component props.

## Anatomy and public API

- `AppShell` composes `navigation` with workspace children and supports controlled or uncontrolled open state.
- `WorkspaceHeader` provides the stable 56px header region and automatically exposes the show-navigation control when navigation is closed.
- `AppWorkspace` is the scrollable main work region.
- `SideNav` contains `SideNavHeader`, optional `SideNavContext`, `SideNavNavigation`, optional `SideNavUtility`, and `SideNavUser`.
- `SideNavItem` is a semantic anchor. `current` applies `aria-current="page"` and a non-colour active marker. `asChild` allows a framework link that ultimately renders an anchor to receive the same contract.
- `SideNavGroup` creates a section with an optional non-interactive heading. Omit `label` only for the initial primary destination group; the component then renders no heading or heading gap.
- `OrganisationSwitcher` accepts presentation-ready organisation options and a selected identifier.
- `UserMenu` derives initials from `displayName`, uses an optional avatar image, and renders consumer-supplied `UserMenuItem` actions.

`AppShell` accepts `navigationOpen`, `defaultNavigationOpen`, and `onNavigationOpenChange`. Products may control the state when another product concern must observe it; otherwise the shell owns it locally. It does not inspect routes or permissions.

## Behaviour

At widths above 740px, open navigation participates in the grid and occupies four `--ledger-space-9` units (256px, close to the specified 248px target while remaining token-derived). Closed navigation remains mounted for the restrained transition but is removed from layout and interaction with a zero-width column, hidden visibility, `aria-hidden`, and `inert`; the workspace recovers the column. There is no icon rail.

The closed state deliberately has no icon-only rail, narrow sidebar, reserved gutter, or persistent destination icons. Enterprise finance destinations often have similar or ambiguous iconography, so an icon rail would reduce clarity while continuing to consume workspace needed for tables, reporting, and operational tasks.

When closed, `WorkspaceHeader` renders one compact, floating-style menu control at the top-left of the workspace. It is structurally owned by `AppShell` through the header rather than positioned independently by each page. Its accessible name is “Show navigation”; the header layout keeps it beside, rather than over, product-supplied title content. When navigation is open, this control is absent and the hide control remains in `SideNavHeader`.

At 740px and below, navigation opens as a modal overlay. Radix Dialog provides Escape dismissal, focus trapping, outside-content inertness and focus return. Selecting a `SideNavItem` closes the overlay unless the link event is cancelled. Navigation destinations scroll independently while the header, organisation and user regions remain pinned. Motion is removed under `prefers-reduced-motion`.

The 740px threshold follows the existing Ledger Bank shell convention. Ledger has no shared breakpoint-token foundation, so this remains a local pattern decision rather than a new global breakpoint token.

## Density and grouping

Application navigation follows “compact within a group; visibly separated between groups.” Desktop destinations use a token-derived 36px row with 16px body text and a 4px gap between sibling destinations. Labelled groups have 24px separation, with 8px between a heading and its first destination. Headings use Ledger's 12px small type and tertiary text colour so they read as quiet structural metadata rather than interactive destinations. At 740px and below, destination rows return to a 40px minimum for comfortable overlay interaction.

The initial primary destinations may be an unlabelled `SideNavGroup`, so they follow organisation context directly. Later domain groups should use meaningful headings; omit headings only when a hierarchy has not earned one. `WorkspaceHeader` and `SideNavHeader` are both 56px border-box rows and expect compact, single-line identity or title content.

Destination hover uses the semantic elevated surface against the subtle navigation background. This remains subordinate to the selected surface while staying distinguishable in both light and dark appearances.

## Accessibility

Use `SideNavNavigation` to provide a named `nav`. Use anchors with real `href` values for destinations. Supply `current` only for the resolved current page. Organisation and user menus use the recognised menu interaction pattern; the sidebar itself retains normal document-order keyboard navigation rather than application-style arrow keys. Long names are visually truncated and preserved through `title` and accessible trigger names. Focus outlines sit outside items, with navigation padding and stable scrollbar space preventing clipping.

## Usage guidance

Resolve routes, permissions and product-specific group labels before rendering this pattern. Keep organisation switching separate from personal preferences. Put frequent work in primary navigation and administration or configuration in secondary utility content.

Do not pass raw domain users or businesses into these components, make the component infer permissions, create decorative destination icons, create groups for visual symmetry, or turn `WorkspaceHeader` into a speculative global toolbar.

## Navigation principles

1. **Workspace over navigation.** Navigation should not permanently consume space when the primary task materially benefits from additional workspace.
2. **Text over ambiguous icons.** Icons are used where recognition is strong, not automatically beside every navigation destination.
3. **Domains over features.** Primary navigation represents meaningful product domains rather than every capability.
4. **Objects do not automatically become destinations.** Important data objects do not automatically require global navigation.
5. **Capabilities can cross domains.** Approvals, reconciliation, automation, notifications and similar capabilities can appear contextually.
6. **Context before configuration.** Frequent product work remains prominent while administration and configuration are secondary.
7. **Organisation and person are separate contexts.** Organisation switching and personal identity/preferences remain conceptually distinct.
8. **Navigation groups must earn their hierarchy.** Do not create headings merely to make navigation visually symmetrical.

## Related components

Application Navigation reuses Ledger `Avatar` and `Icon` presentation and the installed Radix menu/dialog behaviour. It is distinct from `Sheet`, which remains supporting content rather than primary application navigation, and from product-owned page headers or routing adapters.
