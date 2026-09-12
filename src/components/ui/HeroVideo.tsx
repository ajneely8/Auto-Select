/** Auto-playing (muted, per browser autoplay policy) video background for PageHero. */
export function HeroVideo({ facebookVideoUrl }: { facebookVideoUrl: string }) {
  const src = `https://www.facebook.com/plugins/video.php?href=${encodeURIComponent(facebookVideoUrl)}&show_text=false&autoplay=true&mute=1`;

  return (
    <div aria-hidden className="absolute inset-0 overflow-hidden">
      <iframe
        src={src}
        title="Auto Select video"
        className="absolute inset-0 size-full"
        style={{ border: 0 }}
        allow="autoplay; encrypted-media; picture-in-picture; web-share"
        allowFullScreen
      />
      <div aria-hidden className="absolute inset-0 bg-gradient-to-r from-navy-900 via-navy-900/70 to-transparent" />
    </div>
  );
}
