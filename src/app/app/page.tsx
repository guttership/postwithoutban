import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import Navbar from "../components/Navbar";
import RedditStrategyForm from "../components/RedditStrategyForm";
import { verifyAccessToken } from "@/lib/auth";

export default async function AppPage() {
  // Vérification serveur du token d'accès
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("pwb_access")?.value;
  
  const accessCheck = await verifyAccessToken(accessToken);

  // Si pas d'accès valide, rediriger vers pricing
  if (!accessCheck.valid) {
    redirect("/pricing");
  }

  const userEmail = accessCheck.email;

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-3xl sm:text-4xl font-bold text-zinc-100 mb-4">
              Post Without Ban
            </h1>
            <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
              <TranslatedSubtitle />
            </p>
            {userEmail && (
              <p className="text-sm text-zinc-500 mt-2">
                Connecté : {userEmail}
              </p>
            )}
          </div>

          {/* Avertissement */}
          <div className="mb-8 p-4 rounded-lg bg-zinc-900/50 border border-orange-600/30 text-orange-400 text-sm flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <WarningContent />
            </div>
          </div>

          {/* Formulaire */}
          <RedditStrategyForm />
        </div>
      </div>
    </>
  );
}

// Composants client pour les traductions
function TranslatedSubtitle() {
  const t = useTranslations();
  return <>{t("hero.subtitle")}</>;
}

function WarningContent() {
  const t = useTranslations();
  return (
    <>
      <p className="font-medium mb-1">{t("warning.title")}</p>
      <p className="text-orange-400/80">{t("warning.message")}</p>
    </>
  );
}
