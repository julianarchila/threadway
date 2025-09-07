export const SUPPORTED_TOOLKITS = [
  'GMAIL' as const,
  'LINEAR' as const,
  "GOOGLESHEETS" as const,
];

type TOOLKIT_NAME = typeof SUPPORTED_TOOLKITS[number];

export const TOOLKIT_AUTH_CONFIG = new Map<TOOLKIT_NAME , string>([
  ["GMAIL", "ac_BuYuRGWQBTA5"],
  ["LINEAR", "ac_OdwEAmPZscbX"],
  ["GOOGLESHEETS", "ac_q7BfgJYBQERZ"]
])
