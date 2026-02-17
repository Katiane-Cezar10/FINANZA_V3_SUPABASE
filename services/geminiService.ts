
import { GoogleGenAI, Type } from "@google/genai";
import { Asset, FinancialGoal } from "../types";

// Inicialização conforme diretrizes
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const getFinancialInsights = async (assets: Asset[], goals: FinancialGoal[]) => {
  const prompt = `
    Como um consultor financeiro sênior, analise o seguinte portfólio e metas de um usuário:
    
    Portfólio: ${JSON.stringify(assets.map(a => ({ name: a.name, type: a.subtype, amount: a.investedAmount, yield: a.yieldRate })))}
    Metas: ${JSON.stringify(goals.map(g => ({ name: g.name, target: g.targetValue, deadline: g.deadline, current: g.currentValue })))}

    Gere insights específicos sobre:
    1. Se as metas são atingíveis.
    2. Sugestões de aporte mensal.
    3. Alocação ideal.
    
    Responda em formato JSON.
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            insights: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  action: { type: Type.STRING },
                  severity: { type: Type.STRING }
                },
                required: ["title", "description", "action", "severity"]
              }
            },
            monthlyAporteNeeded: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  goalName: { type: Type.STRING },
                  suggestedAporte: { type: Type.NUMBER }
                }
              }
            }
          }
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    console.error("Erro ao obter insights:", error);
    return null;
  }
};

export const askFinancialAssistant = async (question: string, assets: Asset[], goals: FinancialGoal[]) => {
  const context = `Você é o assistente Finanza. Dados: Ativos: ${JSON.stringify(assets)}, Metas: ${JSON.stringify(goals)}.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: question,
      config: {
        systemInstruction: context,
        temperature: 0.7,
      },
    });

    return response.text;
  } catch (error) {
    return "Desculpe, tive um problema ao processar. Tente novamente.";
  }
};

export const parseAssetFromText = async (text: string): Promise<Partial<Asset> | null> => {
  const systemInstruction = `Extraia dados de investimento. 'type' deve ser: 'Renda Fixa', 'Renda Variável' ou 'Cripto'.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Extraia: ${text}`,
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            type: { type: Type.STRING },
            subtype: { type: Type.STRING },
            yieldRate: { type: Type.NUMBER },
            investedAmount: { type: Type.NUMBER },
            allocationDate: { type: Type.STRING },
            maturityDate: { type: Type.STRING }
          },
          required: ["name", "type", "subtype", "investedAmount"]
        }
      }
    });

    return JSON.parse(response.text || '{}');
  } catch (error) {
    return null;
  }
};
