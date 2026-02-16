"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminAccessPage() {
  const router = useRouter();
  const [status, setStatus] = useState("activating");
  
  useEffect(() => {
    // Activer le cookie automatiquement
    const token = "be35e780-ce74-4b41-9a02-0dd2e6d9c1bb";
    
    // Définir le cookie avec Secure si HTTPS
    const isSecure = window.location.protocol === "https:";
    const secureFlag = isSecure ? "; Secure" : "";
    document.cookie = `pwb_access=${token}; path=/; max-age=31536000; SameSite=Lax${secureFlag}`;
    
    console.log("Cookie pwb_access défini:", document.cookie);
    
    // Vérifier que le cookie est bien défini de manière async
    setTimeout(() => {
      const cookies = document.cookie;
      console.log("Vérification du cookie:", cookies);
      if (cookies.includes(token)) {
        setStatus("success");
        // Rediriger vers /demo après 2 secondes pour tester
        setTimeout(() => {
          router.push("/demo");
        }, 2000);
      } else {
        setStatus("error");
      }
    }, 100);
  }, [router]);

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-zinc-900 rounded-xl p-8 border border-zinc-800 text-center">
        {status === "activating" && (
          <>
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              Activation de l&apos;accès illimité...
            </h1>
            <p className="text-zinc-400">
              Configuration de votre cookie d&apos;accès
            </p>
          </>
        )}
        
        {status === "success" && (
          <>
            <div className="text-green-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              ✅ Accès illimité activé !
            </h1>
            <p className="text-zinc-400 mb-4">
              Redirection vers l&apos;application...
            </p>
            <div className="text-sm text-zinc-500">
              Cookie: pwb_access configuré pour 1 an
            </div>
          </>
        )}
        
        {status === "error" && (
          <>
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-zinc-100 mb-2">
              ❌ Erreur d&apos;activation
            </h1>
            <p className="text-zinc-400 mb-4">
              Le cookie n&apos;a pas pu être défini
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-500"
            >
              Réessayer
            </button>
          </>
        )}
      </div>
    </div>
  );
}
