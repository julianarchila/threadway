import type { LucideIcon } from "lucide-react";
import {
  Mail,
  FileText,
  Database,
  Hammer,
  GitBranch,
  Github,
  HardDrive,
  Figma,
  SunMoon,
  SheetIcon,
} from "lucide-react";

/**
 * Mapping from integration toolkit slugs to icons.
 * Keys should be lowercase slugs.
 */
export const INTEGRATION_ICON_BY_SLUG: Readonly<Record<string, LucideIcon>> = Object.freeze({
  gmail: Mail,
  notion: FileText,
  airtable: Database,
  linear: GitBranch,
  github: Github,
  supabase: Database,
  figma: Figma,
  weather: SunMoon,
  jira: HardDrive,
  googlesheets: SheetIcon,
});

/**
 * Returns an icon component for the given toolkit slug.
 * Falls back to Hammer if unknown or undefined.
 */
export function getIntegrationIcon(slug?: string): LucideIcon {
  if (!slug) return Hammer;
  const key = slug.toLowerCase();
  return INTEGRATION_ICON_BY_SLUG[key] ?? Hammer;
}