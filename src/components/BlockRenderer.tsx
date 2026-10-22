import { type Block, type SanityImageSource } from "@/lib/sanity";
import GalleryProvider from "@/components/Gallery";
import Reveal from "@/components/Reveal";
import ZoomImage from "@/components/ZoomImage";
import Carousel from "@/components/Carousel";

/** Renders plain text with lightweight [label](url) links, so editors can link
 *  phrases (e.g. podcast episodes) inside any text block from the Studio. */
export function textWithLinks(text: string) {
  return text.split(/(\[[^\]]+\]\([^)\s]+\))/g).map((part, i) => {
    const m = part.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
    return m ? (
      <a key={i} href={m[2]} target="_blank" rel="noreferrer" className="text-link">
        {m[1]}
      </a>
    ) : (
      <span key={i}>{part}</span>
    );
  });
}

/** Vimeo tells us a video's true width/height via oEmbed — so the frame can
 *  match the video exactly (no letterbox bars). Cached for a day. */
async function vimeoAspect(url: string): Promise<string | null> {
  try {
    const r = await fetch(`https://vimeo.com/api/oembed.json?url=${encodeURIComponent(url)}`, {
      next: { revalidate: 86400 },
    });
    if (!r.ok) return null;
    const j = (await r.json()) as { width?: number; height?: number };
    return j.width && j.height ? `${j.width} / ${j.height}` : null;
  } catch {
    return null;
  }
}

function videoSrc(url: string, withSound = false): { embed?: string; mp4?: string } {
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/);
  if (yt) return { embed: `https://www.youtube.com/embed/${yt[1]}?rel=0&modestbranding=1` };
  const vimeo = url.match(/vimeo\.com\/(?:video\/)?(\d+)(?:\/([a-zA-Z0-9]+))?/);
  if (vimeo) {
    /* unlisted videos need their privacy hash (the second part of the share
       link, vimeo.com/ID/HASH) passed as h= or the player refuses to load */
    const hash = vimeo[2] || url.match(/[?&]h=([a-zA-Z0-9]+)/)?.[1];
    const h = hash ? `h=${hash}&` : "";
    return withSound
      ? /* standard player: controls visible, viewer can hear it */
        { embed: `https://player.vimeo.com/video/${vimeo[1]}?${h}title=0&byline=0&portrait=0&dnt=1` }
      : {
          /* background mode = seamless: autoplay, muted, loop, no chrome.
             Vimeo honors these only on paid plans; free accounts keep controls. */
          embed: `https://player.vimeo.com/video/${vimeo[1]}?${h}background=1&autoplay=1&loop=1&muted=1&title=0&byline=0&portrait=0&dnt=1`,
        };
  }
  if (/\.mp4($|\?)/.test(url)) return { mp4: url };
  return { embed: url };
}

/** Flat list of every image across the given block groups, so one lightbox
 *  can arrow through the whole page (even when blocks live inside sections). */
export function collectGalleryImages(blockGroups: Block[][]) {
  const images: SanityImageSource[] = [];
  const indexOf = new Map<string, number>();
  for (const blocks of blockGroups) {
    for (const b of blocks) {
      if (b._type === "fullBleedImage" && b.image) {
        indexOf.set(b._key, images.length);
        images.push(b.image);
      }
      if (b._type === "imageGrid" || b._type === "imageCarousel") {
        (b.images || []).forEach((img, i) => {
          indexOf.set(`${b._key}:${i}`, images.length);
          images.push(img);
        });
      }
    }
  }
  return { images, indexOf };
}

/** Renders blocks WITHOUT a gallery provider — the caller supplies one
 *  (used by the sectioned project layout, which shares a single lightbox). */
export async function Blocks({ blocks, indexOf }: { blocks: Block[]; indexOf: Map<string, number> }) {
  const indexOfBlockImage = indexOf;

  /* video frames: manual aspect from the CMS wins; otherwise ask Vimeo */
  const aspects = new Map<string, string>();
  await Promise.all(
    blocks
      .filter((b): b is Extract<Block, { _type: "videoEmbed" }> => b._type === "videoEmbed")
      .map(async (b) => {
        if (b.aspect) {
          aspects.set(b._key, b.aspect.replace(":", " / "));
          return;
        }
        if (b.url && /vimeo\.com/.test(b.url)) {
          const a = await vimeoAspect(b.url);
          if (a) aspects.set(b._key, a);
        }
      })
  );
  return (
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
                        <p key={i}>{textWithLinks(p)}</p>
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
                    maxWidth={3200}
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
                      maxWidth={wide ? 3200 : 2000}
                      galleryIndex={indexOfBlockImage.get(`${block._key}:${i}`) || 0}
                    />
                  </div>
                ))}
              </div>
            );
          }
          case "imageCarousel": {
            const imgs = block.images || [];
            return (
              <Reveal key={block._key}>
                <Carousel
                  images={imgs}
                  indexes={imgs.map((_, i) => indexOfBlockImage.get(`${block._key}:${i}`) || 0)}
                  caption={block.caption}
                />
              </Reveal>
            );
          }
          case "videoEmbed": {
            if (!block.url) return null;
            const src = videoSrc(block.url, block.withSound);
            return (
              <Reveal key={block._key}>
                <figure>
                  <div
                    className="relative w-full overflow-hidden"
                    style={src.mp4 && !aspects.get(block._key) ? undefined : { aspectRatio: aspects.get(block._key) || "16 / 9" }}
                  >
                    {src.mp4 ? (
                      block.withSound ? (
                        <video src={src.mp4} controls playsInline className="block h-auto w-full" />
                      ) : (
                        <video src={src.mp4} autoPlay muted loop playsInline className="block h-auto w-full" />
                      )
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
  );
}

/** Standalone renderer for the flat-blocks layout: one gallery, one list. */
export default function BlockRenderer({ blocks }: { blocks: Block[] }) {
  const { images, indexOf } = collectGalleryImages([blocks]);
  return (
    <GalleryProvider images={images}>
      <Blocks blocks={blocks} indexOf={indexOf} />
    </GalleryProvider>
  );
}
