import "dotenv/config";
import express, { Request, Response } from "express";
import { Client } from "@notionhq/client";

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PRD_PAGE_ID = process.env.PRD_PAGE_ID as string;

const app = express();
app.use(express.json());

app.post("/sync-prd", async (req: Request, res: Response) => {
  if (!PRD_PAGE_ID) {
    return res.status(500).json({ error: "PRD_PAGE_ID not configured" });
  }

  const {
    version,
    status,
    completedFeatures = [],
    inProgressFeatures = [],
    liveUrl,
  } = req.body as {
    version: string;
    status: string;
    completedFeatures: string[];
    inProgressFeatures: string[];
    liveUrl?: string;
  };

  try {
    // Append an "Implementation Status (auto)" block
    // (Page is a regular Notion page, not a DB entry — no custom properties)
    const text = [
      liveUrl ? `Live: ${liveUrl}` : "",
      "",
      "Completed:",
      ...completedFeatures.map((f) => `- ${f}`),
      "",
      "In Progress:",
      ...inProgressFeatures.map((f) => `- ${f}`),
    ].join("\n");

    await notion.blocks.children.append({
      block_id: PRD_PAGE_ID,
      children: [
        {
          heading_2: {
            rich_text: [{ text: { content: "Implementation Status (auto)" } }],
          },
        },
        {
          paragraph: {
            rich_text: [{ text: { content: text } }],
          },
        },
      ],
    });

    res.json({ ok: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update PRD" });
  }
});

const port = Number(process.env.PORT || 4000);
app.listen(port, () => {
  console.log(`PRD sync service running on http://localhost:${port}`);
});
