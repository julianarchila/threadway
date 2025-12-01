/**
 * Types for Kapso Platform API
 * Based on: https://docs.kapso.ai
 */

export type ConnectionType = "coexistence" | "dedicated";

export interface KapsoCustomer {
  id: string;
  name: string;
  external_customer_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SetupLinkThemeConfig {
  primary_color?: string;
  background_color?: string;
  text_color?: string;
  muted_text_color?: string;
  card_color?: string;
  border_color?: string;
}

export interface SetupLinkConfig {
  success_redirect_url?: string;
  failure_redirect_url?: string;
  allowed_connection_types?: ConnectionType[];
  provision_phone_number?: boolean;
  phone_number_country_isos?: string[];
  theme_config?: SetupLinkThemeConfig;
}

export interface SetupLink {
  id: string;
  url: string;
  expires_at: string;
  created_at: string;
}

export interface CreateCustomerRequest {
  customer: {
    name: string;
    external_customer_id?: string;
  };
}

export interface CreateCustomerResponse {
  data: KapsoCustomer;
}

export interface CreateSetupLinkRequest {
  setup_link: SetupLinkConfig;
}

export interface CreateSetupLinkResponse {
  data: SetupLink;
}

export interface WhatsAppConnectionStatus {
  customer_id: string;
  phone_number_id?: string;
  phone_number?: string;
  connection_type?: ConnectionType;
  is_connected: boolean;
  connected_at?: string;
}
