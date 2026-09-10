"use client";

import { useState } from "react";
import { Camera, Rotate3d, Armchair } from "lucide-react";
import type { VehiclePhoto } from "@/lib/types";
import { PhotoGallery } from "./PhotoGallery";
import { Vehicle360Viewer } from "./Vehicle360Viewer";

type Tab = "photos" | "exterior" | "interior";

/**
 * Photos / 360° exterior / 360° interior tabs. 360 tabs appear only when real media (or the
 * development-only demo sequence) exists; otherwise the standard gallery is the whole experience.
 */
export function VehicleMedia({
  photos,
  title,
  stockNumber,
  exterior360Frames,
  exterior360EmbedUrl,
  interior360Url,
  isDemo360,
}: {
  photos: VehiclePhoto[];
  title: string;
  stockNumber: string;
  exterior360Frames: string[] | null;
  exterior360EmbedUrl: string | null;
  interior360Url: string | null;
  isDemo360?: boolean;
}) {
  const hasExterior = !!(exterior360Frames?.length || exterior360EmbedUrl);
  const hasInterior = !!interior360Url;
  const [tab, setTab] = useState<Tab>("photos");
  const poster = photos[0] ?? { url: exterior360Frames?.[0] ?? "", alt: title };

  const tabs: { id: Tab; label: string; icon: typeof Camera; show: boolean }[] = [
    { id: "photos", label: `Photos (${photos.length})`, icon: Camera, show: true },
    { id: "exterior", label: "360° Exterior", icon: Rotate3d, show: hasExterior },
    { id: "interior", label: "360° Interior", icon: Armchair, show: hasInterior },
  ];
  const visible = tabs.filter((t) => t.show);

  return (
    <div>
      {visible.length > 1 && (
        <div role="tablist" aria-label="Vehicle media" className="mb-3 inline-flex rounded-[var(--radius-sm)] border border-line bg-white p-0.5">
          {visible.map((t) => (
            <button
              key={t.id}
              role="tab"
              id={`media-tab-${t.id}`}
              aria-selected={tab === t.id}
              aria-controls={`media-panel-${t.id}`}
              tabIndex={tab === t.id ? 0 : -1}
              onClick={() => setTab(t.id)}
              onKeyDown={(e) => {
                const i = visible.findIndex((v) => v.id === tab);
                if (e.key === "ArrowRight") setTab(visible[(i + 1) % visible.length].id);
                if (e.key === "ArrowLeft") setTab(visible[(i - 1 + visible.length) % visible.length].id);
              }}
              className="inline-flex min-h-10 items-center gap-1.5 rounded-[3px] px-3 text-sm font-semibold text-slate aria-selected:bg-navy-900 aria-selected:text-white"
            >
              <t.icon className="size-4" aria-hidden />
              {t.label}
            </button>
          ))}
        </div>
      )}

      <div id="media-panel-photos" role={visible.length > 1 ? "tabpanel" : undefined} aria-labelledby={visible.length > 1 ? "media-tab-photos" : undefined} hidden={tab !== "photos"}>
        <PhotoGallery photos={photos} title={title} stockNumber={stockNumber} />
      </div>
      {hasExterior && (
        <div id="media-panel-exterior" role="tabpanel" aria-labelledby="media-tab-exterior" hidden={tab !== "exterior"}>
          {tab === "exterior" && (
            <Vehicle360Viewer frames={exterior360Frames} embedUrl={exterior360EmbedUrl} poster={poster} title={title} kind="exterior" isDemo={isDemo360} stockNumber={stockNumber} onFallback={() => setTab("photos")} />
          )}
        </div>
      )}
      {hasInterior && (
        <div id="media-panel-interior" role="tabpanel" aria-labelledby="media-tab-interior" hidden={tab !== "interior"}>
          {tab === "interior" && <Vehicle360Viewer embedUrl={interior360Url} poster={poster} title={title} kind="interior" stockNumber={stockNumber} onFallback={() => setTab("photos")} />}
        </div>
      )}
    </div>
  );
}
