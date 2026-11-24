/* =====================================================================
   GHOSTING DETECTOR™ · Configuración de conexión con Supabase
   ---------------------------------------------------------------------
   Completá estos dos valores con los de tu proyecto:
   Supabase → Project Settings → API Keys (o "Data API")

   · SUPABASE_URL: la "Project URL" (https://xxxx.supabase.co)
   · SUPABASE_KEY: la clave PÚBLICA ("publishable" sb_publishable_…
     o la "anon public" legacy que empieza con eyJ…).

   NUNCA pegues acá la "secret" ni la "service_role": esa clave saltea
   la seguridad de la base y este archivo es público.

   Mientras estén vacíos, el cuestionario se puede recorrer pero NO se
   guarda nada, y la web lo avisa en pantalla.
   ===================================================================== */
window.GD_CONFIG = {
NEXT_PUBLIC_SUPABASE_URL=https://pnzysbjqfsibjvycpblu.supabase.co,
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_LSzNCjzAxuLdE8Hym_yOQA_Dhq2JJ_d,
  // Cada cuántos segundos se refrescan los resultados públicos
  RESULTS_REFRESH_SECONDS: 30
};
