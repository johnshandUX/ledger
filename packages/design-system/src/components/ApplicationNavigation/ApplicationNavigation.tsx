"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
  useRef,
  useState,
  type AnchorHTMLAttributes,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { Dialog as DialogPrimitive, Slot } from "radix-ui";
import { cn } from "#lib/utils";
import { Avatar } from "../Avatar/Avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  type DropdownMenuItemProps,
} from "../DropdownMenu/DropdownMenu";
import { Icon } from "../Icon/Icon";
import { Popover, PopoverContent, PopoverTrigger } from "../Popover/Popover";
import "./ApplicationNavigation.css";

const NAVIGATION_MEDIA_QUERY = "(max-width: 740px)";

type NavigationContextValue = {
  isNarrow: boolean;
  navigationOpen: boolean;
  setNavigationOpenedFromKeyboard: (openedFromKeyboard: boolean) => void;
  setNavigationOpen: (open: boolean) => void;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

function useNavigationContext(component: string) {
  const context = useContext(NavigationContext);
  if (!context) throw new Error(`${component} must be used within AppShell.`);
  return context;
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);
  return matches;
}

export type AppShellProps = Omit<HTMLAttributes<HTMLDivElement>, "children"> & {
  children: ReactNode;
  navigation: ReactNode;
  navigationOpen?: boolean;
  defaultNavigationOpen?: boolean;
  onNavigationOpenChange?: (open: boolean) => void;
  navigationLabel?: string;
};

export function AppShell({
  children,
  className,
  defaultNavigationOpen = true,
  navigation,
  navigationLabel = "Application navigation",
  navigationOpen,
  onNavigationOpenChange,
  ...props
}: AppShellProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState<boolean>();
  const navigationDialogRef = useRef<HTMLDivElement>(null);
  const navigationOpenedFromKeyboardRef = useRef(false);
  const isNarrow = useMediaQuery(NAVIGATION_MEDIA_QUERY);
  const open = navigationOpen ?? uncontrolledOpen ?? (isNarrow ? false : defaultNavigationOpen);
  const setOpen = (nextOpen: boolean) => {
    if (navigationOpen === undefined) setUncontrolledOpen(nextOpen);
    onNavigationOpenChange?.(nextOpen);
  };
  const context = {
    isNarrow,
    navigationOpen: open,
    setNavigationOpenedFromKeyboard: (openedFromKeyboard: boolean) => {
      navigationOpenedFromKeyboardRef.current = openedFromKeyboard;
    },
    setNavigationOpen: setOpen,
  };

  return (
    <NavigationContext.Provider value={context}>
      <DialogPrimitive.Root open={isNarrow && open} onOpenChange={setOpen} modal>
        <div
          {...props}
          className={cn("ledger-app-shell", className)}
          data-navigation-open={open ? "true" : "false"}
          data-navigation-mode={isNarrow ? "overlay" : "inline"}
        >
          {!isNarrow ? <div className="ledger-app-shell__navigation" aria-hidden={!open} inert={!open ? true : undefined}>{navigation}</div> : null}
          <div className="ledger-app-shell__main">{children}</div>
        </div>
        {isNarrow ? (
          <DialogPrimitive.Portal>
            <DialogPrimitive.Overlay className="ledger-app-shell__overlay" />
            <DialogPrimitive.Content
              ref={navigationDialogRef}
              className="ledger-app-shell__dialog"
              aria-describedby={undefined}
              tabIndex={-1}
              onOpenAutoFocus={(event) => {
                event.preventDefault();
                const focusTarget = navigationOpenedFromKeyboardRef.current
                  ? navigationDialogRef.current?.querySelector<HTMLButtonElement>(".ledger-organisation-switcher")
                  : navigationDialogRef.current;
                focusTarget?.focus({ preventScroll: true });
              }}
            >
              <DialogPrimitive.Title className="ledger-app-shell__dialog-title">
                {navigationLabel}
              </DialogPrimitive.Title>
              {navigation}
            </DialogPrimitive.Content>
          </DialogPrimitive.Portal>
        ) : null}
      </DialogPrimitive.Root>
    </NavigationContext.Provider>
  );
}

