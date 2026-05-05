import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

function normalizeProduct(item) {
  const firstPrice = Array.isArray(item.precios) ? item.precios[0] : null;

  return {
    id: item.id,
    title: item.nombre,
    category: item.categoria || item.tipo || "Sin categoría",
    brand: item.marca || "",
    model: item.modelo || "",
    description: item.descripcion || "Sin descripción disponible.",
    image: item.imagen || "",
    price: Number(firstPrice?.precio || 0),
    sku: item.sku,
    stock: Number(item.stock || 0),
    barcode: item.codigo_barras || "",
    type: item.tipo || "producto",
    webPublished: Boolean(item.publicacion_web),
  };
}

export default function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      if (mounted) setError(null);

      try {
        const { data, error } = await supabase
          .from("inventario")
          .select(
            `
            id,
            nombre,
            sku,
            codigo_barras,
            categoria,
            marca,
            descripcion,
            modelo,
            publicacion_web,
            imagen,
            tipo,
            creado_en,
            precios(precio)
          `,
          )
          .eq("publicacion_web", true)
          .order("creado_en", { ascending: false });

        if (error) throw error;

        const productsData = data || [];
        const productIds = productsData.map((item) => item.id).filter(Boolean);

        let stockByProductId = {};
        if (productIds.length) {
          const { data: stockData, error: stockError } = await supabase
            .from("vista_stock_simple")
            .select("producto_id, stock")
            .in("producto_id", productIds);

          if (stockError) throw stockError;

          stockByProductId = (stockData || []).reduce((acc, row) => {
            acc[row.producto_id] = Number(row.stock || 0);
            return acc;
          }, {});
        }

        const normalizedProducts = productsData.map((item) =>
          normalizeProduct({
            ...item,
            stock: stockByProductId[item.id] ?? 0,
          }),
        );

        if (mounted) setProducts(normalizedProducts);
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

  return { products, loading, error };
}
