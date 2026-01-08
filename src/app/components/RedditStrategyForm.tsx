"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import {
  Loader2,
  Copy,
  Check,
  AlertTriangle,
  Target,
  Users,
  Layers,
  TrendingUp,
  MessageSquare,
  MousePointer,
  Shield,
  ShieldAlert,
  ShieldX,
} from "lucide-react";

interface AnalysisResult {
  websiteAnalysis: {
    coreProblem: string;
    targetAudience: string;
    maturityLevel: string;
  };
  subreddits: SubredditStrategy[];
  redditPost: {
    title: string;
    body: string;
  };
  realisticEstimates: {
    clicksRange: string;
    commentsRange: string;
    worthIt: boolean;
    warning: string;
  };
}

interface SubredditStrategy {
  name: string;
  relevanceScore: number;
  moderationRisk: "Low" | "Medium" | "High";
  recommendedAngle: string;
  explanation: string;
}

interface RedditStrategyFormProps {
  onAnalysisComplete?: () => void;
}

export default function RedditStrategyForm({ onAnalysisComplete }: RedditStrategyFormProps) {
  const t = useTranslations("form");
  const tResults = useTranslations("results");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setResult(null);

    if (!url.trim()) {
      setError(t("required"));
      return;
    }

    // Validation basique de l'URL
    try {
      new URL(url);
    } catch {
      setError(t("invalidUrl"));
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url, description }),
      });

      if (!response.ok) {
        throw new Error("Erreur lors de l'analyse");
      }

      const data = await response.json();
      setResult(data);
      onAnalysisComplete?.();
    } catch (err) {
      setError(t("error"));
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getRiskBadge = (risk: string) => {
    switch (risk) {
      case "Low":
        return {
          icon: <Shield className="w-3.5 h-3.5" />,
          class: "text-emerald-500 bg-emerald-500/15",
        };
      case "Medium":
        return {
          icon: <ShieldAlert className="w-3.5 h-3.5" />,
          class: "text-amber-500 bg-amber-500/15",
        };
      case "High":
        return {
          icon: <ShieldX className="w-3.5 h-3.5" />,
          class: "text-red-500 bg-red-500/15",
        };
      default:
        return {
          icon: <Shield className="w-3.5 h-3.5" />,
          class: "text-zinc-500 bg-zinc-500/15",
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-emerald-500";
    if (score >= 3) return "text-amber-500";
    return "text-red-500";
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(
      `${result?.redditPost.title}\n\n${result?.redditPost.body}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {t("urlLabel")} *
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder={t("urlPlaceholder")}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all"
            disabled={isLoading}
          />
        </div>

        <div>
          <label
            htmlFor="description"
            className="block text-sm font-medium text-zinc-300 mb-2"
          >
            {t("descriptionLabel")}
          </label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder={t("descriptionPlaceholder")}
            rows={4}
            className="w-full px-4 py-3 rounded-lg bg-zinc-900 text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-orange-500 transition-all resize-none"
            disabled={isLoading}
          />
        </div>

        {error && (
          <div className="p-4 rounded-lg bg-red-600/20 text-red-400 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-3 px-6 rounded-lg bg-orange-600 hover:bg-orange-500 disabled:bg-zinc-700 disabled:text-zinc-500 disabled:cursor-not-allowed text-white font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2 focus:ring-offset-zinc-950"
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              {t("loading")}
            </span>
          ) : (
            t("submit")
          )}
        </button>
      </form>

      {/* Résultats */}
      {result && (
        <div className="mt-12 space-y-8">
          {/* Analyse du site */}
          <section className="p-6 rounded-xl bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">
              {tResults("websiteAnalysis")}
            </h2>
            <dl className="space-y-5">
              <div className="flex items-start gap-3">
                <Target className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-zinc-400">
                    {tResults("coreProblem")}
                  </dt>
                  <dd className="mt-1 text-zinc-100">
                    {result.websiteAnalysis.coreProblem}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-zinc-400">
                    {tResults("targetAudience")}
                  </dt>
                  <dd className="mt-1 text-zinc-100">
                    {result.websiteAnalysis.targetAudience}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-5 h-5 text-orange-500 mt-0.5 shrink-0" />
                <div>
                  <dt className="text-sm font-medium text-zinc-400">
                    {tResults("maturityLevel")}
                  </dt>
                  <dd className="mt-1 text-zinc-100">
                    {result.websiteAnalysis.maturityLevel}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Subreddits recommandés */}
          <section className="p-6 rounded-xl bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">
              {tResults("subreddits")}
            </h2>
            <div className="space-y-4">
              {result.subreddits.map((sub, index) => {
                const riskBadge = getRiskBadge(sub.moderationRisk);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-zinc-800"
                  >
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="font-semibold text-orange-500">
                        r/{sub.name}
                      </h3>
                      <span
                        className={`text-sm font-medium ${getScoreColor(
                          sub.relevanceScore
                        )}`}
                      >
                        {tResults("relevance")}: {sub.relevanceScore}/5
                      </span>
                      <span
                        className={`text-xs px-2.5 py-1 rounded-md font-medium flex items-center gap-1.5 ${riskBadge.class}`}
                      >
                        {riskBadge.icon}
                        {tResults("risk")}: {sub.moderationRisk}
                      </span>
                    </div>
                    <p className="text-sm text-zinc-300 mb-2">
                      <span className="font-medium text-zinc-200">{tResults("recommendedAngle")}:</span>{" "}
                      {sub.recommendedAngle}
                    </p>
                    <p className="text-sm text-zinc-400">
                      {sub.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Post Reddit prêt */}
          <section className="p-6 rounded-xl bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">
              {tResults("redditPost")}
            </h2>
            <div className="p-5 rounded-lg bg-zinc-800">
              <h3 className="font-semibold text-zinc-100 mb-4 pb-4 border-b border-zinc-700">
                {result.redditPost.title}
              </h3>
              <div className="text-zinc-300 whitespace-pre-wrap text-sm leading-relaxed">
                {result.redditPost.body}
              </div>
            </div>
            <button
              onClick={handleCopy}
              className="mt-4 px-4 py-2 text-sm rounded-lg bg-zinc-800 text-zinc-300 hover:bg-zinc-700 transition-colors flex items-center gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500" />
                  {tResults("copied")}
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  {tResults("copy")}
                </>
              )}
            </button>
          </section>

          {/* Estimations réalistes */}
          <section className="p-6 rounded-xl bg-zinc-900">
            <h2 className="text-xl font-semibold text-zinc-100 mb-6">
              {tResults("estimates")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="p-4 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <MousePointer className="w-4 h-4 text-zinc-400" />
                  <p className="text-sm text-zinc-400">{tResults("clicks")}</p>
                </div>
                <p className="text-lg font-semibold text-zinc-100">
                  {result.realisticEstimates.clicksRange}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800">
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare className="w-4 h-4 text-zinc-400" />
                  <p className="text-sm text-zinc-400">{tResults("comments")}</p>
                </div>
                <p className="text-lg font-semibold text-zinc-100">
                  {result.realisticEstimates.commentsRange}
                </p>
              </div>
            </div>
            {result.realisticEstimates.warning && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 ${
                  result.realisticEstimates.worthIt
                    ? "bg-emerald-600/15 text-emerald-400"
                    : "bg-amber-600/15 text-amber-400"
                } text-sm`}
              >
                <TrendingUp className="w-5 h-5 shrink-0 mt-0.5" />
                <p>{result.realisticEstimates.warning}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
