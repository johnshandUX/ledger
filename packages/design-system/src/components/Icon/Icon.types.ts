import type { SVGProps } from "react";
import type { IconName } from "./icons";

export type IconSize = "small" | "medium" | "large";

export type IconProps = Omit<
  SVGProps<SVGSVGElement>,
  "children" | "color" | "fill" | "height" | "stroke" | "strokeWidth" | "width"
> & {
  name: IconName;
  size?: IconSize;
  "aria-label"?: string;
};

export type LedgerIconProps = Omit<IconProps, "name">;
