import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult, RiskLevel } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Helper to convert blob to base64
const blobToBase64 = (blob: Blob): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = (reader.result as string).split(',')[1];
      resolve(base64String);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
};

export const analyzeMedia = async (
  input: File | Blob | string, 
  mediaType: 'image' | 'audio' | 'video' | 'text'
): Promise<AnalysisResult> => {
  if (!process.env.API_KEY) {
    throw new Error("API Key is missing. Please set process.env.API_KEY.");
  }

  const systemPrompt = `
    You are DeepFraud, a world-class forensic AI expert specializing in deepfake detection, synthetic identity fraud, and digital manipulation analysis.
    
    Analyze the provided media artifact (Image, Audio, Video, or Text). 
    
    For Image/Video/Audio:
    1. Look for Visual artifacts (warping, inconsistencies in lighting, unnatural eye blinking, lip-sync errors).
    2. Look for Audio artifacts (robotic intonation, background noise gating inconsistencies, spectral anomalies).
    3. Look for Metadata or content context that suggests synthetic generation.

    For Text:
    1. Analyze for patterns typical of LLM generation (excessive balance, lack of perplexity, specific repetitive sentence structures).
    2. Check for phishing indicators or social engineering tactics.
    3. Verify factual consistency (hallucination checks).

    Also perform a specific Liveness Verification assessment to determine if the subject is a real, live human present at the time of capture, or a reproduction (screen, mask, deepfake). For Text, liveness refers to "Human Written" vs "AI Generated".

    Return a JSON object with:
    - score: number (0-100, where 0 is perfectly authentic and 100 is definitely fraud/deepfake/AI-generated)
    - verdict: "REAL" | "FAKE" | "SUSPICIOUS"
    - reasoning: A concise technical explanation of the findings (max 2 sentences).
    - indicators: An array of strings listing specific detected anomalies (e.g., "Mismatched ear rings", "Irregular blinking pattern", "Flat audio spectrum", "AI formatting patterns").
    - liveness: An object containing:
        - score: number (0-100, where 100 is definitely a Live Real Person/Human Author and 0 is definitely a Spoof/Fake/AI).
        - analysis: A brief explanation of liveness signs detected (e.g. "Micro-movements present", "Human-like stylistic errors").

    Be strict.
  `;

  try {
    // Upgrading to Pro model for advanced reasoning and multimodal analysis capabilities
    const modelId = 'gemini-3-pro-preview'; 

    let parts = [];
    
    if (mediaType === 'text' && typeof input === 'string') {
        parts = [
            { text: `Analyze this text content:\n\n${input}` },
            { text: systemPrompt }
        ];
    } else if (input instanceof Blob) {
        const base64Data = await blobToBase64(input);
        let mimeType = input.type;
        
        // Fallbacks for mime types if blob is generic
        if (!mimeType) {
            if (mediaType === 'image') mimeType = 'image/jpeg';
            if (mediaType === 'audio') mimeType = 'audio/mp3';
            if (mediaType === 'video') mimeType = 'video/mp4';
        }

        parts = [
            {
                inlineData: {
                    mimeType: mimeType,
                    data: base64Data
                }
            },
            { text: systemPrompt }
        ];
    } else {
        throw new Error("Invalid input format for selected media type");
    }

    const response = await ai.models.generateContent({
        model: modelId,
        contents: { parts },
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    score: { type: Type.NUMBER },
                    verdict: { type: Type.STRING },
                    reasoning: { type: Type.STRING },
                    indicators: { 
                        type: Type.ARRAY,
                        items: { type: Type.STRING }
                    },
                    liveness: {
                        type: Type.OBJECT,
                        properties: {
                            score: { type: Type.NUMBER },
                            analysis: { type: Type.STRING }
                        },
                        required: ["score", "analysis"]
                    }
                },
                required: ["score", "verdict", "reasoning", "indicators", "liveness"]
            }
        }
    });

    const text = response.text;
    if (!text) throw new Error("No response from AI");

    const data = JSON.parse(text);

    // Map score to RiskLevel
    let riskLevel = RiskLevel.LOW;
    if (data.score > 30) riskLevel = RiskLevel.MEDIUM;
    if (data.score > 70) riskLevel = RiskLevel.HIGH;
    if (data.score > 90) riskLevel = RiskLevel.CRITICAL;

    return {
      score: data.score,
      verdict: data.verdict as any,
      riskLevel: riskLevel,
      reasoning: data.reasoning,
      indicators: data.indicators,
      timestamp: new Date().toISOString(),
      mediaType: mediaType,
      liveness: data.liveness
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    return {
      score: 0,
      verdict: 'UNKNOWN',
      riskLevel: RiskLevel.LOW,
      reasoning: "Analysis failed due to API connection or format error.",
      indicators: ["API Error"],
      timestamp: new Date().toISOString(),
      mediaType: mediaType,
      liveness: {
        score: 0,
        analysis: "Could not verify liveness due to error."
      }
    };
  }
};