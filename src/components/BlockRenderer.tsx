import Image from "next/image";
import { urlFor, type Block } from "@/lib/sanity";
import Reveal from "@/components/Reveal";

function videoSrc(url: string): { embed?: string; mp4?: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return { embed: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { embed: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (url.endsWith(".mp4")) return { mp4: url };
  return { embed: url };
}

function Framed({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <figure className="frame bg-bg">
      {children}
      {caption && (
        <figcaption className="mono-label border-t-2 rule px-4 py-2.5 opacity-70">{caption}</figcaption>
      )}
    </figure>
  );
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="grid gap-10 md:gap-16">
      {blocks.map((block) => {
        switch (block._type) {
          case "textSection":
            return (
              <Reveal key={block._key}>
                <div className="grid gap-6 md:grid-cols-[1fr_2fr]">
                  <div>
                    {block.heading && (
                      <h2 className="display border-t-2 rule pt-4 text-3xl md:text-4xl">{block.heading}</h2>
                    )}
                  </div>
                  {block.body && (
                    <div className="grid max-w-3xl gap-4 border-t-2 rule pt-4 text-lg leading-relaxed">
                      {block.body.split(/\n\s*\n/).map((p, i) => (
                        <p key={i}>{p}</p>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>
            );
          case "fullBleedImage":
            return block.image ? (
              <Reveal key={block._key}>
                <Framed caption={block.caption}>
                  <div className="img-zoom relative aspect-[16/9] w-full overflow-hidden bg-surface">
                    <Image
                      src={urlFor(block.image).width(2000).fit("max").url()}
                      alt={block.caption || ""}
                      fill
                      sizes="95vw"
                      className="object-cover"
                    />
                  </div>
                </Framed>
              </Reveal>
            ) : null;
          case "imageGrid": {
            const cols =
              block.columns === 3 ? "md:grid-cols-3" : block.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-2";
            return (
              <div key={block._key} className={`grid grid-cols-1 gap-4 md:gap-6 ${cols}`}>
                {block.images?.map((img, i) => (
                  <Reveal key={i} delay={(i % (block.columns || 2)) * 0.07}>
                    <div className="img-zoom frame relative aspect-square w-full overflow-hidden bg-surface">
                      <Image
                        src={urlFor(img).width(1000).fit("max").url()}
                        alt=""
                        fill
                        sizes="(min-width: 768px) 45vw, 95vw"
                        className="object-cover"
                      />
                    </div>
                  </Reveal>
                ))}
              </div>
            );
          }
          case "videoEmbed": {
            if (!block.url) return null;
            const src = videoSrc(block.url);
            return (
              <Reveal key={block._key}>
                <Framed caption={block.caption || "▶ Video"}>
                  <div className="relative aspect-video w-full overflow-hidden bg-ink">
                    {src.mp4 ? (
                      <video src={src.mp4} controls playsInline className="h-full w-full" />
                    ) : (
                      <iframe
                        src={src.embed}
                        className="h-full w-full"
                        allow="autoplay; fullscreen; picture-in-picture"
                        allowFullScreen
                      />
                    )}
                  </div>
                </Framed>
              </Reveal>
            );
          }
          case "statsRow": {
            const n = block.stats?.length || 0;
            const statCols = n <= 2 ? "md:grid-cols-2" : n === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
            return (
              <Reveal key={block._key}>
                <div className={`frame grid grid-cols-2 ${statCols}`}>
                  {block.stats?.map((s, i) => (
                    <div
                      key={i}
                      className={`p-6 md:p-8 ${i > 0 ? "border-l-2 rule max-md:[&:nth-child(odd)]:border-l-0" : ""} ${i >= 2 ? "max-md:border-t-2" : ""}`}
                    >
                      <p className="display text-4xl text-accent md:text-6xl">{s.value}</p>
                      <p className="mono-label mt-2 opacity-70">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          }
          case "logoList":
            return (
              <Reveal key={block._key}>
                <div className="border-y-2 rule py-8">
                  {block.heading && (
                    <p className="mono-label mb-5 flex items-center gap-2 opacity-70">
                      <span className="text-accent">✦</span> {block.heading}
                    </p>
                  )}
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {block.items?.map((item, i) => (
                      <span key={i} className="display text-2xl transition-colors hover:text-accent md:text-4xl">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>
              </Reveal>
            );
          default:
            return null;
        }
      })}
    </div>
  );
}
