"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check, Mail, Loader2, AlertCircle } from "lucide-react";

const POLLING_INTERVAL = 2000; // 2 secondes
const MAX_POLLING_TIME = 30000; // 30 secondes

export default function SuccessContent() {
  const router = useRouter();
  const [status, setStatus] = useState<"checking" | "ready" | "timeout">("checking");
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let timeElapsed = 0;

    const checkAccess = async () => {
      try {
        const response = await fetch("/api/access");
        const data = await response.json();

        if (data.valid) {
          setStatus("ready");
          clearInterval(intervalId);
          clearTimeout(timeoutId);
          
          // Rediriger vers /app après 1 seconde
          setTimeout(() => {
            router.push("/app");
          }, 1000);
        }
      } catch (error) {
        console.error("Error checking access:", error);
      }
    };

    // Vérifier immédiatement
    checkAccess();

    // Polling toutes les 2 secondes
    const intervalId = setInterval(() => {
      timeElapsed += POLLING_INTERVAL;
      setElapsedTime(timeElapsed);
      
      if (timeElapsed < MAX_POLLING_TIME) {
        checkAccess();
      }
    }, POLLING_INTERVAL);

    // Timeout après 30 secondes
    const timeoutId = setTimeout(() => {
      if (status === "checking") {
        setStatus("timeout");
        clearInterval(intervalId);
      }
    }, MAX_POLLING_TIME);

    return () => {
      clearInterval(intervalId);
      clearTimeout(timeoutId);
    };
  }, [router, status]);

  if (status === "checking") {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-orange-600/20 flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-10 h-10 text-orange-500 animate-spin" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">
            Activation en cours...
          </h1>
          <p className="text-zinc-400 mb-6">
            Nous activons votre accès. Cela ne prendra que quelques secondes.
          </p>
          
          <div className="p-4 rounded-lg bg-zinc-900 mb-4">
            <p className="text-sm text-zinc-400">
              Temps écoulé : {Math.floor(elapsedTime / 1000)}s
            </p>
          </div>

          <p className="text-xs text-zinc-500">
            Vous allez être redirigé automatiquement...
          </p>
        </div>
      </div>
    );
  }

  if (status === "timeout") {
    return (
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-yellow-600/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">
            Activation en cours
          </h1>
          <p className="text-zinc-400 mb-6">
            L&apos;activation prend plus de temps que prévu. Ne vous inquiétez pas, votre paiement a bien été reçu.
          </p>
          
          <div className="p-4 rounded-lg bg-zinc-900 mb-8">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Vérifiez votre email</span>
            </div>
            <p className="text-sm text-zinc-400">
              Un lien d&apos;accès vous a été envoyé par email. 
              Vous pouvez l&apos;utiliser dès maintenant pour accéder à Post Without Ban.
            </p>
          </div>

          <div className="flex flex-col gap-3">
            <Link
              href="/app"
              className="inline-block px-8 py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
            >
              Accéder à l&apos;application
            </Link>
            <p className="text-xs text-zinc-500">
              Si le problème persiste après quelques minutes, contactez le support.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Status = ready
  return (
    <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 flex items-center justify-center">
      <div className="text-center max-w-md">
        <div className="w-20 h-20 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-6">
          <Check className="w-10 h-10 text-emerald-500" />
        </div>
        <h1 className="text-3xl font-bold text-zinc-100 mb-4">
          Accès activé !
        </h1>
        <p className="text-zinc-400 mb-6">
          Votre accès à Post Without Ban est maintenant actif. Redirection en cours...
        </p>
        
        <Loader2 className="w-8 h-8 text-orange-500 animate-spin mx-auto" />
      </div>
    </div>
  );
}
