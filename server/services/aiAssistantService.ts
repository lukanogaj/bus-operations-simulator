type ReplacementCandidate = {
	employeeNumber: number;
	batchNumber: number;
	firstName: string;
	lastName: string;
	rotaWeek: number;
};

type AiRecommendation = {
	employeeNumber: number;
	reason: string;
};

const GEMINI_MODEL = "gemini-3.5-flash-lite";
export const recommendReplacement = async (
	candidates: ReplacementCandidate[],
): Promise<AiRecommendation> => {
	const apiKey = process.env.GEMINI_API_KEY;

	if (!apiKey) {
		throw new Error("GEMINI_API_KEY is not configured");
	}

	if (candidates.length === 0) {
		throw new Error("No valid replacement candidates available");
	}

	const candidateData = candidates.map((candidate) => ({
		employeeNumber: candidate.employeeNumber,
		name: `${candidate.firstName} ${candidate.lastName}`,
		batchNumber: candidate.batchNumber,
		rotaWeek: candidate.rotaWeek,
	}));

	const prompt = `
You are an operations assistant for a bus operations system.

The backend has already validated these drivers as valid replacement candidates.
You MUST choose exactly one candidate from this list.

Do not invent a driver.
Do not change any employee number.
Do not apply operational rules that are not present in the data.
Your task is only to recommend the strongest candidate and give a short practical reason.

Valid candidates:
${JSON.stringify(candidateData, null, 2)}

Return JSON only in this exact format:
{
  "employeeNumber": 123456,
  "reason": "Short explanation."
}
`;

	const response = await fetch(
		`https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
		{
			method: "POST",
			headers: {
				"Content-Type": "application/json",
				"x-goog-api-key": apiKey,
			},
			body: JSON.stringify({
				contents: [
					{
						parts: [{ text: prompt }],
					},
				],
				generationConfig: {
					temperature: 0.2,
					maxOutputTokens: 150,
					responseMimeType: "application/json",
				},
			}),
		},
	);

	if (!response.ok) {
		const errorText = await response.text();

		throw new Error(
			`Gemini API request failed: ${response.status} ${errorText}`,
		);
	}

	const data = (await response.json()) as {
		candidates?: Array<{
			content?: {
				parts?: Array<{
					text?: string;
				}>;
			};
		}>;
	};

	const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

	if (!generatedText) {
		throw new Error("Gemini returned an empty recommendation");
	}

	let recommendation: AiRecommendation;

	try {
		recommendation = JSON.parse(generatedText) as AiRecommendation;
	} catch {
		throw new Error("Gemini returned invalid recommendation JSON");
	}

	const selectedCandidate = candidates.find(
		(candidate) => candidate.employeeNumber === recommendation.employeeNumber,
	);

	if (!selectedCandidate) {
		throw new Error(
			"Gemini recommended a driver outside the valid candidate list",
		);
	}

	if (
		typeof recommendation.reason !== "string" ||
		recommendation.reason.trim().length === 0
	) {
		throw new Error("Gemini returned an invalid recommendation reason");
	}

	return {
		employeeNumber: selectedCandidate.employeeNumber,
		reason: recommendation.reason.trim(),
	};
};
