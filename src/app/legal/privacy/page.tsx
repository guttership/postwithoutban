"use client";

import { useTranslations } from "next-intl";
import Navbar from "../../components/Navbar";

export default function PrivacyPage() {
  const t = useTranslations();
  const privacy = t.raw("legal.privacy") as {
    title: string;
    lastUpdated: string;
    section1: { title: string; content: string };
    section2: { title: string; content: string };
    section3: { title: string; content: string };
    section4: { title: string; content: string };
    section5: { title: string; content: string };
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-zinc-950 pt-32 pb-20 px-4">
        <div className="container mx-auto max-w-3xl">
          <h1 className="text-4xl font-bold text-zinc-100 mb-2">
            {privacy.title}
          </h1>
          <p className="text-sm text-zinc-500 mb-8">
            {privacy.lastUpdated}: 16 février 2026
          </p>

          <div className="space-y-8">
            {[
              privacy.section1,
              privacy.section2,
              privacy.section3,
              privacy.section4,
              privacy.section5,
            ].map((section, index) => (
              <div key={index}>
                <h2 className="text-2xl font-bold text-zinc-100 mb-3">
                  {section.title}
                </h2>
                <p className="text-zinc-400 leading-relaxed">
                  {section.content}
                </p>
              </div>
            ))}
          </div>

          {/* Contact Section */}
          <div className="mt-12 p-6 rounded-lg bg-zinc-900 border border-zinc-800">
            <h3 className="text-lg font-bold text-zinc-100 mb-2">
              Questions sur la confidentialité ?
            </h3>
            <p className="text-zinc-400 mb-4">
              Contactez-nous à{" "}
              <a
                href="mailto:designmoiunmouton@gmail.com"
                className="text-orange-500 hover:text-orange-400 transition-colors"
              >
                designmoiunmouton@gmail.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