export type WorkspaceHeaderProps = HTMLAttributes<HTMLElement> & {
  children?: ReactNode;
  showNavigationLabel?: string;
};

export function WorkspaceHeader({ children, className, showNavigationLabel = "Show navigation", ...props }: WorkspaceHeaderProps) {
  const { isNarrow, navigationOpen, setNavigationOpenedFromKeyboard, setNavigationOpen } = useNavigationContext("WorkspaceHeader");
  const showNavigationButton = (
    <button
      className="ledger-navigation-control ledger-navigation-control--show"
      type="button"
      aria-label={showNavigationLabel}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") setNavigationOpenedFromKeyboard(true);
      }}
      onPointerDown={() => setNavigationOpenedFromKeyboard(false)}
      onClick={isNarrow ? undefined : () => setNavigationOpen(true)}
    >
      <Icon name="menu" size="medium" />
    </button>
  );
  return (
    <header {...props} className={cn("ledger-workspace-header", className)}>
      {!navigationOpen ? (isNarrow ? <DialogPrimitive.Trigger asChild>{showNavigationButton}</DialogPrimitive.Trigger> : showNavigationButton) : null}
      <div className="ledger-workspace-header__content">{children}</div>
    </header>
  );
}

export function AppWorkspace({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <main {...props} className={cn("ledger-app-workspace", className)} />;
}

export function SideNav({ className, ...props }: HTMLAttributes<HTMLElement>) {
  return <aside {...props} className={cn("ledger-side-nav", className)} />;
}

export type SideNavHeaderProps = HTMLAttributes<HTMLDivElement> & { closeNavigationLabel?: string };

export function SideNavHeader({ children, className, closeNavigationLabel = "Close navigation", ...props }: SideNavHeaderProps) {
  const { isNarrow, setNavigationOpen } = useNavigationContext("SideNavHeader");
  return (
    <div {...props} className={cn("ledger-side-nav__header", className)}>
      <div className="ledger-side-nav__header-content">{children}</div>
      {!isNarrow ? (
        <button className="ledger-navigation-control ledger-navigation-control--hide" type="button" aria-label={closeNavigationLabel} onClick={() => setNavigationOpen(false)}>
          <Icon name="chevron-left" size="medium" />
        </button>
      ) : null}
    </div>
  );
}

export function SideNavContext({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("ledger-side-nav__context", className)} />;
}

export type SideNavNavigationProps = HTMLAttributes<HTMLElement> & { label?: string };
export function SideNavNavigation({ className, label = "Primary", ...props }: SideNavNavigationProps) {
  return <nav {...props} aria-label={label} className={cn("ledger-side-nav__navigation", className)} />;
}

export function SideNavUtility({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("ledger-side-nav__utility", className)} />;
}

export function SideNavUser({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div {...props} className={cn("ledger-side-nav__user", className)} />;
}

export type SideNavItemProps = AnchorHTMLAttributes<HTMLAnchorElement> & { asChild?: boolean; current?: boolean };
export const SideNavItem = forwardRef<HTMLAnchorElement, SideNavItemProps>(function SideNavItem(
  { asChild = false, children, className, current = false, onClick, ...props },
  ref,
) {
  const { isNarrow, setNavigationOpen } = useNavigationContext("SideNavItem");
  const Component = asChild ? Slot.Root : "a";
  return (
    <Component
      {...props}
      ref={ref}
      aria-current={current ? "page" : undefined}
      className={cn("ledger-side-nav-item", className)}
      data-current={current ? "true" : undefined}
      onClick={(event) => {
        onClick?.(event);
        if (!event.defaultPrevented && isNarrow) setNavigationOpen(false);
      }}
    >
      {children}
    </Component>
  );
});

export type SideNavGroupProps = HTMLAttributes<HTMLDivElement> & { label?: ReactNode };
export function SideNavGroup({ children, className, label, ...props }: SideNavGroupProps) {
  const headingId = useId();
  if (label === undefined) {
    return <div {...props} className={cn("ledger-side-nav-group", className)}><div className="ledger-side-nav-group__items">{children}</div></div>;
  }
  return (
    <section {...props} aria-labelledby={headingId} className={cn("ledger-side-nav-group", "ledger-side-nav-group--labelled", className)}>
      <h2 id={headingId} className="ledger-side-nav-group__heading">{label}</h2>
      <div className="ledger-side-nav-group__items">{children}</div>
    </section>
  );
}

export type OrganisationOption = Readonly<{
  id: string;
  name: string;
  secondaryLabel?: string;
  disabled?: boolean;
}>;
export type OrganisationSwitcherProps = {
  organisations: readonly OrganisationOption[];
  selectedId: string;
  onSelectedIdChange?: (id: string) => void;
  label?: string;
  currentOrganisationLabel?: string;
  showSelectedSecondaryLabel?: boolean;
  defaultOpen?: boolean;
  settingsAction?: ReactNode;
  addOrganisationAction?: Readonly<{
    label?: string;
    disabled?: boolean;
    onClick?: () => void;
  }>;
};

type OrganisationSwitcherTriggerProps = {
  label: string;
  open: boolean;
  selected: OrganisationOption;
  showSecondaryLabel: boolean;
};

export function getOrganisationMonogram(organisationName: string) {
  return (Array.from(organisationName.trim())[0] ?? "").toLocaleUpperCase();
}

function OrganisationSwitcherTrigger({
  label,
  open,
  selected,
  showSecondaryLabel,
}: OrganisationSwitcherTriggerProps) {
  const monogram = getOrganisationMonogram(selected.name);
  return (
    <PopoverTrigger
      className="ledger-organisation-switcher"
      type="button"
      aria-label={`${label}: ${selected.name}`}
      title={selected.name}
    >
      <Avatar className="ledger-organisation-switcher__monogram" src="" alt="" fallback={monogram} size="medium" />
      <span className="ledger-organisation-switcher__identity">
        <span className="ledger-organisation-switcher__primary">
          <span className="ledger-organisation-switcher__name">{selected.name}</span>
          <Icon name="chevron-down" size="small" className="ledger-organisation-switcher__chevron" data-open={open ? "true" : undefined} />
        </span>
        {showSecondaryLabel && selected.secondaryLabel ? <span className="ledger-organisation-switcher__secondary">{selected.secondaryLabel}</span> : null}
      </span>
    </PopoverTrigger>
  );
}

function OrganisationSwitcherOptions({ addOrganisationAction, currentOrganisationLabel, groupName, onSelect, organisations, selectedId, settingsAction }: Pick<OrganisationSwitcherProps, "addOrganisationAction" | "currentOrganisationLabel" | "organisations" | "selectedId" | "settingsAction"> & { groupName: string; onSelect: (id: string) => void }) {
  return (
    <div className="ledger-organisation-switcher__content">
      <div className="ledger-organisation-switcher__options" role="radiogroup" aria-label="Available organisations">
        {organisations.map((organisation) => {
          const selected = organisation.id === selectedId;
          return (
            <label
              key={organisation.id}
              className="ledger-organisation-option"
              data-selected={selected ? "true" : undefined}
              data-disabled={organisation.disabled ? "true" : undefined}
              title={organisation.name}
              onClick={() => {
                if (selected && !organisation.disabled) onSelect(organisation.id);
              }}
            >
              <input
                className="ledger-organisation-option__input"
                type="radio"
                name={groupName}
                value={organisation.id}
                checked={selected}
                disabled={organisation.disabled}
                onChange={() => {
                  if (!selected) onSelect(organisation.id);
                }}
              />
              <Avatar
                className="ledger-organisation-option__monogram"
                src=""
                alt=""
                fallback={getOrganisationMonogram(organisation.name)}
                size="medium"
              />
              <span className="ledger-organisation-option__identity">
                <span className="ledger-organisation-option__name">{organisation.name}</span>
                {organisation.secondaryLabel ? <span className="ledger-organisation-option__secondary">{organisation.secondaryLabel}</span> : null}
                {selected ? <span className="ledger-organisation-option__selected-label">{currentOrganisationLabel}</span> : null}
              </span>
              {selected ? <Icon name="check" size="small" className="ledger-organisation-option__check" /> : null}
            </label>
          );
        })}
      </div>
      {settingsAction ? <div className="ledger-organisation-switcher__settings">{settingsAction}</div> : null}
      {addOrganisationAction ? (
        <div className="ledger-organisation-switcher__footer">
          <button
            className="ledger-organisation-switcher__add"
            type="button"
            disabled={addOrganisationAction.disabled}
            onClick={addOrganisationAction.onClick}
          >
            <Icon name="add" size="small" />
            <span>{addOrganisationAction.label ?? "Add organisation"}</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}

export function OrganisationSwitcher({
  organisations,
  selectedId,
  onSelectedIdChange,
  label = "Switch organisation",
  currentOrganisationLabel = "Current organisation",
  showSelectedSecondaryLabel = true,
  defaultOpen = false,
  settingsAction,
  addOrganisationAction,
}: OrganisationSwitcherProps) {
  const navigationContext = useContext(NavigationContext);
  const viewportIsNarrow = useMediaQuery(NAVIGATION_MEDIA_QUERY);
  const isNarrow = navigationContext?.isNarrow ?? viewportIsNarrow;
  const groupName = useId();
  const [open, setOpen] = useState(defaultOpen);
  const selected = organisations.find((organisation) => organisation.id === selectedId);
  if (!selected) throw new Error("OrganisationSwitcher selectedId must match an organisation.");
  const handleSelect = (id: string) => {
    const changed = id !== selectedId;
    if (changed) onSelectedIdChange?.(id);
    setOpen(false);
    if (changed && isNarrow) navigationContext?.setNavigationOpen(false);
  };
  const options = <OrganisationSwitcherOptions addOrganisationAction={addOrganisationAction} currentOrganisationLabel={currentOrganisationLabel} groupName={groupName} onSelect={handleSelect} organisations={organisations} selectedId={selectedId} settingsAction={settingsAction} />;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <OrganisationSwitcherTrigger label={label} open={open} selected={selected} showSecondaryLabel={showSelectedSecondaryLabel} />
      <PopoverContent accessibleLabel={label} align="start" side="bottom" className="ledger-organisation-switcher__popover">
        <h2 className="ledger-organisation-switcher__heading">{label}</h2>
        {options}
      </PopoverContent>
    </Popover>
  );
}

export function getInitials(displayName: string) {
  const nameParts = displayName.trim().split(/\s+/).filter(Boolean);
  const initialParts = nameParts.length > 1 ? [nameParts[0], nameParts.at(-1)] : nameParts;
  return initialParts.map((part) => Array.from(part ?? "")[0]?.toLocaleUpperCase()).join("");
}

export type UserMenuProps = {
  displayName: string;
  secondaryText?: string;
  avatarSrc?: string;
  children: ReactNode;
  label?: string;
};

export function UserMenu({ avatarSrc, children, displayName, label = "Open user menu", secondaryText }: UserMenuProps) {
  const initials = getInitials(displayName);
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ledger-user-menu" aria-label={`${label} for ${displayName}`}>
        <Avatar src={avatarSrc ?? ""} alt="" fallback={initials} size="medium" />
        <span className="ledger-user-menu__identity">
          <span className="ledger-user-menu__name" title={displayName}>{displayName}</span>
          {secondaryText ? <span className="ledger-user-menu__secondary" title={secondaryText}>{secondaryText}</span> : null}
        </span>
        <Icon name="chevron-down" size="small" />
      </DropdownMenuTrigger>
        <DropdownMenuContent className="ledger-navigation-menu" align="start">
          {children}
        </DropdownMenuContent>
    </DropdownMenu>
  );
}

export type UserMenuItemProps = DropdownMenuItemProps;
export function UserMenuItem({ className, intent = "default", ...props }: UserMenuItemProps) {
  return <DropdownMenuItem {...props} className={className} intent={intent} />;
}
