"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
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
  Circle,
  Zap,
  Code2,
  HeartHandshake,
} from "lucide-react";

interface AnalysisResult {
  websiteAnalysis: {
    coreProblem: string;
    targetAudience: string;
    maturityLevel: string;
  };
  subreddits: SubredditStrategy[];
  redditPost: {
    options: RedditPostOption[];
  };
  realisticEstimates: {
    clicksRange: string;
    commentsRange: string;
    worthIt: boolean;
    warning: string;
  };
}

interface RedditPostOption {
  riskLevel: string;
  title: string;
  body: string;
  explanation: string;
  expectedEngagement: string;
  bestSubreddits: string[];
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
  const locale = useLocale();
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [selectedPostIndex, setSelectedPostIndex] = useState(0);

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
        body: JSON.stringify({ url, description, language: locale }),
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
          icon: <Circle className="w-3 h-3 fill-emerald-400" />,
          class: "text-emerald-400 bg-zinc-800",
          label: "Faible",
        };
      case "Medium":
        return {
          icon: <Circle className="w-3 h-3 fill-orange-400" />,
          class: "text-orange-400 bg-zinc-800",
          label: "Moyen",
        };
      case "High":
        return {
          icon: <Circle className="w-3 h-3 fill-red-400" />,
          class: "text-red-400 bg-zinc-800",
          label: "Élevé",
        };
      default:
        return {
          icon: <Circle className="w-3 h-3 fill-zinc-500" />,
          class: "text-zinc-500 bg-zinc-800",
          label: risk,
        };
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 4) return "text-orange-400";
    if (score >= 3) return "text-zinc-300";
    return "text-zinc-500";
  };

  const handleCopy = () => {
    const selectedPost = result?.redditPost.options[selectedPostIndex];
    if (selectedPost) {
      navigator.clipboard.writeText(
        `${selectedPost.title}\n\n${selectedPost.body}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    switch (riskLevel) {
      case "very_safe":
        return {
          label: "Très sûr",
          icon: <Circle className="w-3 h-3 fill-emerald-400" />,
          class: "text-emerald-400 bg-zinc-800",
        };
      case "moderate":
        return {
          label: "Modéré",
          icon: <Circle className="w-3 h-3 fill-orange-400" />,
          class: "text-orange-400 bg-zinc-800",
        };
      case "bold":
        return {
          label: "Audacieux",
          icon: <Zap className="w-3 h-3" />,
          class: "text-orange-400 bg-zinc-800",
        };
      case "technical":
        return {
          label: "Technique",
          icon: <Code2 className="w-3 h-3" />,
          class: "text-zinc-200 bg-zinc-800",
        };
      case "community":
        return {
          label: "Communauté",
          icon: <HeartHandshake className="w-3 h-3" />,
          class: "text-zinc-200 bg-zinc-800",
        };
      default:
        return {
          label: riskLevel,
          icon: <Circle className="w-3 h-3 fill-zinc-500" />,
          class: "text-zinc-500 bg-zinc-800",
        };
    }
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
          <section className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              {tResults("websiteAnalysis")}
            </h2>
            <dl className="space-y-4">
              <div className="flex items-start gap-3">
                <Target className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <dt className="text-xs font-medium text-zinc-500 mb-1">
                    {tResults("coreProblem")}
                  </dt>
                  <dd className="text-sm text-zinc-300">
                    {result.websiteAnalysis.coreProblem}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Users className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <dt className="text-xs font-medium text-zinc-500 mb-1">
                    {tResults("targetAudience")}
                  </dt>
                  <dd className="text-sm text-zinc-300">
                    {result.websiteAnalysis.targetAudience}
                  </dd>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" />
                <div className="flex-1">
                  <dt className="text-xs font-medium text-zinc-500 mb-1">
                    {tResults("maturityLevel")}
                  </dt>
                  <dd className="text-sm text-zinc-300">
                    {result.websiteAnalysis.maturityLevel}
                  </dd>
                </div>
              </div>
            </dl>
          </section>

          {/* Subreddits recommandés */}
          <section className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              {tResults("subreddits")}
            </h2>
            <div className="space-y-3">
              {result.subreddits.map((sub, index) => {
                const riskBadge = getRiskBadge(sub.moderationRisk);
                return (
                  <div
                    key={index}
                    className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800 hover:border-zinc-700 transition-colors"
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                      <h3 className="font-semibold text-orange-400 text-sm">
                        r/{sub.name}
                      </h3>
                      <span
                        className={`text-xs font-medium ${getScoreColor(
                          sub.relevanceScore
                        )}`}
                      >
                        {sub.relevanceScore}/5
                      </span>
                      <span
                        className={`text-xs px-2 py-0.5 rounded font-medium flex items-center gap-1 ${riskBadge.class}`}
                      >
                        {riskBadge.icon}
                        {riskBadge.label}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-400 mb-2">
                      <span className="text-zinc-300">{sub.recommendedAngle}</span>
                    </p>
                    <p className="text-xs text-zinc-500 leading-relaxed">
                      {sub.explanation}
                    </p>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Posts Reddit prêts - 5 options */}
          <section className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              {tResults("redditPost")}
            </h2>
            
            {/* Sélecteur d'options */}
            <div className="flex flex-wrap gap-2 mb-6">
              {result.redditPost.options.map((option, index) => {
                const badge = getRiskLevelBadge(option.riskLevel);
                const isSelected = selectedPostIndex === index;
                return (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedPostIndex(index);
                      setCopied(false);
                    }}
                    className={`px-3 py-2 rounded-lg text-xs font-medium transition-all border ${
                      isSelected
                        ? "bg-orange-600 text-white border-orange-600"
                        : "bg-zinc-800/50 text-zinc-400 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300"
                    }`}
                  >
                    <span className="flex items-center gap-1.5">
                      {badge.icon}
                      {badge.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Post sélectionné */}
            {result.redditPost.options[selectedPostIndex] && (
              <>
                <div className="p-5 rounded-lg bg-zinc-800/50 border border-zinc-800 mb-4">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b border-zinc-800">
                    <span className="text-xs text-zinc-500">
                      {result.redditPost.options[selectedPostIndex].expectedEngagement}
                    </span>
                  </div>
                  <h3 className="font-medium text-zinc-100 mb-4 text-base">
                    {result.redditPost.options[selectedPostIndex].title}
                  </h3>
                  <div className="text-zinc-400 whitespace-pre-wrap text-sm leading-relaxed mb-4">
                    {result.redditPost.options[selectedPostIndex].body}
                  </div>
                  <div className="pt-4 mt-4 border-t border-zinc-800">
                    <p className="text-xs text-zinc-500 mb-2">Stratégie :</p>
                    <p className="text-xs text-zinc-400 leading-relaxed">
                      {result.redditPost.options[selectedPostIndex].explanation}
                    </p>
                  </div>
                  {result.redditPost.options[selectedPostIndex].bestSubreddits.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <p className="text-xs text-zinc-500 mb-2">Subreddits recommandés :</p>
                      <div className="flex flex-wrap gap-2">
                        {result.redditPost.options[selectedPostIndex].bestSubreddits.map((sub, idx) => (
                          <span key={idx} className="text-xs px-2 py-1 rounded bg-zinc-800 text-orange-400 font-mono">
                            {sub}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 text-sm rounded-lg bg-zinc-800/50 border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:bg-zinc-800 transition-all flex items-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-orange-400" />
                      <span className="text-orange-400">{tResults("copied")}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      {tResults("copy")}
                    </>
                  )}
                </button>
              </>
            )}
          </section>

          {/* Estimations réalistes */}
          <section className="p-6 rounded-xl bg-zinc-900/50 border border-zinc-800">
            <h2 className="text-lg font-medium text-zinc-100 mb-4">
              {tResults("estimates")}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <MousePointer className="w-3.5 h-3.5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">{tResults("clicks")}</p>
                </div>
                <p className="text-base font-medium text-zinc-200">
                  {result.realisticEstimates.clicksRange}
                </p>
              </div>
              <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-800">
                <div className="flex items-center gap-2 mb-1">
                  <MessageSquare className="w-3.5 h-3.5 text-zinc-500" />
                  <p className="text-xs text-zinc-500">{tResults("comments")}</p>
                </div>
                <p className="text-base font-medium text-zinc-200">
                  {result.realisticEstimates.commentsRange}
                </p>
              </div>
            </div>
            {result.realisticEstimates.warning && (
              <div
                className={`p-4 rounded-lg flex items-start gap-3 border ${
                  result.realisticEstimates.worthIt
                    ? "bg-orange-950/20 border-orange-900/30 text-orange-300"
                    : "bg-zinc-800/50 border-zinc-800 text-zinc-400"
                } text-xs`}
              >
                <TrendingUp className="w-4 h-4 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{result.realisticEstimates.warning}</p>
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
