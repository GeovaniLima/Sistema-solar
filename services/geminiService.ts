import { GoogleGenAI, Type } from "@google/genai";
import { GeminiPlanetInfo } from "../types";

export const fetchPlanetDetails = async (planetName: string): Promise<GeminiPlanetInfo | null> => {
  try {
    // 1. Tenta pegar do LocalStorage
    let apiKey = localStorage.getItem("GEMINI_API_KEY");

    // 2. Fallback para variáveis de ambiente
    if (!apiKey) {
      try {
        // @ts-ignore
        apiKey = import.meta.env.VITE_API_KEY;
      } catch (e) {}
    }

    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    // LIMPEZA DA CHAVE: Remove espaços e aspas que podem vir no copy-paste
    apiKey = apiKey.trim().replace(/^["']|["']$/g, '');

    console.log(`CosmoView: Iniciando requisição para ${planetName} usando chave final ${apiKey.substring(0, 4)}...`);
    
    const ai = new GoogleGenAI({ apiKey: apiKey });
    
    const model = 'gemini-2.5-flash';
    const prompt = `Gere curiosidades fascinantes, composição geológica, temperatura média e período orbital do planeta ${planetName}. Responda estritamente no schema JSON solicitado.`;

    const response = await ai.models.generateContent({
      model: model,
      contents: prompt,
      config: {
        systemInstruction: "Você é um astrofísico da NASA. Forneça dados precisos e fascinantes em Português do Brasil.",
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            funFacts: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "3 fatos extremamente curiosos e científicos."
            },
            composition: {
              type: Type.STRING,
              description: "Resumo da composição química e física."
            },
            temperature: {
              type: Type.STRING,
              description: "Temperatura média (ex: 400°C ou -150°C)."
            },
            orbitPeriod: {
              type: Type.STRING,
              description: "Tempo de translação (ex: 365 dias, 12 anos)."
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
    
    let userMessage = "Erro desconhecido.";
    const errorString = JSON.stringify(error, null, 2); // Pega estrutura completa
    const errorMessageSimple = error.message || "";

    // Tratamento de erros amigável
    if (errorMessageSimple === "API_KEY_MISSING") {
      userMessage = "Chave API não configurada. Clique em 'Configurar Chave' para resolver.";
    } 
    // Erros comuns de chave
    else if (errorString.includes("403") || errorString.includes("key was reported as leaked")) {
      userMessage = "Sua chave foi bloqueada por segurança (vazamento detectado). Gere uma nova.";
    } 
    else if (errorString.includes("API key expired") || errorString.includes("API_KEY_INVALID")) {
      userMessage = "Sua chave API expirou. Gere uma nova chave no Google AI Studio e atualize nas configurações.";
    }
    // Outros erros
    else if (errorString.includes("404")) {
      userMessage = "Modelo de IA indisponível. Tente novamente em instantes.";
    } 
    else if (errorString.includes("Failed to fetch")) {
        userMessage = "Erro de conexão. Verifique sua internet.";
    } 
    else {
      // Tenta extrair mensagem limpa se for JSON
      userMessage = "Erro inesperado na API. Verifique a chave nas configurações.";
    }

    return {
      funFacts: [
        "⚠ Status: Falha na Conexão",
        userMessage,
        "Dados simulados (offline) sendo exibidos."
      ],
      composition: "Sistema Offline",
      temperature: "--",
      orbitPeriod: "--"
    };
  }
};