// Using Map for configured connections
export const configuredConnections = new Map<string, { authConfigId: string }>([
  ["gmail", {
    authConfigId: "ac_BuYuRGWQBTA5",
  }],
  ["linear", {
    authConfigId: "ac_OdwEAmPZscbX",
  }],
]);


// export const TOOLKIT_AUTH_CONFIG = new Map<string, string>([
//   ["GMAIL", "ac_BuYuRGWQBTA5"],
//   ["LINEAR", "ac_OdwEAmPZscbX"],
// ])
export const SUPPORTED_TOOLKITS = [
  'GMAIL' as const,
  'LINEAR' as const,
];

type TOOLKIT_NAME = typeof SUPPORTED_TOOLKITS[number];

type TOOL_AUTH_CONFIG = {
  name: TOOLKIT_NAME;
  authConfigId: string;
}



// export const TOOLKIT_AUTH_CONFIG: TOOL_AUTH_CONFIG[] = [
//   {
//     name: "GMAIL",
//     authConfigId: "ac_BuYuRGWQBTA5",
//   },
//   {
//     name: "GMAIL",
//     authConfigId: "ac_OdwEAmPZscbX",
//   },
// ]

export const TOOLKIT_AUTH_CONFIG = new Map<TOOLKIT_NAME , string>([
  ["GMAIL", "ac_BuYuRGWQBTA5"],
  ["LINEAR", "ac_OdwEAmPZscbX"],
])
