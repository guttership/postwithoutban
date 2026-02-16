"use client";

import { useGeolocation } from "@/hooks/useGeolocation";

export function GeolocationDetector() {
  // Ce hook s'exécute et définit la langue automatiquement
  useGeolocation();
  
  return null; // Composant invisible, juste pour la logique
}
