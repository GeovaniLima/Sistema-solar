import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  try {
    const apiKey = process.env.API_KEY;

    // Se a chave não estiver presente, retorna dados de fallback imediatamente para evitar erro fatal do SDK
    if (!apiKey) {
      console.warn("API Key is missing. Using offline fallback data.");
      return {
        funFacts: [
          "A chave da API Gemini não foi configurada.",
          "O modo offline está ativo.",
          "Configure a variável de ambiente API_KEY na Vercel para ver dados gerados por IA."
        ],
        composition: "Modo Offline",
        temperature: "Modo Offline",
        orbitPeriod: "Modo Offline"
      };
    }

    // Inicializa o SDK apenas quando necessário e se a chave existir
    const ai = new GoogleGenAI({ apiKey: apiKey });
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