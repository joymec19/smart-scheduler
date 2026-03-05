// @ts-check
"use strict";

const { Client } = require("@notionhq/client");
const path = require("path");

const notion = new Client({ auth: process.env.NOTION_API_KEY });
const PRD_PAGE_ID = process.env.PRD_PAGE_ID;

if (!PRD_PAGE_ID) {
  console.error("Missing PRD_PAGE_ID env var");
  process.exit(1);
}

const status = require(path.join(__dirname, "../prd-status.json"));
const { version, completedFeatures = [], inProgressFeatures = [], liveUrl } = status;

const commitSha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.slice(0, 7) : "local";
const commitMsg = process.env.COMMIT_MSG || "";
const timestamp = new Date().toISOString().replace("T", " ").slice(0, 16) + " UTC";

async function deleteExistingStatusBlock() {
  let cursor;
  do {
    const res = await notion.blocks.children.list({
      block_id: PRD_PAGE_ID,
      start_cursor: cursor,
    });

    for (const block of res.results) {
      if (
        block.type === "heading_2" &&
        block.heading_2.rich_text[0]?.plain_text?.startsWith("Implementation Status (auto)")
      ) {
        await notion.blocks.delete({ block_id: block.id });
        console.log("Deleted existing status block:", block.id);
      }
    }

    cursor = res.has_more ? res.next_cursor : undefined;
  } while (cursor);
}

async function appendStatusBlock() {
  const lines = [
    liveUrl ? `Live: ${liveUrl}` : "",
    `Updated: ${timestamp}  |  commit: ${commitSha}`,
    commitMsg ? `Commit: ${commitMsg}` : "",
    "",
    "Completed:",
    ...completedFeatures.map((f) => `  - ${f}`),
    "",
    "In Progress:",
    ...inProgressFeatures.map((f) => `  - ${f}`),
  ]
    .filter((l, i, arr) => !(l === "" && arr[i - 1] === ""))
    .join("\n");

  await notion.blocks.children.append({
    block_id: PRD_PAGE_ID,
    children: [
      {
        heading_2: {
          rich_text: [
            { text: { content: `Implementation Status (auto) — v${version}` } },
          ],
        },
      },
      {
        paragraph: {
          rich_text: [{ text: { content: lines } }],
        },
      },
    ],
  });

  console.log("Appended status block to Notion PRD.");
}

(async () => {
  try {
    await deleteExistingStatusBlock();
    await appendStatusBlock();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
