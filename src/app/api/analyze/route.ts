import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const SYSTEM_PROMPT = `Tu es un expert en strategie Reddit pour les indie hackers et solopreneurs.

Ton objectif n'est PAS le marketing.
Ton objectif est d'aider les utilisateurs a poster sur Reddit SANS se faire bannir ou downvoter.

Regles que tu dois toujours suivre:
- Reddit deteste le langage marketing
- Considere chaque subreddit comme hostile a l'auto-promotion par defaut
- Privilegie l'humilite, la demande de feedback, et le partage d'experience
- Ne promets jamais de viralite ou de croissance
- Estime toujours les resultats de maniere conservative et realiste

Tu vas recevoir une URL de site SaaS et optionnellement une description.

Tu dois retourner un JSON valide (sans markdown, sans backticks) avec cette structure exacte:
{
  "websiteAnalysis": {
    "coreProblem": "Le probleme principal que resout ce produit (douleur utilisateur, pas les fonctionnalites)",
    "targetAudience": "L'audience cible",
    "maturityLevel": "early idea / MVP / launched"
  },
  "subreddits": [
    {
      "name": "NomDuSubreddit",
      "relevanceScore": 4,
      "moderationRisk": "Low",
      "recommendedAngle": "Feedback request",
      "explanation": "Pourquoi cet angle fonctionne ici"
    }
  ],
  "redditPost": {
    "title": "Titre du post Reddit (naturel, pas promotionnel)",
    "body": "Corps du post (ton naturel, pas de hype, pas d'emojis, pas de CTA marketing)"
  },
  "realisticEstimates": {
    "clicksRange": "10-30 clics",
    "commentsRange": "2-8 commentaires",
    "worthIt": true,
    "warning": "Avertissement honnete sur les attentes"
  }
}

IMPORTANT:
- Retourne UNIQUEMENT du JSON valide, rien d'autre
- moderationRisk doit etre "Low", "Medium" ou "High"
- relevanceScore doit etre un nombre entre 1 et 5
- Maximum 5 subreddits
- Le post doit etre en francais
- Sois honnete, meme si la conclusion est "ne postez pas ici"`;

async function fetchWebsiteContent(url: string): Promise<string> {
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; RedditStrategyBot/1.0)",
      },
    });
    
    if (!response.ok) {
      return `Impossible d'acceder au site (status ${response.status})`;
    }
    
    const html = await response.text();
    
    // Extraction basique du texte visible (titre, meta description, headings, paragraphes)
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const h1Matches = html.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = html.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    
    // Nettoyer les tags HTML des headings
    const cleanTag = (tag: string) => tag.replace(/<[^>]+>/g, "").trim();
    
    const content = {
      title: titleMatch ? titleMatch[1].trim() : "",
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : "",
      h1: h1Matches.slice(0, 3).map(cleanTag),
      h2: h2Matches.slice(0, 5).map(cleanTag),
    };
    
    return JSON.stringify(content);
  } catch (error) {
    console.error("Erreur fetch website:", error);
    return "Impossible d'acceder au site web";
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url, description } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "L'URL est requise" },
        { status: 400 }
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: "Cle API Gemini non configuree. Ajoutez GEMINI_API_KEY dans .env" },
        { status: 500 }
      );
    }

    // Recuperer le contenu du site web
    const websiteContent = await fetchWebsiteContent(url);

    // Construire le prompt utilisateur
    const userPrompt = `Analyse ce site SaaS et genere une strategie Reddit:

URL: ${url}
Contenu extrait du site: ${websiteContent}
${description ? `Description fournie par l'utilisateur: ${description}` : ""}

Retourne uniquement le JSON, sans aucun texte avant ou apres.`;

    // Appel a Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
    
    const result = await model.generateContent({
      contents: [
        {
          role: "user",
          parts: [{ text: SYSTEM_PROMPT + "\n\n" + userPrompt }],
        },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048,
      },
    });

    const response = result.response;
    const text = response.text();
    
    // Nettoyer la reponse (enlever les backticks markdown si presents)
    let cleanedText = text.trim();
    if (cleanedText.startsWith("```json")) {
      cleanedText = cleanedText.slice(7);
    } else if (cleanedText.startsWith("```")) {
      cleanedText = cleanedText.slice(3);
    }
    if (cleanedText.endsWith("```")) {
      cleanedText = cleanedText.slice(0, -3);
    }
    cleanedText = cleanedText.trim();

    // Parser le JSON
    const analysisResult = JSON.parse(cleanedText);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error("Erreur lors de l'analyse:", error);
    
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: "Erreur de parsing de la reponse IA. Veuillez reessayer." },
        { status: 500 }
      );
    }
    
    return NextResponse.json(
      { error: "Une erreur est survenue lors de l'analyse. Verifiez votre cle API." },
      { status: 500 }
    );
  }
}
