/**
 * Gemini is never asked to name specific video titles or IDs. It cannot
 * guarantee those exist, and a fabricated link would break trust fast.
 * Instead Gemini writes the search phrase for each topic, and this function
 * builds a real, safe, encoded YouTube search URL from it. The person always
 * lands on genuine YouTube results, ordered from foundational to advanced to
 * interview prep.
 */
export function buildYoutubeSearchUrl(query) {
  const q = encodeURIComponent(String(query || "").trim());
  return `https://www.youtube.com/results?search_query=${q}`;
}
