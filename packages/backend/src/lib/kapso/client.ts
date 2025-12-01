/**
 * Kapso Platform API Client
 * Handles customer creation, setup links, and WhatsApp connection management
 */

import type {
  CreateCustomerRequest,
  CreateCustomerResponse,
  CreateSetupLinkRequest,
  CreateSetupLinkResponse,
  WhatsAppConnectionStatus,
} from "./types";

const KAPSO_API_KEY = process.env.KAPSO_API_KEY;
const KAPSO_PLATFORM_API_URL = "https://api.kapso.ai/platform/v1";

if (!KAPSO_API_KEY) {
  throw new Error("KAPSO_API_KEY environment variable is required");
}

const headers = {
  "X-API-Key": KAPSO_API_KEY,
  "Content-Type": "application/json",
};

/**
 * Create a new customer in Kapso Platform
 */
export async function createCustomer(
  name: string,
  externalCustomerId?: string
): Promise<CreateCustomerResponse> {
  const body: CreateCustomerRequest = {
    customer: {
      name,
      external_customer_id: externalCustomerId,
    },
  };

  const response = await fetch(`${KAPSO_PLATFORM_API_URL}/customers`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create Kapso customer: ${error}`);
  }

  return response.json();
}

/**
 * Create a setup link for WhatsApp connection
 */
export async function createSetupLink(
  customerId: string,
  config: CreateSetupLinkRequest["setup_link"]
): Promise<CreateSetupLinkResponse> {
  const body: CreateSetupLinkRequest = {
    setup_link: config,
  };

  const response = await fetch(
    `${KAPSO_PLATFORM_API_URL}/customers/${customerId}/setup_links`,
    {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to create setup link: ${error}`);
  }

  return response.json();
}

/**
 * List all setup links for a customer
 */
export async function listSetupLinks(customerId: string): Promise<any> {
  const response = await fetch(
    `${KAPSO_PLATFORM_API_URL}/customers/${customerId}/setup_links`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to list setup links: ${error}`);
  }

  return response.json();
}

/**
 * Get customer details
 */
export async function getCustomer(customerId: string): Promise<any> {
  const response = await fetch(
    `${KAPSO_PLATFORM_API_URL}/customers/${customerId}`,
    {
      method: "GET",
      headers,
    }
  );

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get customer: ${error}`);
  }

  return response.json();
}

/**
 * Check if a customer has connected their WhatsApp
 * Note: This is a placeholder. Actual implementation depends on Kapso's webhook/callback
 */
export async function getWhatsAppConnectionStatus(
  customerId: string
): Promise<WhatsAppConnectionStatus> {
  // This would typically be implemented via webhooks
  // For now, we'll check if the customer exists
  try {
    const customer = await getCustomer(customerId);
    return {
      customer_id: customerId,
      is_connected: false, // Update this based on webhook data
    };
  } catch (error) {
    throw new Error(`Failed to get connection status: ${error}`);
  }
}
