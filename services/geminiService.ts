import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

// Função robusta para recuperar a chave de API em qualquer ambiente
const getApiKey = (): string => {
  let apiKey = "";

  // 1. Tenta recuperar do Vite/Vercel (Padrão moderno para Frontend)
  // @ts-ignore
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_API_KEY) {
    // @ts-ignore
    apiKey = import.meta.env.VITE_API_KEY;
    console.log("CosmoView: Usando chave de ambiente Vercel/Vite");
  }

  // 2. Tenta recuperar da variável global injetada no HTML (Fallback garantido)
  // Isso previne erros de 'process is not defined' em navegadores
  if (!apiKey && typeof window !== 'undefined' && (window as any).GEMINI_API_KEY) {
    apiKey = (window as any).GEMINI_API_KEY;
    console.log("CosmoView: Usando chave global do navegador");
  }

  // 3. Fallback final hardcoded
  if (!apiKey) {
    apiKey = "AIzaSyBIuCuFlYckVDV4jIIr5XgaKkx09wlE-g0";
    console.log("CosmoView: Usando chave de fallback estática");
  }

  return apiKey;
};

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  try {
    const apiKey = getApiKey();

    if (!apiKey) {
      console.error("Critical: API Key not found in any configuration source.");
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
        "Verifique a conexão de rede.",
        "O sistema está operando em modo offline."
      ],
      composition: "Dados Indisponíveis",
      temperature: "--",
      orbitPeriod: "--"
    };
  }
};