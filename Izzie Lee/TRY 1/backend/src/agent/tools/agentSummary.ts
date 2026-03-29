import { anthropic } from "../../lib/anthropic.js";
import type { Listing, TripRequest, AgentSummary } from "../../types.js";

interface CollectedStep {
  step: string;
  results: Listing[];
}

export async function generateAgentSummary(
  collected: CollectedStep[],
  req: TripRequest
): Promise<AgentSummary> {
  const flat = collected.flatMap(({ step, results }) =>
    results.map((r) => ({ ...r, step }))
  );

  if (flat.length === 0) {
    return {
      bestOptionId: null,
      bestOptionName: null,
      reasoning: "No results found. Try expanding your dates or destination.",
      actionSteps: [
        "Broaden your search to nearby cities",
        "Remove or increase the budget limit",
        "Try different travel dates",
        "Ask your friends directly if they know anyone in the area",
      ],
      confidence: "low",
    };
  }

  const listText = flat
    .map(
      (r, i) =>
        `${i + 1}. [ID: ${r.id}] ${r.name} | type: ${r.type} | degree: ${r.degree ?? "N/A"} | trust: ${r.trustScore.toFixed(2)} | cost: ${r.cost === null ? "split TBD" : r.cost === 0 ? "free" : `$${r.cost}/night`} | ${r.description}`
    )
    .join("\n");

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 1024,
    tools: [
      {
        name: "submit_analysis",
        description:
          "Submit your final housing recommendation with reasoning and next steps.",
        input_schema: {
          type: "object" as const,
          properties: {
            best_option_id: {
              type: "string",
              description: "The ID of the single best listing from the list.",
            },
            best_option_name: {
              type: "string",
              description: "Display name of the best option.",
            },
            reasoning: {
              type: "string",
              description:
                "2-3 sentences explaining why this is the best pick (trust, cost, connection strength).",
            },
            action_steps: {
              type: "array",
              items: { type: "string" },
              description:
                "3-5 clear, ordered action steps the user should take right now.",
            },
            confidence: {
              type: "string",
              enum: ["high", "medium", "low"],
              description: "How confident you are in this recommendation.",
            },
          },
          required: [
            "best_option_id",
            "best_option_name",
            "reasoning",
            "action_steps",
            "confidence",
          ],
        },
      },
    ],
    tool_choice: { type: "tool", name: "submit_analysis" },
    messages: [
      {
        role: "user",
        content: `You are a smart housing advisor for college students. Analyze these results for a trip to ${req.destination} from ${req.startDate} to ${req.endDate}${req.budget ? ` with a $${req.budget}/night max budget` : ""}.

Results:
${listText}

Pick the single best option. Prioritize: personal connections (lower degree = better) > trust score > cost. Free options from real friends beat cheap hotels. Call submit_analysis with your recommendation.`,
      },
    ],
  });

  const toolUse = response.content.find((b) => b.type === "tool_use");
  if (!toolUse || toolUse.type !== "tool_use") {
    // Fallback if Claude doesn't call the tool (shouldn't happen with tool_choice forced)
    const top = flat[0];
    return {
      bestOptionId: top.id,
      bestOptionName: top.name,
      reasoning: "Top result selected by trust score.",
      actionSteps: [
        `Message ${top.name} to confirm availability`,
        "Lock in your dates as soon as they confirm",
        "Book an Airbnb as backup just in case",
      ],
      confidence: "medium",
    };
  }

  const input = toolUse.input as {
    best_option_id: string;
    best_option_name: string;
    reasoning: string;
    action_steps: string[];
    confidence: "high" | "medium" | "low";
  };

  return {
    bestOptionId: input.best_option_id,
    bestOptionName: input.best_option_name,
    reasoning: input.reasoning,
    actionSteps: input.action_steps,
    confidence: input.confidence,
  };
}
