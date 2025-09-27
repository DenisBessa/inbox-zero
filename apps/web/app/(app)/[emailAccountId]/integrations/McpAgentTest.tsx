"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toastError } from "@/components/Toast";
import {
  mcpAgentAction,
  type McpAgentActionInput,
} from "@/utils/actions/mcp-agent";
import { useAccount } from "@/providers/EmailAccountProvider";

type McpAgentResponse = {
  response: string;
  toolCalls?: Array<{
    toolName: string;
    arguments: Record<string, unknown>;
    result: string;
  }>;
};

export function McpAgentTest() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [response, setResponse] = useState<McpAgentResponse | null>(null);
  const { emailAccountId } = useAccount();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toastError({
        title: "Error",
        description: "Please enter a query",
      });
      return;
    }

    if (!emailAccountId) {
      toastError({
        title: "Error",
        description: "Email account not found. Please refresh and try again.",
      });
      return;
    }

    setLoading(true);
    setResponse(null);

    try {
      const requestData: McpAgentActionInput = {
        query: query.trim(),
      };

      const result = await mcpAgentAction(emailAccountId, requestData);

      if (result?.serverError) {
        toastError({
          title: "Error",
          description: result.serverError,
        });
      } else if (result?.data) {
        setResponse(result.data);
      }
    } catch (error) {
      console.error("MCP agent error:", error);
      toastError({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to get response",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Test MCP Agent</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Ask about your Notion workspace... (e.g., 'search for pricing information' or 'find documents about Jane Smith')"
            value={query}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
              setQuery(e.target.value)
            }
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <Button type="submit" disabled={loading || !query.trim()}>
            {loading ? "Thinking..." : "Ask Agent"}
          </Button>
        </form>

        {response && (
          <div className="space-y-4">
            <div className="border rounded-lg p-4 bg-gray-50">
              <h4 className="font-semibold mb-2">Response:</h4>
              <p className="whitespace-pre-wrap">{response.response}</p>
            </div>

            {response.toolCalls && response.toolCalls.length > 0 && (
              <div className="border rounded-lg p-4">
                <h4 className="font-semibold mb-2">Tool Calls Made:</h4>
                <div className="space-y-2">
                  {response.toolCalls.map((call, index) => (
                    <div
                      key={index}
                      className="text-sm bg-gray-100 p-2 rounded"
                    >
                      <div className="font-mono text-blue-600">
                        {call.toolName}
                      </div>
                      <div className="text-gray-600">
                        Args: {JSON.stringify(call.arguments, null, 2)}
                      </div>
                      <div className="text-gray-500 text-xs mt-1">
                        Result: {call.result}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
