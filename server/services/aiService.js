import { GoogleGenAI } from "@google/genai";

// Initialize Gemini SDK. It automatically picks up process.env.GEMINI_API_KEY
const ai = new GoogleGenAI({});

// The core function that all other exports will use
const callAI = async (prompt) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3.6-flash", // or "gemini-3.6-flash" if you prefer
      contents: prompt,
      config: {
        // This forces Gemini to return strict JSON, meaning you don't
        // have to manually string-replace markdown backticks anymore
        responseMimeType: "application/json",
        temperature: 0.7,
      },
    });

    // Parse the clean JSON text directly
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Gemini API Error in callAI:", error);
    throw error;
  }
};

export const analyzeResumeWithGemini = async (resumeText) => {
  const prompt = `
You are an expert ATS and career coach.
Analyze this resume and return ONLY this JSON, no extra text:
give honest.
{
  "atsScore": <number 0-100>,
  "overallScore": <number 0-100>,
  "experienceLevel": "<fresher|junior|mid|senior>",
  "targetRole": "<most suitable role>",
  "skills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Resume:
${resumeText}
`;
  return await callAI(prompt);
};

export const matchResumeWithJD = async (resumeText, jobDescription) => {
  const prompt = `
You are an expert recruiter.
Compare this resume with the job description and return ONLY this JSON, no extra text:

{
  "matchScore": <number 0-100>,
  "matchedSkills": ["skill1", "skill2"],
  "missingSkills": ["skill1", "skill2"],
  "feedback": "<2-3 sentence summary>",
  "suggestions": ["suggestion1", "suggestion2"]
}

Resume:
${resumeText}

Job Description:
${jobDescription}
`;
  return await callAI(prompt);
};

export const generateInterviewQuestions = async ({
  role,
  type,
  techStack,
  difficulty,
  count = 5,
}) => {
  const typeContext =
    type === "technical"
      ? `Technical interview focusing on ${techStack || role} concepts, coding, and problem solving.`
      : type === "hr"
        ? `HR interview focusing on behavioral, situational, and cultural fit questions.`
        : `Mixed interview with both technical and HR behavioral questions.`;

  const prompt = `
You are an expert technical interviewer.
keep it easy question and give markings bit easy/medium.
Generate exactly ${count} interview questions for:

Role: ${role}
Type: ${type}
Tech Stack: ${techStack || "General"}
Difficulty: ${difficulty}
Context: ${typeContext}

Return ONLY a JSON array, no extra text:
["Question 1?", "Question 2?", "Question 3?"]
`;
  return await callAI(prompt);
};

export const evaluateAnswer = async ({
  question,
  userAnswer,
  role,
  difficulty,
}) => {
  const prompt = `
You are an expert interviewer evaluating a candidate answer.
keep it easy question and give markings bit easy/medium.
Role: ${role}
Difficulty: ${difficulty}
Question: ${question}
Answer: ${userAnswer || "No answer provided"}

Return ONLY this JSON, no extra text:
{
  "rating": <number 0-10>,
  "feedback": "<2-3 sentences of specific feedback>",
  "idealAnswer": "<brief ideal answer in 2-3 sentences>"
}
`;
  return await callAI(prompt);
};

export const generateOverallFeedback = async ({
  role,
  questions,
  overallScore,
}) => {
  const qa = questions
    .map(
      (q, i) =>
        `Q${i + 1}: ${q.question}\nAnswer: ${q.userAnswer}\nRating: ${q.aiRating}/10`,
    )
    .join("\n\n");

  const prompt = `
You are an expert interviewer giving final feedback.
keep it easy question and give markings bit easy/medium.
Role: ${role}
Overall Score: ${overallScore}/10

Interview Q&A:
${qa}

Return ONLY this JSON, no extra text:
{
  "overallFeedback": "<3-4 sentence performance summary>",
  "strengths": ["strength1", "strength2", "strength3"],
  "improvements": ["improvement1", "improvement2", "improvement3"]
}
`;
  return await callAI(prompt);
};
