import { Puzzle } from "lucide-react";
import React from "react";
import { cn } from "@/lib/utils";
import {
  SiGmail,
  SiNotion,
  SiAirtable,
  SiLinear,
  SiGithub,
  SiSupabase,
  SiFigma,
  SiGoogledrive,
  SiGooglesheets,
  SiJira,
} from "@icons-pack/react-simple-icons";

export type IconProps = { className?: string; size?: number; title?: string } & Record<string, any>;
type IconComponent = React.ComponentType<IconProps>;

function wrapIcon(
  Icon: React.ComponentType<IconProps>,
  opts?: { darkBrand?: boolean }
): IconComponent {
  const isDarkBrand = opts?.darkBrand === true;
  return ({ className, size = 24, title, ...rest }: IconProps) => (
    <Icon
      title={title}
      size={size}
      className={cn(isDarkBrand ? "text-black dark:text-white" : undefined, className)}
      color={isDarkBrand ? undefined : "default"}
      {...rest}
    />
  );
}

const GmailIcon = wrapIcon(SiGmail);
const NotionIcon = wrapIcon(SiNotion, { darkBrand: true });
const AirtableIcon = wrapIcon(SiAirtable);
const LinearIcon = wrapIcon(SiLinear);
const GitHubIcon = wrapIcon(SiGithub, { darkBrand: true });
const SupabaseIcon = wrapIcon(SiSupabase);
const FigmaIcon = wrapIcon(SiFigma);
const GoogleDriveIcon = wrapIcon(SiGoogledrive);
const GoogleSheetsIcon = wrapIcon(SiGooglesheets);
const JiraIcon = wrapIcon(SiJira);

export const INTEGRATION_ICON_BY_SLUG: Readonly<Record<string, IconComponent>> = Object.freeze({
  gmail: GmailIcon,
  googledrive: GoogleDriveIcon,
  linear: LinearIcon,
  googlesheets: GoogleSheetsIcon,
  notion: NotionIcon,
  airtable: AirtableIcon,
  github: GitHubIcon,
  supabase: SupabaseIcon,
  figma: FigmaIcon,
  jira: JiraIcon,
  weather: Puzzle,
});

export function getIntegrationIcon(slug?: string): IconComponent {
  if (!slug) return Puzzle;
  const key = slug.toLowerCase();
  return INTEGRATION_ICON_BY_SLUG[key] ?? Puzzle;
}


