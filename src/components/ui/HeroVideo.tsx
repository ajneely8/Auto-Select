/** Auto-playing (muted, per browser autoplay policy) video background. Caller supplies its own overlay/gradient for text legibility. */
export function HeroVideo({ facebookVideoUrl, className = "absolute inset-0 overflow-hidden" }: { facebookVideoUrl: string; className?: string }) {
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookVideoUrl)}&show_text=false&autoplay=true&mute=1`;

  return (
    <div aria-hidden className={className}>
      <iframe
        src={src}
        title="Auto Select video"
        className="pointer-events-none absolute inset-0 size-full"
        style={{ border: 0 }}
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
    </div>
  );
}
