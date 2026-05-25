const express = require("express");
const router = express.Router();

console.log(
  "AI ROUTE KEY:",
  process.env.ANTHROPIC_API_KEY
);

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function callAnthropic(body) {
  const delays = [1000, 2000];
  for (let attempt = 1; attempt <= 3; attempt++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json.type === "error" && json.error?.type === "overloaded_error") {
      console.log(`AI overloaded — retry attempt ${attempt}`);
      if (attempt < 3) await sleep(delays[attempt - 1]);
      continue;
    }
    return json;
  }
  console.log("AI overloaded — using fallback response");
  return null;
}

async function callAnthropicQuote(body) {
  const delays = [2000, 4000, 6000];
  for (let attempt = 1; attempt <= 4; attempt++) {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify(body),
    });
    const json = await response.json();
    if (json.type === "error" && json.error?.type === "overloaded_error") {
      console.log(`AI overloaded — retry attempt ${attempt}`);
      if (attempt < 4) await sleep(delays[attempt - 1]);
      continue;
    }
    return json;
  }
  console.log("AI overloaded — using fallback response");
  return null;
}

// ================= VALIDATE =================
router.post(
  "/validate",
  async (req, res) => {

    try {

      const {
        projectType,
        data,
      } = req.body;

      const json = await callAnthropic({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 300,
        messages: [
          {
            role: "user",
            content: `
Your job is to collect ONLY the minimum missing details needed to estimate a project.

Rules:
- NEVER ask for information already provided
- NEVER repeat questions that already have answers in the submission data
- NEVER ask semantically similar questions that were already answered previously
- Treat reworded quantity/scope questions as duplicates if the meaning is already answered
- If a previous answer already partially answers a new question, do not ask it again
- If branding/logo/guidelines were already mentioned, do not ask again
- If audience or target market was already mentioned, do not ask again
- If campaign duration/timeline was already mentioned, do not ask again
- One sentence only
- No markdown
- No bullet points
- No bold text
- Maximum 5 questions
- Sound conversational and supportive
- Avoid technical jargon
- Avoid developer/internal workflow questions
- Stop asking questions that were already questioned and answered before
- If the brief is already sufficient, respond ONLY with:
PASS
- Prefer PASS instead of asking low-value or optional questions

Good examples:
- Will you need mobile-friendly layouts?
- Do you already have branding assets?
- Are there any design references you like?

Bad examples:
- What are the technical constraints?
- Please clarify the architectural migration strategy.
- Who will approve this project?
- What's your budget range?

Project Type:
${projectType}

Client Submission Data:
${JSON.stringify(data, null, 2)}

Previously Asked And Answered Questions (DO NOT REPEAT OR REWORD THESE):
${JSON.stringify(
  Object.entries(data)
    .filter(([k]) => k.includes("?"))
    .map(([q, a]) => ({
      question: q,
      answer: a,
    })),
  null,
  2
)}
            `,
          },
        ],
      });

      if (json === null) {
        return res.json({
          pass: true,
          aiAnswers: {},
          fallback: true,
          message: "AI temporarily unavailable",
        });
      }

      console.log(
        "AI VALIDATE RESPONSE:",
        json
      );

      const text =
        json.content?.[0]?.text || "";

      if (
        text.includes("PASS")
      ) {

        return res.json({
          pass: true,
          questions: [],
        });
      }

      const questions =
        text
          .split("\n")

          .filter(
            (q) =>
              q.trim()
                .length > 0
          )

          .map((q) =>
            q
              .replace(
                /^\d+\.\s*/,
                ""
              )
              .trim()
          );

      return res.json({
        pass: false,
        questions,
      });

    } catch (err) {

  console.error(
    "AI VALIDATE ERROR:",
    err
  );

  return res.json({
    pass: true,
    questions: [],
  });
}
  }
);


// ================= QUOTE =================
router.post(
  "/generate-quote",
  async (req, res) => {

    try {

      const {
        projectType,
        data,
      } = req.body;

      const json = await callAnthropicQuote({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 700,
        messages: [
          {
            role: "user",
            content: `
You are a pricing assistant.

Based on the project brief, estimate:

1. Total cost
2. Short reasoning
3. Optional breakdown

IMPORTANT PRICING RULES:

Estimate pricing using realistic professional rates.

Base estimates ONLY on:

- Deliverables requested
- Complexity
- Production effort
- Revisions
- Timeline
- Asset preparation
- Technical work
- Platform requirements
- Quantity of outputs
- Explicit requirements

GENERAL GUIDANCE:

Small:
Few deliverables and low effort

Medium:
Several deliverables and moderate effort

Large:
Higher volume work, many assets, or extended production

IMPORTANT:

- Existing assets reduce effort and cost
(logos, images, templates, guidelines)

- Reuse of materials should lower pricing

- Do NOT assume agency pricing

- Do NOT assume teams or future expansion

- Do NOT assume animation, coding, motion graphics, multilingual work, advanced editing, premium production, or extra services unless explicitly requested

- Price ONLY requested work

- If scope is unclear, assume LOWER reasonable effort

- Keep estimates conservative

- Avoid inflated estimates

- Budget is reference only

OUTPUT RULES:

- Return realistic pricing
- Prefer lower reasonable estimates when uncertain
- Avoid enterprise assumptions
- Return:

1. Estimated price
2. Reasoning
3. Optional breakdown

Project Type:
${projectType}

Brief:
${JSON.stringify(data, null, 2)}

Return JSON ONLY like this:

{
  "price": 1200,
  "reason": "Short explanation",
  "breakdown": [
    {
      "label": "Design",
      "amount": 800
    },
    {
      "label": "Revisions",
      "amount": 400
    }
  ]
}
            `,
          },
        ],
      });

      if (json === null) {
        return res.json({
          price: 0,
          reason: "AI quote temporarily unavailable",
          breakdown: [],
          fallback: true,
        });
      }

      console.log(
        "AI QUOTE RESPONSE:",
        json
      );

      const text =
        json.content?.[0]?.text || "";

      const jsonMatch =
        text.match(
          /\{[\s\S]*\}/
        );

      let parsed;

      try {

        parsed = JSON.parse(
          jsonMatch
            ? jsonMatch[0]
            : text
        );

      } catch {

        parsed = {
          price: 0,
          reason:
            "Could not generate estimate",
          breakdown: [],
        };
      }

      return res.json(parsed);

    } catch (err) {

  console.error(
    "AI QUOTE ERROR:",
    err
  );

  return res.json({
    price: 0,
    reason:
      "AI temporarily unavailable",
    breakdown: [],
  });
}
  }
);

module.exports = router;