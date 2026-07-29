import { type Block, type SanityImageSource } from "@/lib/sanity";
import GalleryProvider from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import ZoomImage from "@/components/ZoomImage";

function videoSrc(url: string): { embed?: string; mp4?: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return { embed: `https://www.youtube.com/embed/${yt[1]}` };
  const vimeo = url.match(/vimeo\.com\/(\d+)/);
  if (vimeo) return { embed: `https://player.vimeo.com/video/${vimeo[1]}` };
  if (url.endsWith(".mp4")) return { mp4: url };
  return { embed: url };
}

export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  // flat list of every image on the page, so the lightbox can arrow through all of them
  const allImages: SanityImageSource[] = [];
  const indexOfBlockImage = new Map<string, number>();
  for (const b of blocks) {
    if (b._type === "fullBleedImage" && b.image) {
      indexOfBlockImage.set(b._key, allImages.length);
      allImages.push(b.image);
    }
    if (b._type === "imageGrid") {
      (b.images || []).forEach((img, i) => {
        indexOfBlockImage.set(`${b._key}:${i}`, allImages.length);
        allImages.push(img);
      });
    }
  }

  return (
    <GalleryProvider images={allImages}>
    <div className="grid gap-12 md:gap-20">
      {blocks.map((block) => {
        switch (block._type) {
          case "sectionHeader":
            return (
              <Reveal key={block._key}>
                <div className="border-t rule pt-8">
                  {block.kicker && <p className="label mb-3 opacity-70">{block.kicker}</p>}
                  {block.heading && (
                    <h2 className="display text-5xl md:text-7xl">
                      {block.heading}.
                    </h2>
                  )}
                </div>
              </Reveal>
            );
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
                  <ZoomImage
                    image={block.image}
                    alt={block.caption || ""}
                    sizes="95vw"
                    maxWidth={2000}
                    galleryIndex={indexOfBlockImage.get(block._key) || 0}
                  />
                  {block.caption && <figcaption className="label mt-2 opacity-70">{block.caption}</figcaption>}
                </figure>
              </Reveal>
            ) : null;
          case "imageGrid": {
            // aligned grid, natural ratios; columns: 1 stacks full-width for scroll-through pages
            const cols =
              block.columns === 1
                ? "md:grid-cols-1"
                : block.columns === 3
                  ? "md:grid-cols-3"
                  : block.columns === 4
                    ? "md:grid-cols-4"
                    : "md:grid-cols-2";
            const wide = block.columns === 1;
            return (
              <div
                key={block._key}
                className={`grid grid-cols-1 items-start gap-5 md:gap-6 ${cols} ${wide ? "mx-auto w-full max-w-3xl" : ""}`}
              >
                {block.images?.map((img, i) => (
                  <div key={i} className="img-zoom overflow-hidden">
                    <ZoomImage
                      image={img}
                      sizes={wide ? "(min-width: 768px) 768px, 95vw" : "(min-width: 768px) 45vw, 95vw"}
                      maxWidth={wide ? 1600 : 1200}
                      galleryIndex={indexOfBlockImage.get(`${block._key}:${i}`) || 0}
                    />
                  </div>
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
                  {block.caption && <figcaption className="label mt-2 opacity-70">{block.caption}</figcaption>}
                </figure>
              </Reveal>
            );
          }
          case "statsRow":
            // Per Nicole's review: the big-number stat treatment is removed from
            // the site for now. Data stays in the CMS; flip this back on later
            // by restoring the renderer here.
            return null;
          case "logoList": {
            const people =
              block.people && block.people.length > 0
                ? block.people
                : (block.items || []).map((name) => ({ name, url: undefined }));
            return (
              <Reveal key={block._key}>
                <div className="mx-auto max-w-3xl">
                  {block.heading && <p className="label mb-4 opacity-70">{block.heading}</p>}
                  <div className="flex flex-wrap gap-x-8 gap-y-3">
                    {people.map((person, i) =>
                      person.url ? (
                        <a
                          key={i}
                          href={person.url}
                          target="_blank"
                          rel="noreferrer"
                          className="display text-2xl underline decoration-2 underline-offset-8 transition-colors hover:text-accent md:text-3xl"
                        >
                          {person.name} ↗
                        </a>
                      ) : (
                        <span key={i} className="display text-2xl md:text-3xl">
                          {person.name}
                        </span>
                      )
                    )}
                  </div>
                </div>
              </Reveal>
            );
          }
          default:
            return null;
        }
      })}
    </div>
    </GalleryProvider>
  );
}
