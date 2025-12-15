import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  try {
    // API key must be obtained exclusively from process.env.API_KEY
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      console.error("API Key not found in environment variables");
      throw new Error("API Key not configured");
    }

    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Utilizando o modelo flash para respostas rápidas e eficientes
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
    // Retorna mensagem de erro amigável no formato esperado pela UI
    return {
      funFacts: [
        "Erro ao conectar com a base de dados estelar.",
        "Verifique a configuração da chave de API.",
        "O sistema está operando com dados limitados."
      ],
      composition: "Desconhecida",
      temperature: "--",
      orbitPeriod: "--"
    };
  }
};