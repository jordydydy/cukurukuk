// DELETE FILE: remove jsonParser.js — parsing logic removed from the project
// Helper to extract JSON (object/array) from a text response.
// Returns { summary: string, json: any | null }
export function extractJsonFromText(text) {
	// basic guards
	if (!text || typeof text !== 'string') return { summary: text, json: null };

	// Collect possible JSON start positions ('{' or '[')
	const starters = [];
	for (let i = 0; i < text.length; i++) {
		const ch = text[i];
		if (ch === '{' || ch === '[') starters.push(i);
	}

	// Try parsing from each starter to the end; return the earliest valid parse
	for (const start of starters) {
		const candidate = text.substring(start).trim();
		try {
			const parsed = JSON.parse(candidate);
			const summary = text.substring(0, start).trim();
			return { summary: summary || '', json: parsed };
		} catch {
			// continue trying other starts
		}
	}

	// No JSON found
	return { summary: text.trim(), json: null };
}
