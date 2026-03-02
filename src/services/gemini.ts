import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });

export interface ProfileAnalysis {
  score: number;
  headline: string;
  summary: string;
  recommendations: string[];
  keywords: string[];
}

export interface PostDraft {
  id: string;
  type: string;
  content: string;
  hook: string;
}

export async function analyzeProfile(profileData: string): Promise<ProfileAnalysis> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Analyze this LinkedIn profile data and provide a professional score (0-100), an optimized headline, an optimized summary, a list of 5 actionable recommendations, and 5-10 target keywords for SEO.
    
    Profile Data:
    ${profileData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          score: { type: Type.NUMBER },
          headline: { type: Type.STRING },
          summary: { type: Type.STRING },
          recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
          keywords: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ["score", "headline", "summary", "recommendations", "keywords"],
      },
    },
  });

  return JSON.parse(response.text);
}

export async function generatePosts(profileData: string, targetRole: string, topic?: string): Promise<PostDraft[]> {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `Based on this LinkedIn profile and the target role "${targetRole}", generate 5 high-impact LinkedIn posts. 
    ${topic ? `Focus on the topic: ${topic}.` : ""}
    
    Include different formats:
    1. Thought leadership (contrarian take)
    2. Storytelling (career lesson)
    3. Listicle (value-add)
    4. Achievement/Win
    5. Industry insight
    
    Profile Data:
    ${profileData}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { type: Type.STRING },
            content: { type: Type.STRING },
            hook: { type: Type.STRING },
          },
          required: ["id", "type", "content", "hook"],
        },
      },
    },
  });

  return JSON.parse(response.text);
}
