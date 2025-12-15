import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  // HARDCODED: Definindo a chave diretamente para eliminar qualquer erro de variável de ambiente na Vercel
  const apiKey = "AIzaSyBIuCuFlYckVDV4jIIr5XgaKkx09wlE-g0";

  try {
    console.log(`CosmoView: Iniciando requisição para ${planetName}...`);
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    // Modelo leve e rápido
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
  } catch (error: any) {
    console.error("Error fetching planet details:", error);
    
    // Mostra o erro real na tela para podermos diagnosticar se é problema de chave ou rede
    const errorMessage = error.message || String(error);

    return {
      funFacts: [
        "Status da Conexão: Falha",
        `Erro Técnico: ${errorMessage.substring(0, 100)}...`, // Mostra o erro técnico
        "Tente recarregar a página."
      ],
      composition: "Sistema Offline",
      temperature: "--",
      orbitPeriod: "--"
    };
  }
};