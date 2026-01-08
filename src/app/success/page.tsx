import Link from "next/link";
import { Check, Mail } from "lucide-react";
import Navbar from "../components/Navbar";

export default function SuccessPage() {
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="w-20 h-20 rounded-full bg-emerald-600/20 flex items-center justify-center mx-auto mb-6">
            <Check className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-3xl font-bold text-zinc-100 mb-4">
            Paiement réussi !
          </h1>
          <p className="text-zinc-400 mb-6">
            Merci pour votre achat. Vous avez maintenant un accès à vie à Post
            Without Ban.
          </p>
          
          <div className="p-4 rounded-lg bg-zinc-900 mb-8">
            <div className="flex items-center justify-center gap-2 text-orange-500 mb-2">
              <Mail className="w-5 h-5" />
              <span className="font-medium">Vérifiez votre email</span>
            </div>
            <p className="text-sm text-zinc-400">
              Un lien d&apos;accès a été envoyé à votre adresse email. 
              Utilisez-le pour accéder à l&apos;application depuis n&apos;importe quel appareil.
            </p>
          </div>

          <p className="text-xs text-zinc-500 mb-4">
            Vous pouvez aussi attendre quelques secondes, votre session sera automatiquement activée.
          </p>
          
          <Link
            href="/app"
            className="inline-block px-8 py-4 text-lg font-medium rounded-lg bg-orange-600 hover:bg-orange-500 text-white transition-colors"
          >
            Accéder à l&apos;application
          </Link>
        </div>
      </div>
    </>
  );
}
