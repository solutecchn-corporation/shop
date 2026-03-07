import React, { useEffect, useMemo, useState } from "react";
import { resolveProductImageCandidates } from "../lib/productMedia";

export default function ProductImage({
  image,
  title,
  imgClassName = "",
  fallbackClassName = "product-placeholder",
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [failed, setFailed] = useState(false);

  const sources = useMemo(() => resolveProductImageCandidates(image), [image]);
  const src = sources[currentIndex] || "";
  const label = title || "Producto";

  useEffect(() => {
    setCurrentIndex(0);
    setFailed(false);
  }, [image]);

  if (!src || failed) {
    return (
      <div className={fallbackClassName}>{label.charAt(0).toUpperCase()}</div>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      className={imgClassName}
      loading="lazy"
      onError={() => {
        if (currentIndex < sources.length - 1) {
          setCurrentIndex((index) => index + 1);
          return;
        }

        setFailed(true);
      }}
    />
  );
}
