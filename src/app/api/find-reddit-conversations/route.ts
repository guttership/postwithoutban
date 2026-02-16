import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  score: number;
  num_comments: number;
  created_utc: number;
  subreddit: string;
  url: string;
  permalink: string;
  author: string;
}

interface ConversationGroup {
  subreddit: string;
  posts: {
    id: string;
    title: string;
    excerpt: string;
    score: number;
    comments: number;
    url: string;
    relevanceScore: number;
  }[];
}

export async function POST(request: NextRequest) {
  try {
    const { subreddits, problemDescription, accessToken } = await request.json() as {
      subreddits: string[];
      problemDescription: string;
      accessToken: string;
    };

    if (!accessToken || !subreddits || !problemDescription) {
      return NextResponse.json(
        { error: "Paramètres manquants" },
        { status: 400 }
      );
    }

    // Vérifier l'accès
    const purchase = await prisma.purchase.findUnique({
      where: { accessToken },
      include: { redditAccount: true },
    });

    if (!purchase?.redditAccount) {
      return NextResponse.json(
        { error: "Pas de connexion Reddit" },
        { status: 401 }
      );
    }

    // Vérifier que le token n'a pas expiré
    if (new Date() > purchase.redditAccount.expiresAt) {
      return NextResponse.json(
        { error: "Token Reddit expiré" },
        { status: 401 }
      );
    }

    const redditToken = purchase.redditAccount.accessToken;
    const conversationGroups: ConversationGroup[] = [];

    // Chercher dans chaque subreddit
    for (const subreddit of subreddits.slice(0, 8)) {
      try {
        const response = await fetch(
          `https://oauth.reddit.com/r/${subreddit}/new?limit=50&t=week`,
          {
            headers: {
              "Authorization": `Bearer ${redditToken}`,
              "User-Agent": "PostWithoutBan/1.0",
            },
          }
        );

        if (!response.ok) {
          console.warn(`Failed to fetch ${subreddit}:`, response.status);
          continue;
        }

        const data = await response.json() as {
          data: { children: Array<{ data: RedditPost }> };
        };

        if (!data.data?.children) continue;

        const relevantPosts = data.data.children
          .map((child) => child.data)
          .filter((post) => {
            // Filtrer les posts qui sont pertinents
            const text = `${post.title} ${post.selftext}`.toLowerCase();
            const keywords = [
              "problème",
              "difficulty",
              "struggling",
              "help",
              "besoin",
              "comment",
              "how do you",
              "does anyone",
              "question",
              "issue",
              "unable",
              "can't",
              "don't know",
            ];

            return keywords.some((keyword) => text.includes(keyword));
          })
          .slice(0, 5)
          .map((post) => ({
            id: post.id,
            title: post.title,
            excerpt:
              post.selftext.length > 200
                ? post.selftext.substring(0, 200) + "..."
                : post.selftext,
            score: post.score,
            comments: post.num_comments,
            url: `https://reddit.com${post.permalink}`,
            relevanceScore: Math.min(5, Math.ceil((post.num_comments / 10 + 1))),
          }));

        if (relevantPosts.length > 0) {
          conversationGroups.push({
            subreddit,
            posts: relevantPosts,
          });
        }
      } catch (error) {
        console.error(`Error fetching ${subreddit}:`, error);
      }
    }

    return NextResponse.json({
      success: true,
      conversationGroups,
      count: conversationGroups.reduce((acc, g) => acc + g.posts.length, 0),
    });
  } catch (error) {
    console.error("Find conversations error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Erreur lors de la recherche de conversations",
      },
      { status: 500 }
    );
  }
}
