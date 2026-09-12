import Image from "next/image";

/**
 * A slow, ambient crossfade + Ken-Burns zoom through real inventory photos, used as a full-bleed
 * hero background. Pure CSS (each photo shares one keyframe, offset by a negative animation-delay
 * so they take turns) — no client JS, no third-party embed, just the site's own already-hosted images.
 */
export function HeroPhotoBackground({ photos }: { photos: { url: string; alt: string }[] }) {
  const n = photos.length;
  if (n === 0) return null;
  const slotSeconds = 6;
  const totalSeconds = n * slotSeconds;
  const slotPct = 100 / n;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes hero-photo-fade {
          0% { opacity: 0; }
          ${(1.5 / n).toFixed(2)}% { opacity: 1; }
          ${(slotPct - 1.5 / n).toFixed(2)}% { opacity: 1; }
          ${slotPct.toFixed(2)}% { opacity: 0; }
          100% { opacity: 0; }
        }
        @keyframes hero-photo-zoom {
          0% { transform: scale(1); }
          100% { transform: scale(1.08); }
        }
      `}</style>
      {photos.map((p, i) => (
        <div
          key={p.url}
          className="absolute inset-0"
          style={{ animation: `hero-photo-fade ${totalSeconds}s ease-in-out infinite`, animationDelay: `${-i * slotSeconds}s` }}
        >
          <div className="absolute inset-0" style={{ animation: `hero-photo-zoom ${totalSeconds}s ease-in-out infinite`, animationDelay: `${-i * slotSeconds}s` }}>
            <Image src={p.url} alt={p.alt} fill priority={i === 0} sizes="100vw" quality={70} className="object-cover" />
          </div>
        </div>
      ))}
    </div>
  );
}
