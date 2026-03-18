"use client";
import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

export function ImageGallery({ images, title, emoji }: { images: string[]; title: string; emoji?: string }) {
  const [current, setCurrent] = useState(0);

  if (!images?.length) return (
    <div className="gallery">
      <div className="gallery__main">
        <div className="gallery__main-no">{emoji ?? "📦"}</div>
      </div>
    </div>
  );

  const prev = () => setCurrent(i => (i - 1 + images.length) % images.length);
  const next = () => setCurrent(i => (i + 1) % images.length);

  return (
    <div className="gallery">
      <div className="gallery__main">
        <Image src={images[current]} alt={`${title} — image ${current + 1}`} fill className="gallery__main-img" sizes="(max-width:1024px) 100vw, 66vw" priority />
        {images.length > 1 && (
          <>
            <button className="gallery__nav-btn gallery__nav-btn--prev" onClick={prev} aria-label="Previous"><ChevronLeft size={18} /></button>
            <button className="gallery__nav-btn gallery__nav-btn--next" onClick={next} aria-label="Next"><ChevronRight size={18} /></button>
            <span className="gallery__counter">{current + 1} / {images.length}</span>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="gallery__thumbs">
          {images.map((src, i) => (
            <button key={i} className={`gallery__thumb${i === current ? " gallery__thumb--active" : ""}`} onClick={() => setCurrent(i)}>
              <Image src={src} alt={`Thumbnail ${i + 1}`} width={72} height={56} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
