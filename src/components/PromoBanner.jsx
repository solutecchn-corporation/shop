import React from "react";
import useBanners from "../hooks/useBanners";

/**
 * Banner de promociones con desplazamiento horizontal infinito.
 * Las imágenes se obtienen de Supabase (tabla banners_promocionales).
 * Se duplican para crear el efecto de loop sin cortes.
 */
export default function PromoBanner() {
  const { banners, loading } = useBanners();

  // No mostrar nada si no hay banners ni cargando
  if (!loading && banners.length === 0) return null;

  // Fallback mientras carga → skeleton
  if (loading) {
    return (
      <div className="promo-banner-wrap">
        <div className="promo-banner-skeleton" />
      </div>
    );
  }

  // Duplicar para loop infinito sin salto visible
  const track = [...banners, ...banners];

  return (
    <div className="promo-banner-wrap" aria-label="Promociones activas">
      <div className="promo-banner-inner">
        {/* Máscara de fade en los bordes */}
        <div className="promo-banner-fade-left" />
        <div className="promo-banner-fade-right" />

        <div
          className="promo-banner-track"
          style={{ "--count": banners.length }}
        >
          {track.map((b, i) => (
            <div
              key={`${b.id}-${i}`}
              className="promo-banner-slide"
              onClick={() => b.enlace && window.open(b.enlace, "_blank")}
              style={{ cursor: b.enlace ? "pointer" : "default" }}
            >
              <img
                src={b.imagen_url}
                alt={b.titulo || "Promoción"}
                className="promo-banner-img"
                loading="eager"
                draggable={false}
              />
              {(b.titulo || b.subtitulo) && (
                <div className="promo-banner-caption">
                  {b.titulo && <strong>{b.titulo}</strong>}
                  {b.subtitulo && <span>{b.subtitulo}</span>}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
