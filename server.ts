import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Initialize Gemini Client
  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      }
    }
  });

  // API Routes
  app.post("/api/gemini/assist", async (req, res) => {
    try {
      const { action, title, content, category, instruction } = req.body;
      
      if (!process.env.GEMINI_API_KEY) {
        return res.status(500).json({ error: "Chave do Gemini API não configurada no servidor." });
      }

      let prompt = "";
      if (action === "improve") {
        prompt = `Você é um assistente de redação profissional para um blog de advocacia de alta qualidade de Dr. Willemes Ferreira.
Melhore o seguinte conteúdo para torná-lo mais formal, claro, envolvente, juridicamente preciso e bem-estruturado. 
Retorne APENAS o texto aprimorado, mantendo a estrutura de parágrafos e marcações de subtítulos (usando ### se houver).
Aqui está o texto a ser aprimorado:

${content}`;
      } else if (action === "suggest") {
        prompt = `Você é um assistente de marketing jurídico e SEO para o blog de advocacia de Dr. Willemes Ferreira.
Com base no seguinte artigo de blog, sugira um título profissional cativante e um resumo (excerpt) de 1 a 2 frases altamente otimizado para SEO e atrativo para leitores.
Retorne a resposta estritamente como um objeto JSON no seguinte formato:
{
  "title": "título sugerido aqui",
  "excerpt": "resumo sugerido aqui"
}
Não coloque nenhuma formatação markdown (como blocos de código \`\`\`json) na resposta, apenas o texto bruto do JSON para que eu possa fazer o parse diretamente no backend.

Artigo:
Categoria/Área: ${category || "Geral"}
Título Atual: ${title || ""}
Conteúdo:
${content}`;
      } else if (action === "expand") {
        prompt = `Você é um advogado especialista e redator de conteúdo sênior para o blog de advocacia de Dr. Willemes Ferreira.
Expanda o seguinte rascunho, esboço ou tópicos em um artigo completo e informativo.
Siga estas regras:
1. Use linguagem elegante, profissional e informativa.
2. Divida o texto com subtítulos informativos usando '###'.
3. Se houver tópicos importantes, use listas simples iniciadas com '-'.
4. Destaque partes cruciais em negrito.
5. Torne a leitura acessível para o cidadão comum, mas com rigor técnico básico.

Tópicos/Esboço para expandir:
Título: ${title || "Artigo Jurídico"}
Área: ${category || "Direito Geral"}
Esboço:
${content}`;
      } else if (action === "custom") {
        prompt = `Você é um assistente de redação e consultor do blog de advocacia de Dr. Willemes Ferreira.
Atenda à seguinte instrução de edição no artigo de blog fornecido:
Instrução do usuário: "${instruction}"

Informações do Artigo:
Título: ${title || ""}
Área: ${category || ""}
Conteúdo:
${content}

Retorne APENAS o conteúdo modificado e refinado, sem comentários adicionais ou explicações.`;
      } else {
        return res.status(400).json({ error: "Ação inválida." });
      }

      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
      });

      const resultText = response.text;
      res.json({ text: resultText });
    } catch (error) {
      console.error("Gemini Assistant error:", error);
      res.status(500).json({ error: error instanceof Error ? error.message : "Erro desconhecido ao processar com IA." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
  });
}

startServer();
