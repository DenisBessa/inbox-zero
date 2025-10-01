import type { McpIntegrationConfig } from "@inboxzero/mcp";

export const MCP_INTEGRATIONS: Record<
  string,
  McpIntegrationConfig & {
    displayName: string;
    allowedTools?: string[];
    comingSoon?: boolean;
  }
> = {
  notion: {
    name: "notion",
    displayName: "Notion",
    serverUrl: "https://mcp.notion.com/mcp",
    authType: "oauth",
    scopes: ["read"],
    allowedTools: ["notion-search", "notion-fetch"],
    oauthConfig: {
      authorization_endpoint: "https://mcp.notion.com/authorize",
      token_endpoint: "https://mcp.notion.com/token",
      registration_endpoint: "https://mcp.notion.com/register",
    },
  },
  stripe: {
    name: "stripe",
    displayName: "Stripe",
    serverUrl: "https://mcp.stripe.com",
    authType: "oauth", // must request whitelisting of /api/mcp/stripe/callback from Stripe. localhost is whitelisted already.
    // authType: "api-token", // alternatively, use an API token.
    scopes: [],
    allowedTools: [
      "list_customers",
      "list_disputes",
      "list_invoices",
      "list_payment_intents",
      "list_prices",
      "list_products",
      "list_subscriptions",
      // "search_stripe_resources",
    ],
    oauthConfig: {
      authorization_endpoint:
        "https://marketplace.stripe.com/oauth/v2/authorize",
      token_endpoint: "https://marketplace.stripe.com/oauth/v2/token",
      registration_endpoint:
        "https://marketplace.stripe.com/oauth/v2/register/tailorapp%2AAZfBZ6Q69QAAADJI%23EhcKFWFjY3RfMVJlaTA0QUo4QktoWGxzQw",
    },
  },
  monday: {
    name: "monday",
    displayName: "Monday.com",
    serverUrl: "https://mcp.monday.com",
    authType: "oauth",
    scopes: ["read", "write"],
    allowedTools: [
      "get_board_items_by_name",
      // "create_item",
      // "create_update",
      // "get_board_activity",
      "get_board_info",
      "list_users_and_teams",
      // "create_board",
      // "create_form",
      // "update_form",
      // "get_form",
      // "form_questions_editor",
      // "create_column",
      // "create_group",
      // "all_monday_api",
      // "get_graphql_schema",
      // "get_column_type_info",
      // "get_type_details",
      // "read_docs",
      "workspace_info",
      "list_workspaces",
      // "create_doc",
      // "update_workspace",
      // "update_folder",
      // "create_workspace",
      // "create_folder",
      // "move_object",
      // "create_dashboard",
      // "all_widgets_schema",
      // "create_widget",
    ],
    oauthConfig: {
      authorization_endpoint: "https://mcp.monday.com/authorize",
      token_endpoint: "https://mcp.monday.com/token",
      registration_endpoint: "https://mcp.monday.com/register",
    },
    comingSoon: true,
  },
  hubspot: {
    name: "hubspot",
    displayName: "HubSpot",
    serverUrl: "https://mcp.hubspot.com/",
    authType: "oauth",
    scopes: [
      // "crm.objects.contacts.read",
      // "crm.objects.companies.read",
      // "crm.objects.deals.read",
      // "crm.objects.carts.read",
      // "crm.objects.products.read",
      // "crm.objects.orders.read",
      // "crm.objects.line_items.read",
      // "crm.objects.invoices.read",
      // "crm.objects.quotes.read",
      // "crm.objects.subscriptions.read",
      // "crm.objects.users.read",
      // "crm.objects.owners.read",
      "content",
      "crm.objects.companies.read",
      "crm.objects.companies.write",
      "crm.objects.contacts.read",
      "crm.objects.contacts.write",
      "crm.objects.deals.write",
      "forms",
      "oauth",
      "timeline",
    ],
    oauthConfig: {
      authorization_endpoint: "https://mcp.hubspot.com/oauth/authorize/user",
      token_endpoint: "https://mcp.hubspot.com/oauth/v1/token",
    },
    comingSoon: true,
  },
  // clickup: {
  //   name: "clickup",
  //   displayName: "ClickUp",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // airtable: {
  //   name: "airtable",
  //   displayName: "Airtable",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // salesforce: {
  //   name: "salesforce",
  //   displayName: "Salesforce",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
  // todoist: {
  //   name: "todoist",
  //   displayName: "Todoist",
  //   serverUrl: "",
  //   authType: "oauth",
  //   scopes: [],
  //   allowedTools: [],
  //   oauthConfig: {
  //     authorization_endpoint: "",
  //     token_endpoint: "",
  //   },
  //   comingSoon: true,
  // },
};

export type IntegrationKey = keyof typeof MCP_INTEGRATIONS;

export function getIntegration(name: string) {
  return MCP_INTEGRATIONS[name];
}

/**
 * Get static OAuth client credentials from environment variables (if available)
 * This is used for integrations that have app-level OAuth credentials
 */
export function getStaticCredentials(integration: IntegrationKey) {
  switch (integration) {
    // case "hubspot":
    //   return {
    //     clientId: env.HUBSPOT_MCP_CLIENT_ID,
    //     clientSecret: env.HUBSPOT_MCP_CLIENT_SECRET,
    //   };
    // case "monday":
    //   return {
    //     clientId: env.MONDAY_MCP_CLIENT_ID,
    //     clientSecret: env.MONDAY_MCP_CLIENT_SECRET,
    //   };
    default:
      return undefined;
  }
}
