"use client";

import {
  createContext,
  forwardRef,
  useContext,
  useEffect,
  useId,
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
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  type DropdownMenuItemProps,
} from "../DropdownMenu/DropdownMenu";
import { Icon } from "../Icon/Icon";
import "./ApplicationNavigation.css";

const NAVIGATION_MEDIA_QUERY = "(max-width: 740px)";

type NavigationContextValue = {
  isNarrow: boolean;
  navigationOpen: boolean;
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
  const isNarrow = useMediaQuery(NAVIGATION_MEDIA_QUERY);
  const open = navigationOpen ?? uncontrolledOpen ?? (isNarrow ? false : defaultNavigationOpen);
  const setOpen = (nextOpen: boolean) => {
    if (navigationOpen === undefined) setUncontrolledOpen(nextOpen);
    onNavigationOpenChange?.(nextOpen);
  };
  const context = { isNarrow, navigationOpen: open, setNavigationOpen: setOpen };

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
            <DialogPrimitive.Content className="ledger-app-shell__dialog" aria-describedby={undefined}>
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
  const { isNarrow, navigationOpen, setNavigationOpen } = useNavigationContext("WorkspaceHeader");
  const showNavigationButton = (
    <button
      className="ledger-navigation-control ledger-navigation-control--show"
      type="button"
      aria-label={showNavigationLabel}
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

export type SideNavHeaderProps = HTMLAttributes<HTMLDivElement> & { hideNavigationLabel?: string };

export function SideNavHeader({ children, className, hideNavigationLabel = "Hide navigation", ...props }: SideNavHeaderProps) {
  const { setNavigationOpen } = useNavigationContext("SideNavHeader");
  return (
    <div {...props} className={cn("ledger-side-nav__header", className)}>
      <div className="ledger-side-nav__header-content">{children}</div>
      <button className="ledger-navigation-control ledger-navigation-control--hide" type="button" aria-label={hideNavigationLabel} onClick={() => setNavigationOpen(false)}>
        <Icon name="chevron-left" size="medium" />
      </button>
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
    <section {...props} aria-labelledby={headingId} className={cn("ledger-side-nav-group", className)}>
      <h2 id={headingId} className="ledger-side-nav-group__heading">{label}</h2>
      <div className="ledger-side-nav-group__items">{children}</div>
    </section>
  );
}

export type OrganisationOption = Readonly<{ id: string; name: string; disabled?: boolean }>;
export type OrganisationSwitcherProps = {
  organisations: readonly OrganisationOption[];
  selectedId: string;
  onSelectedIdChange?: (id: string) => void;
  label?: string;
};

export function OrganisationSwitcher({ organisations, selectedId, onSelectedIdChange, label = "Switch organisation" }: OrganisationSwitcherProps) {
  const selected = organisations.find((organisation) => organisation.id === selectedId);
  if (!selected) throw new Error("OrganisationSwitcher selectedId must match an organisation.");
  if (organisations.length === 1) {
    return <div className="ledger-organisation-switcher ledger-organisation-switcher--static" title={selected.name}>{selected.name}</div>;
  }
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="ledger-organisation-switcher" aria-label={`${label}: ${selected.name}`} title={selected.name}>
        <span>{selected.name}</span><Icon name="chevron-down" size="small" />
      </DropdownMenuTrigger>
      <DropdownMenuContent className="ledger-navigation-menu" align="start">
          <DropdownMenuRadioGroup value={selectedId} onValueChange={onSelectedIdChange}>
            {organisations.map((organisation) => (
              <DropdownMenuRadioItem key={organisation.id} value={organisation.id} disabled={organisation.disabled} title={organisation.name}>{organisation.name}</DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export function getInitials(displayName: string) {
  return displayName.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => Array.from(part)[0]?.toLocaleUpperCase()).join("");
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
