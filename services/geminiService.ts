import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  try {
    const model = 'gemini-2.5-flash';
    const prompt = `Forneça informações astronômicas interessantes e dados científicos sobre o planeta ${planetName}. A resposta deve estar em português.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um astrônomo especialista explicando o cosmos para estudantes. Seja conciso e fascinante.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            funFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 fatos curiosos e curtos sobre o planeta."
            },
            composition: {
              type: Type.STRING,
              description: "Breve descrição da composição (gás, rocha, gelo)."
            },
            temperature: {
              type: Type.STRING,
              description: "Temperatura média ou variação de temperatura."
            },
            orbitPeriod: {
              type: Type.STRING,
              description: "Tempo para orbitar o Sol."
            }
          },
          required: ["funFacts", "composition", "temperature", "orbitPeriod"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as GeminiPlanetInfo;
    }
    return null;
  } catch (error) {
    console.error("Error fetching planet details:", error);
    return {
      funFacts: ["Não foi possível carregar os dados da IA no momento.", "Tente novamente mais tarde.", "Verifique sua conexão."],
      composition: "Desconhecida",
      temperature: "Desconhecida",
      orbitPeriod: "Desconhecido"
    };
  }
};
