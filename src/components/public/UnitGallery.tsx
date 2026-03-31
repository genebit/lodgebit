"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

interface UnitImageRow {
  id: string;
  image_url: string;
  is_cover: boolean;
  sort_order: number | null;
  caption: string | null;
}

interface UnitWithImages {
  id: string;
  name: string;
  unit_images: UnitImageRow[];
}

interface UnitGalleryProps {
  units: UnitWithImages[];
}

/* Bento span classes by image index within the unit's image list */
function spanClass(idx: number): string {
  if (idx === 0) return "col-span-2 row-span-2";
  if (idx === 5) return "row-span-2";
  if (idx === 6) return "col-span-2";
  return "";
}

export default function UnitGallery({ units }: UnitGalleryProps) {
  const [activeId, setActiveId] = useState<string>(units[0]?.id ?? "");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  const activeUnit = units.find((u) => u.id === activeId) ?? units[0];
  const images = activeUnit?.unit_images ?? [];

  const openLightbox = (idx: number) => setLightboxIdx(idx);
  const closeLightbox = () => setLightboxIdx(null);

  const goPrev = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i - 1 + images.length) % images.length));
  }, [images.length]);

  const goNext = useCallback(() => {
    setLightboxIdx((i) => (i === null ? null : (i + 1) % images.length));
  }, [images.length]);

  /* Keyboard navigation */
  useEffect(() => {
    if (lightboxIdx === null) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [lightboxIdx, goPrev, goNext]);

  /* Lock body scroll while lightbox is open */
  useEffect(() => {
    document.body.style.overflow = lightboxIdx !== null ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightboxIdx]);

  /* Reset lightbox index when switching units */
  const handleTabSwitch = (id: string) => {
    setLightboxIdx(null);
    setActiveId(id);
  };

  if (units.length === 0) {
    return <p className="text-gray-400 text-sm text-center py-8">No units available yet.</p>;
  }

  const currentImage = lightboxIdx !== null ? images[lightboxIdx] : null;

  return (
    <>
      <div>
        {units.length > 1 && (
          <div className="flex flex-wrap gap-2 mb-6 bg-slate-100 p-2 rounded-xl w-max">
            {units.map((u) => (
              <button
                key={u.id}
                type="button"
                onClick={() => handleTabSwitch(u.id)}
                className={`px-8 py-1.5 rounded-lg text-sm font-medium transition-all ${
                  u.id === activeId ? "bg-[#1e3a5f] text-white shadow-sm" : "bg-white text-gray-600 hover:bg-gray-200"
                }`}
              >
                {u.name}
              </button>
            ))}
          </div>
        )}

        {images.length === 0 ? (
          <p className="text-gray-400 text-sm text-center py-8">No photos for this unit yet.</p>
        ) : (
          <div className="grid grid-cols-3 auto-rows-[160px] sm:auto-rows-[200px] gap-3">
            {images.map((img, idx) => (
              <button
                key={img.id}
                type="button"
                onClick={() => openLightbox(idx)}
                className={`relative rounded-3xl overflow-hidden cursor-zoom-in group ${spanClass(idx)}`}
              >
                <Image
                  src={img.image_url}
                  alt={img.caption ?? activeUnit?.name ?? "Unit photo"}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                  sizes="(max-width: 768px) 50vw, 33vw"
                />
                <span className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 rounded-3xl" />
              </button>
            ))}
          </div>
        )}
      </div>

      {currentImage && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
          onClick={closeLightbox}
        >
          <div className="absolute top-4 left-1/2 -translate-x-1/2 text-white/60 text-sm font-medium tabular-nums select-none">
            {(lightboxIdx ?? 0) + 1} / {images.length}
          </div>

          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              className="absolute left-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Previous"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <div
            className="relative w-full max-w-4xl max-h-[85vh] mx-16 aspect-[4/3]"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={currentImage.image_url}
              alt={currentImage.caption ?? activeUnit?.name ?? "Unit photo"}
              fill
              className="object-contain"
              sizes="100vw"
              priority
            />
          </div>

          {currentImage.caption && (
            <p className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-sm text-center max-w-sm px-4">
              {currentImage.caption}
            </p>
          )}

          {images.length > 1 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              className="absolute right-4 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              aria-label="Next"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {images.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-1.5">
              {images.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIdx(i);
                  }}
                  className={`w-1.5 h-1.5 rounded-full transition-all ${
                    i === lightboxIdx ? "bg-white w-4" : "bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Go to image ${i + 1}`}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </>
  );
}
