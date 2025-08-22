import type { Integration } from "@/components/integration-card";

/**
 * Mock data for available integrations
 */
export const mockIntegrations: Integration[] = [
  {
    id: "weather-mcp",
    name: "Clima",
    description: "Conoce el clima de la ciudad que quiereas, con tan solo el nombre.",
    icon: "cloud-sun",
    isActive: true,
  },
  {
    id: "github",
    name: "Github",
    description: "Sincroniza repositorios y gestiona pull requests automáticamente",
    icon: "github",
    isActive: false,
  },
];
