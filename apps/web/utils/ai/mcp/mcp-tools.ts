import { experimental_createMCPClient } from "ai";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import { getIntegration, getStaticCredentials } from "@/utils/mcp/integrations";
import prisma from "@/utils/prisma";
import { createScopedLogger, type Logger } from "@/utils/logger";
import { credentialStorage } from "@/utils/mcp/storage-adapter";
import { refreshAccessToken } from "@inboxzero/mcp";

export async function createMcpToolsForAgent(emailAccountId: string) {
  const logger = createScopedLogger("ai-mcp-tools").with({ emailAccountId });

  try {
    const connections = await prisma.mcpConnection.findMany({
      where: {
        emailAccountId,
        isActive: true,
        tools: {
          some: {
            isEnabled: true,
          },
        },
      },
      include: {
        integration: true,
        tools: {
          where: { isEnabled: true },
        },
      },
    });

    if (connections.length === 0) return {};

    const allTools: Record<string, unknown> = {};

    // Create MCP client for each connection and get tools
    for (const connection of connections) {
      const integration = connection.integration;
      const integrationConfig = getIntegration(integration.name);

      if (!integrationConfig) {
        logger.warn("Integration config not found", {
          integration: integration.name,
        });
        continue;
      }

      if (
        integrationConfig.authType !== "oauth" ||
        !integrationConfig.serverUrl
      ) {
        logger.warn("Skipping non-OAuth or missing serverUrl integration", {
          integration: integration.name,
        });
        continue;
      }

      try {
        const accessToken = await getValidAccessToken(connection);

        // Use registered server URL if available, otherwise fall back to config
        const serverUrl =
          integration.registeredServerUrl ?? integrationConfig.serverUrl;
        if (!serverUrl) {
          logger.warn("No server URL available", {
            integration: integration.name,
          });
          continue;
        }

        const transport = new StreamableHTTPClientTransport(
          new URL(serverUrl),
          {
            requestInit: {
              headers: {
                Authorization: `Bearer ${accessToken}`,
                "Content-Type": "application/json",
              },
            },
          },
        );

        const mcpClient = await experimental_createMCPClient({ transport });

        const mcpTools = await mcpClient.tools();

        // Filter to only enabled tools
        const enabledToolNames = connection.tools.map((tool) => tool.name);
        const filteredTools = Object.fromEntries(
          Object.entries(mcpTools).filter(([toolName]) =>
            enabledToolNames.includes(toolName),
          ),
        );

        // Merge tools with prefix to avoid conflicts
        Object.entries(filteredTools).forEach(([toolName, toolDef]) => {
          allTools[toolName] = toolDef;
        });

        // Store client for cleanup (we'll handle this in the calling function)
        (allTools as Record<string, unknown>)[`_client_${integration.name}`] =
          mcpClient;
      } catch (error) {
        logger.error("Failed to create MCP client for integration", {
          error: error instanceof Error ? error.message : String(error),
          integration: integration.name,
        });
        // Continue with other integrations
      }
    }

    return allTools;
  } catch (error) {
    logger.error("Failed to create MCP tools for agent", { error });
    return {};
  }
}

type McpConnectionWithIntegration = {
  id: string;
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: Date | null;
  integration: {
    name: string;
  };
};

/**
 * Get valid access token, refreshing if needed
 */
async function getValidAccessToken(
  connection: McpConnectionWithIntegration,
): Promise<string> {
  if (!connection.accessToken) throw new Error("No access token found");

  const now = new Date();
  const isExpired = connection.expiresAt && connection.expiresAt < now;

  if (isExpired && connection.refreshToken) {
    const integrationConfig = getIntegration(connection.integration.name);

    const refreshedToken = await refreshAccessToken(
      integrationConfig,
      connection.refreshToken,
      credentialStorage,
      getStaticCredentials(connection.integration.name),
    );

    await prisma.mcpConnection.update({
      where: { id: connection.id },
      data: {
        accessToken: refreshedToken.access_token,
        refreshToken: refreshedToken.refresh_token || connection.refreshToken,
        expiresAt: refreshedToken.expires_in
          ? new Date(Date.now() + refreshedToken.expires_in * 1000)
          : connection.expiresAt,
        updatedAt: new Date(),
      },
    });

    return refreshedToken.access_token;
  }

  if (isExpired)
    throw new Error("Access token has expired and no refresh token available");

  return connection.accessToken;
}

export async function cleanupMcpClients(
  tools: Record<string, unknown>,
  logger: Logger,
) {
  const clientEntries = Object.entries(tools).filter(([key]) =>
    key.startsWith("_client_"),
  );

  await Promise.all(
    clientEntries.map(async ([, client]) => {
      try {
        await (client as any).close();
      } catch (error) {
        logger.warn("Error closing MCP client", { error });
      }
    }),
  );
}
