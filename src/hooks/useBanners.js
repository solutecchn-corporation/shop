import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Obtiene los banners activos y ordenados desde la tabla `banners_promocionales`.
 * Solo retorna banners donde:
 *   activo = true
 *   Y (fecha_inicio IS NULL OR fecha_inicio <= hoy)
 *   Y (fecha_fin   IS NULL OR fecha_fin   >= hoy)
 */
export default function useBanners() {
  const [banners, setBanners] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const today = new Date().toISOString().split("T")[0];

        const { data, error } = await supabase
          .from("banners_promocionales")
          .select("id, titulo, subtitulo, imagen_url, enlace, orden")
          .eq("activo", true)
          .or(`fecha_inicio.is.null,fecha_inicio.lte.${today}`)
          .or(`fecha_fin.is.null,fecha_fin.gte.${today}`)
          .order("orden", { ascending: true });

        if (error) throw error;
        if (mounted) setBanners(data || []);
      } catch (err) {
        console.warn("banners_promocionales:", err?.message);
        if (mounted) setBanners([]);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { banners, loading };
}
