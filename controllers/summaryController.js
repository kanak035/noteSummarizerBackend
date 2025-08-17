
import { genAI, DEFAULT_MODEL } from "../lib/geminiClient.js";


const SYSTEM_INSTRUCTION = `
You are a concise meeting-notes assistant.
Follow the USER INSTRUCTION style strictly (e.g., Hinglish, formal English, casual tone).
Return the summary in CLEAN PLAIN TEXT (no Markdown or special characters like #, *, _, backticks).
Do not force a fixed template unless user asks.
Adapt format based on transcript and user instruction.
`.trim();


export const summarizeController = async (req, res) => {
  try {
    const { transcript, instruction } = req.body || {};
    console.log(transcript,"transcript");
    console.log(instruction,"instruction");
    if (!transcript || typeof transcript !== "string" || !transcript.trim()) {
      return res.status(400).json({ error: "Transcript is required." });
    }

    const MAX_CHARS = 120_000;
    const safeTranscript = transcript.slice(0, MAX_CHARS);
    const safeInstruction = (instruction || "Summarize in plain text for executives.").slice(0, 2000);

    const model = genAI.getGenerativeModel({ model: DEFAULT_MODEL });

    const prompt = `
${SYSTEM_INSTRUCTION}

<TRANSCRIPT>
${safeTranscript}
</TRANSCRIPT>

<INSTRUCTION>
${safeInstruction}
</INSTRUCTION>
`.trim();

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = (response.text && response.text()) || "";


    text = markdownToPlain(text);

    if (!text.trim()) {
      return res.status(500).json({ error: "No summary returned by Gemini." });
    }
    console.log("Gemini summary:", text);

    res.json({ summary: text.trim() });
  } catch (err) {
    console.error("Gemini summarize error:", err?.message || err);
    const msg =
      err?.status === 429
        ? "Gemini rate limit or quota exceeded. Check billing/limits."
        : err?.message || "Gemini request failed";
    res.status(500).json({ error: msg });
  }
};

function markdownToPlain(input) {
  if (!input) return "";

  let s = String(input);

  // Normalize CRLF
  s = s.replace(/\r\n/g, "\n");

  // Remove code fences/backticks
  s = s.replace(/```[\s\S]*?```/g, (block) => block.replace(/```/g, "")).replace(/`([^`]+)`/g, "$1");

  // Replace Markdown headings like "## Title" → "TITLE:"
  s = s.replace(/^\s{0,3}#{1,6}\s*(.+)$/gm, (_, t) => `${t.toUpperCase().trim()}:`);

  // Bold/italic markers **text**, *text*, __text__, _text_
  s = s.replace(/(\*\*|__)(.*?)\1/g, "$2").replace(/(\*|_)(.*?)\1/g, "$2");

  // Lists: "- item", "* item" → "• item"
  s = s.replace(/^\s*[-*+]\s+/gm, "• ");

  // Numbered lists: "1. item" → "1) item"
  s = s.replace(/^\s*(\d+)\.\s+/gm, "$1) ");

  // Blockquotes: "> text" → "text"
  s = s.replace(/^\s*>\s?/gm, "");

  // Links: "[text](url)" → "text (url)"
  s = s.replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)");

  // Images: "![alt](src)" → "alt (src)"
  s = s.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, "$1 ($2)");

  // Horizontal rules
  s = s.replace(/^\s*([-*_]\s?){3,}\s*$/gm, "");

  // Collapse extra blank lines
  s = s.replace(/\n{3,}/g, "\n\n");

  // Trim
  s = s.trim();

  return s;
}
