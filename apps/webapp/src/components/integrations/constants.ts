import { Hammer } from "lucide-react";
import {
  siGmail,
  siNotion,
  siAirtable,
  siLinear,
  siGithub,
  siSupabase,
  siFigma,
  siGoogledrive,
  siGooglesheets,
  siJira,
} from "simple-icons";

import React from "react";

// Helper function to create React component from simple-icons
function createSimpleIcon(icon: any) {
  return ({ className, ...props }: { className?: string; [key: string]: any }) =>
    React.createElement(
      "svg",
      {
        role: "img",
        viewBox: "0 0 24 24",
        className,
        fill: "currentColor",
        ...props,
      },
      React.createElement("path", { d: icon.path })
    );
}

// Simple Icons components
const GmailIcon = createSimpleIcon(siGmail);
const NotionIcon = createSimpleIcon(siNotion);
const AirtableIcon = createSimpleIcon(siAirtable);
const LinearIcon = createSimpleIcon(siLinear);
const GitHubIcon = createSimpleIcon(siGithub);
const SupabaseIcon = createSimpleIcon(siSupabase);
const FigmaIcon = createSimpleIcon(siFigma);
const GoogleDriveIcon = createSimpleIcon(siGoogledrive);
const GoogleSheetsIcon = createSimpleIcon(siGooglesheets);
const JiraIcon = createSimpleIcon(siJira);

type IconComponent = React.ComponentType<{ className?: string; [key: string]: any }>;

/**
 * Mapping from integration toolkit slugs to icons.
 * Keys should be lowercase slugs.
 */
export const INTEGRATION_ICON_BY_SLUG: Readonly<Record<string, IconComponent>> = Object.freeze({
  // Current integrations from backend
  gmail: GmailIcon,
  googledrive: GoogleDriveIcon,
  linear: LinearIcon,
  googlesheets: GoogleSheetsIcon,
  notion: NotionIcon,
  
  // Additional brand icons for future integrations
  airtable: AirtableIcon,
  github: GitHubIcon,
  supabase: SupabaseIcon,
  figma: FigmaIcon,
  jira: JiraIcon,
  
  // Keep weather as Lucide since it's not a brand icon
  weather: Hammer, // Could be replaced with a weather icon from simple-icons if needed
});

/**
 * Returns an icon component for the given toolkit slug.
 * Falls back to Hammer if unknown or undefined.
 */
export function getIntegrationIcon(slug?: string): IconComponent {
  if (!slug) return Hammer;
  const key = slug.toLowerCase();
  return INTEGRATION_ICON_BY_SLUG[key] ?? Hammer;
}