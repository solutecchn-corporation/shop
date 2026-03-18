import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

/**
 * Obtiene las promociones activas hoy desde Supabase usando la función
 * `get_promociones_activas_hoy()` y devuelve un mapa
 * { [categoria_lowercase]: promocion } con la promo de mayor descuento
 * por categoría.
 */
export default function usePromotions() {
  const [promoMap, setPromoMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;

    async function load() {
      setLoading(true);
      try {
        const { data, error: rpcError } = await supabase.rpc(
          "get_promociones_activas_hoy",
        );

        if (rpcError) throw rpcError;

        const map = {};
        for (const promo of data || []) {
          if (!promo.categoria) continue;
          const key = promo.categoria.toLowerCase();
          // Si ya existe una promo para esa categoría, quedarse con la de mayor descuento
          if (
            !map[key] ||
            promo.porcentaje_descuento > map[key].porcentaje_descuento
          ) {
            map[key] = promo;
          }
        }

        if (mounted) setPromoMap(map);
      } catch (err) {
        if (mounted) setError(err);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    load();
    return () => {
      mounted = false;
    };
  }, []);

  return { promoMap, loading, error };
}
