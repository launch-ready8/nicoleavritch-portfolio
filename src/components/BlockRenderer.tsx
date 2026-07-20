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

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  return (
    <div className="grid gap-12 md:gap-20">
      {blocks.map((block) => {
        switch (block._type) {
          case "textSection":
            return (
              <Reveal key={block._key}>
                <div className="mx-auto max-w-3xl">
                  {block.heading && <h2 className="display mb-5 text-3xl md:text-4xl">{block.heading}</h2>}
                  {block.body && (
                    <div className="grid gap-4 text-lg leading-relaxed">
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
                <figure>
                  <div className="img-zoom relative aspect-[16/9] w-full overflow-hidden">
                    <Image
                      src={urlFor(block.image).width(2000).fit("max").url()}
                      alt={block.caption || ""}
                      fill
                      sizes="95vw"
                      className="object-cover"
                    />
                  </div>
                  {block.caption && <figcaption className="label mt-2 opacity-50">{block.caption}</figcaption>}
                </figure>
              </Reveal>
            ) : null;
          case "imageGrid": {
            const cols =
              block.columns === 3 ? "md:grid-cols-3" : block.columns === 4 ? "md:grid-cols-4" : "md:grid-cols-2";
            return (
              <div key={block._key} className={`grid grid-cols-1 gap-4 md:gap-6 ${cols}`}>
                {block.images?.map((img, i) => (
                  <Reveal key={i} delay={(i % (block.columns || 2)) * 0.08}>
                    <div className="img-zoom relative aspect-square w-full overflow-hidden">
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
                <figure>
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
                  {block.caption && <figcaption className="label mt-2 opacity-50">{block.caption}</figcaption>}
                </figure>
              </Reveal>
            );
          }
          case "statsRow": {
            const n = block.stats?.length || 0;
            const statCols = n <= 2 ? "md:grid-cols-2" : n === 3 ? "md:grid-cols-3" : "md:grid-cols-4";
            return (
              <Reveal key={block._key}>
                <div className={`grid grid-cols-2 gap-8 ${statCols}`}>
                  {block.stats?.map((s, i) => (
                    <div key={i}>
                      <p className="display text-6xl text-ink/15 md:text-7xl">{s.value}</p>
                      <p className="mt-3 max-w-[16rem] bg-ink/5 p-3 text-sm leading-relaxed">{s.label}</p>
                    </div>
                  ))}
                </div>
              </Reveal>
            );
          }
          case "logoList":
            return (
              <Reveal key={block._key}>
                <div className="mx-auto max-w-3xl">
                  {block.heading && <p className="label mb-4 opacity-50">{block.heading}</p>}
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {block.items?.map((item, i) => (
                      <span key={i} className="display text-2xl transition-colors hover:text-accent md:text-3xl">
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
