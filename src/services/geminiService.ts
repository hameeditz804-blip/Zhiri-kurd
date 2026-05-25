import { GoogleGenAI } from "@google/genai";
import { AspectRatio } from "../types";

export class GeminiService {
  private static getAI(apiKey?: string) {
    // Priority: dynamic key (for Veo) > static key (for images)
    const key = apiKey || process.env.API_KEY || process.env.GEMINI_API_KEY;
    if (!key) throw new Error("API key not configured");
    return new GoogleGenAI({ apiKey: key });
  }

  static async generateImage(prompt: string, aspectRatio: AspectRatio = "1:1") {
    const ai = this.getAI();
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }],
      },
      config: {
        imageConfig: {
          aspectRatio,
        },
      },
    });

    for (const part of response.candidates?.[0]?.content.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data received");
  }

  static async checkApiKey() {
    return await (window as any).aistudio.hasSelectedApiKey();
  }

  static async openKeySelector() {
    return await (window as any).aistudio.openSelectKey();
  }
}
