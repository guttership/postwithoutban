import { NextRequest, NextResponse } from "next/server";
import Groq from "groq-sdk";
import OpenAI from "openai";
import { verifyAccessToken, updateAccessStats } from "@/lib/auth";
import { getSystemPrompt, getUserPrompt } from "@/lib/prompts";

// Initialisation des clients API
const groq = process.env.GROQ_API_KEY ? new Groq({
  apiKey: process.env.GROQ_API_KEY,
}) : null;

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;


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
    
    // Fonction pour nettoyer les tags HTML et decoder les entites
    const cleanTag = (tag: string) => {
      return tag
        .replace(/<[^>]+>/g, "") // Enlever tags HTML
        .replace(/&nbsp;/g, " ") // Decoder entites
        .replace(/&amp;/g, "&")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/\s+/g, " ") // Normaliser espaces
        .trim();
    };
    
    // Extraire le body content (on ignore header, footer, nav, script, style)
    const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
    let bodyContent = bodyMatch ? bodyMatch[1] : html;
    
    // Nettoyer le contenu (enlever scripts, styles, nav, footer)
    bodyContent = bodyContent
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<nav[^>]*>[\s\S]*?<\/nav>/gi, "")
      .replace(/<footer[^>]*>[\s\S]*?<\/footer>/gi, "")
      .replace(/<header[^>]*>[\s\S]*?<\/header>/gi, "");
    
    // Extraction enrichie
    const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    const metaDescMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["']/i);
    const ogTitleMatch = html.match(/<meta[^>]*property=["']og:title["'][^>]*content=["']([^"']+)["']/i);
    const ogDescMatch = html.match(/<meta[^>]*property=["']og:description["'][^>]*content=["']([^"']+)["']/i);
    
    // Headings
    const h1Matches = bodyContent.match(/<h1[^>]*>([^<]+)<\/h1>/gi) || [];
    const h2Matches = bodyContent.match(/<h2[^>]*>([^<]+)<\/h2>/gi) || [];
    const h3Matches = bodyContent.match(/<h3[^>]*>([^<]+)<\/h3>/gi) || [];
    
    // Paragraphes (on prend les 10 premiers significatifs)
    const pMatches = bodyContent.match(/<p[^>]*>[\s\S]*?<\/p>/gi) || [];
    const paragraphs = pMatches
      .map(cleanTag)
      .filter(p => p.length > 30) // Ignore les paragraphes trop courts
      .slice(0, 10);
    
    // Listes (ul/ol) - souvent utilisees pour les features
    const listMatches = bodyContent.match(/<(?:ul|ol)[^>]*>([\s\S]*?)<\/(?:ul|ol)>/gi) || [];
    const bulletPoints: string[] = [];
    listMatches.slice(0, 3).forEach(list => {
      const items = list.match(/<li[^>]*>([\s\S]*?)<\/li>/gi) || [];
      items.forEach(item => {
        const cleaned = cleanTag(item);
        if (cleaned.length > 10 && cleaned.length < 200) {
          bulletPoints.push(cleaned);
        }
      });
    });
    
    // Call-to-Actions (boutons, liens avec des classes communes)
    const ctaMatches = bodyContent.match(/<(?:a|button)[^>]*(?:class=["'][^"']*(?:btn|button|cta|action|primary|signup|start|try|demo)[^"']*["'])[^>]*>([^<]+)<\/(?:a|button)>/gi) || [];
    const ctas = ctaMatches
      .map(cleanTag)
      .filter(cta => cta.length > 0 && cta.length < 50)
      .slice(0, 5);
    
    // Recherche de pricing keywords dans le texte
    const pricingPattern = /([\$€£]\d+|gratuit|free|trial|essai|\d+[€$£]?\s*(?:\/|par)\s*(?:mois|month|an|year)|pricing|tarif)/gi;
    const pricingMatches = bodyContent.match(pricingPattern) || [];
    const hasPricing = pricingMatches.length > 0;
    
    // Extraction des mots-cles recurrents (feature keywords)
    const textContent = cleanTag(bodyContent);
    const words = textContent.toLowerCase().split(/\s+/);
    const wordFreq: Record<string, number> = {};
    const stopWords = new Set(['le', 'la', 'les', 'un', 'une', 'des', 'de', 'du', 'et', 'ou', 'mais', 'pour', 'avec', 'sans', 'sur', 'dans', 'par', 'the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'to', 'of', 'in', 'on', 'at', 'is', 'are', 'was', 'were', 'your', 'you', 'that', 'this', 'it', 'be', 'have', 'has']);
    
    words.forEach(word => {
      if (word.length > 4 && !stopWords.has(word) && /^[a-z]+$/.test(word)) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const topKeywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([word]) => word);
    
    // Recherche de social proof (nombres, stats, testimonials)
    const statsPattern = /(\d+[k|K|M]?\+?\s*(?:users|clients|customers|entreprises|companies|downloads|telechargements))/gi;
    const statsMatches = bodyContent.match(statsPattern) || [];
    
    // Tentative d'identifier la value proposition (souvent dans le hero)
    const heroPattern = /<(?:div|section)[^>]*(?:class|id)=["'][^"']*(?:hero|banner|jumbotron|main|landing)[^"']*["'][^>]*>([\s\S]{0,500})<\/(?:div|section)>/i;
    const heroMatch = bodyContent.match(heroPattern);
    const heroText = heroMatch ? cleanTag(heroMatch[1]).slice(0, 300) : "";
    
    const content = {
      title: titleMatch ? titleMatch[1].trim() : "",
      metaDescription: metaDescMatch ? metaDescMatch[1].trim() : "",
      ogTitle: ogTitleMatch ? ogTitleMatch[1].trim() : "",
      ogDescription: ogDescMatch ? ogDescMatch[1].trim() : "",
      h1: h1Matches.slice(0, 3).map(cleanTag),
      h2: h2Matches.slice(0, 6).map(cleanTag),
      h3: h3Matches.slice(0, 4).map(cleanTag),
      paragraphs: paragraphs,
      bulletPoints: bulletPoints.slice(0, 15),
      ctas: ctas,
      hasPricing: hasPricing,
      pricingKeywords: [...new Set(pricingMatches)].slice(0, 5),
      topKeywords: topKeywords,
      socialProof: statsMatches.slice(0, 3),
      valueProposition: heroText || paragraphs[0] || "",
      wordCount: words.length,
    };
    
    return JSON.stringify(content, null, 2);
  } catch (error) {
    console.error("Erreur fetch website:", error);
    return "Impossible d'acceder au site web";
  }
}

export async function POST(request: NextRequest) {
  try {
    // Vérification de sécurité : vérifier le token d'accès
    const referer = request.headers.get("referer") || "";
    const isDemoRequest = referer.includes("/demo");

    // Si ce n'est pas une requête depuis /demo, vérifier le token
    if (!isDemoRequest) {
      const accessToken = request.cookies.get("pwb_access")?.value;
      const accessCheck = await verifyAccessToken(accessToken);

      if (!accessCheck.valid) {
        console.warn("[Security] API analyze called without valid access token");
        return NextResponse.json(
          { error: "Accès non autorisé. Vous devez avoir un accès actif pour utiliser cette fonctionnalité." },
          { status: 401 }
        );
      }

      // Mettre à jour les stats d'accès
      if (accessCheck.purchaseId) {
        await updateAccessStats(accessCheck.purchaseId);
      }
    }

    const { url, description, language } = await request.json();

    if (!url) {
      return NextResponse.json(
        { error: "L'URL est requise" },
        { status: 400 }
      );
    }

    // Déterminer la langue (défaut: 'fr')
    const lang = language === 'en' ? 'en' : 'fr';

    // Recuperer le contenu du site web
    const websiteContent = await fetchWebsiteContent(url);

    // Construire le prompt utilisateur enrichi avec la bonne langue
    const userPrompt = getUserPrompt(url, description, websiteContent, lang);

    // Récupérer le système prompt dans la bonne langue
    const systemPromptContent = getSystemPrompt(lang);

    // Fonction pour appeler l'API (OpenAI ou Groq)
    let text = "";
    
    // Priorité à OpenAI si disponible, sinon Groq
    if (openai) {
      console.log("[API] Utilisation d'OpenAI");
      const completion = await openai.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPromptContent,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "gpt-4o-mini", // Modèle économique et performant
        temperature: 0.8,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      });
      text = completion.choices[0]?.message?.content || "";
    } else if (groq) {
      console.log("[API] Utilisation de Groq");
      const completion = await groq.chat.completions.create({
        messages: [
          {
            role: "system",
            content: systemPromptContent,
          },
          {
            role: "user",
            content: userPrompt,
          },
        ],
        model: "llama-3.3-70b-versatile",
        temperature: 0.8,
        max_tokens: 8192,
        response_format: { type: "json_object" },
      });
      text = completion.choices[0]?.message?.content || "";
    } else {
      return NextResponse.json(
        { error: "Aucune clé API configurée. Ajoutez OPENAI_API_KEY ou GROQ_API_KEY dans .env" },
        { status: 500 }
      );
    }
    
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
