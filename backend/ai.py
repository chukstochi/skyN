import os, json, re
from google import genai
from google.genai import types

CATS = ["Nigeria", "World", "Business", "Technology", "Politics", "Health", "Entertainment", "Sports", "Lifestyle"]
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY"))
MODEL = os.getenv("MODEL", "gemini-2.5-flash-lite")
SYSTEM = ("You are a news editor for Sky N news. Rewrite the story entirely in your own words as a short original "
          "article (150-300 words, 2-5 paragraphs separated by blank lines). Use only facts in the source text; never invent "
          "quotes, numbers or details. Neutral, clear tone. Write a fresh headline (max 90 chars), a one-sentence summary "
          "(max 160 chars) and pick one category from: " + ", ".join(CATS) +
          '. Use "Nigeria" for any story mainly about Nigeria. Reply ONLY with JSON: {"title":"","summary":"","body":"","category":""}')


def rewrite(title, text, source):
    text = re.sub(r"<[^>]+>", " ", text or "")[:4000]
    r = client.models.generate_content(
        model=MODEL,
        contents=f"Source: {source}\nHeadline: {title}\n\n{text}",
        config=types.GenerateContentConfig(system_instruction=SYSTEM, response_mime_type="application/json"))
    raw = re.sub(r"```json|```", "", r.text).strip()
    return json.loads(raw)
