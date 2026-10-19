"use client";
import { useRef, useState, useEffect } from "react";
import { Film, Upload, Play, Lock, X } from "lucide-react";
export default function LocalPlayer({
  progress,
  onProgress,
}: {
  progress: Record<string, number>;
  onProgress: (id: string, time: number) => void;
}) {
  const [source, setSource] = useState<{
      url: string;
      id: string;
      name: string;
    } | null>(null),
    [error, setError] = useState(""),
    [subtitle, setSubtitle] = useState("");
  const input = useRef<HTMLInputElement>(null),
    video = useRef<HTMLVideoElement>(null),
    lastSaved = useRef(0);
  useEffect(
    () => () => {
      if (source) URL.revokeObjectURL(source.url);
    },
    [source],
  );
  useEffect(
    () => () => {
      if (subtitle) URL.revokeObjectURL(subtitle);
    },
    [subtitle],
  );
  return (
    <div className="local-player">
      <div className="privacy-card">
        <Film size={26} />
        <h3>Tu propia sala de cine.</h3>
        <p>
          Abre un video propio o autorizado desde tu dispositivo. El archivo
          permanece en tu equipo y su progreso se guarda en tu archivo personal.
        </p>
      </div>
      <input
        ref={input}
        hidden
        type="file"
        accept="video/mp4,video/webm,video/ogg"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (!f) return;
          setSubtitle("");
          setError("");
          lastSaved.current = 0;
          setSource({
            url: URL.createObjectURL(f),
            id: `${f.name}-${f.size}-${f.lastModified}`,
            name: f.name,
          });
          e.target.value = "";
        }}
      />
      <button className="btn primary" onClick={() => input.current?.click()}>
        <Upload size={16} />
        Abrir un video propio
      </button>
      {source && (
        <div className="own-video">
          <div className="own-video-heading">
            <span>{source.name}</span>
            <button aria-label="Cerrar video" onClick={() => setSource(null)}>
              <X size={17} />
            </button>
          </div>
          <video
            ref={video}
            src={source.url}
            controls
            playsInline
            preload="metadata"
            onLoadedMetadata={() => {
              const v = video.current;
              if (
                v &&
                progress[source.id] &&
                progress[source.id] < v.duration - 3
              )
                v.currentTime = progress[source.id];
            }}
            onTimeUpdate={() => {
              const v = video.current;
              if (v && Math.abs(v.currentTime - lastSaved.current) >= 10) {
                lastSaved.current = v.currentTime;
                onProgress(source.id, v.currentTime);
              }
            }}
            onPause={() => {
              if (video.current)
                onProgress(source.id, video.current.currentTime);
            }}
            onEnded={() => onProgress(source.id, 0)}
            onError={() =>
              setError(
                "El navegador no puede reproducir este formato. Prueba un archivo MP4 con H.264 o un WebM compatible.",
              )
            }
          >
            {subtitle && (
              <track
                key={subtitle}
                kind="subtitles"
                src={subtitle}
                srcLang="es"
                label="Subtítulos locales"
                default
              />
            )}
          </video>
          <div className="video-options">
            <label>
              Velocidad
              <select
                aria-label="Velocidad de reproducción"
                defaultValue="1"
                onChange={(e) => {
                  if (video.current)
                    video.current.playbackRate = Number(e.target.value);
                }}
              >
                {[0.5, 0.75, 1, 1.25, 1.5, 2].map((v) => (
                  <option key={v} value={v}>
                    {v}×
                  </option>
                ))}
              </select>
            </label>
            <label className="subtitle-upload">
              Añadir subtítulos .vtt
              <input
                type="file"
                accept=".vtt,text/vtt"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    setSubtitle(URL.createObjectURL(f));
                    e.target.value = "";
                  }
                }}
              />
            </label>
          </div>
        </div>
      )}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <p className="settings-note">
        <Lock size={12} />
        Los videos no se suben al servidor. Para continuar otro día, vuelve a
        seleccionar el mismo archivo.
      </p>
    </div>
  );
}
