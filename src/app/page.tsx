import Link from "next/link";
import Image from "next/image";
import { getProjects, getSettings, urlFor } from "@/lib/sanity";
import Ticker from "@/components/Ticker";
import Reveal from "@/components/Reveal";
import WordReveal from "@/components/WordReveal";
import Doodle from "@/components/Doodle";

export const revalidate = 60;

export default async function Home() {
  const [settings, projects] = await Promise.all([getSettings(), getProjects()]);
  const featured = projects.filter((p) => p.featured);
  const rest = projects.filter((p) => !p.featured);
  const [first = "Nicole", last = "Avritch"] = settings.siteTitle.split(" ");
  const years = new Date().getFullYear() - 2017;

  const stats = [
    { value: `${years}+`, caption: "years designing for consumer, wellness, and lifestyle brands." },
    { value: `${projects.length || 12}`, caption: "projects across brand, campaign, packaging, email, and motion." },
    { value: "40K+", caption: "streams on the podcast brand I co-founded and designed." },
  ];

  return (
    <div id="top">
      {/* HERO — staggered name with scribble, parenthetical role */}
      <section className="mx-auto max-w-[1500px] px-5 pt-6 md:px-10">
        <h1 className="display relative">
          <span className="block text-right text-[19vw] leading-[0.88] md:text-[14vw]">{first}</span>
          <span className="relative block text-[19vw] leading-[0.88] md:text-[14vw]">
            {last}—
            <Doodle
              name="scribble"
              className="absolute left-[18%] top-[6%] h-[72%] w-[26%] text-accent"
              strokeWidth={7}
              delay={0.5}
            />
          </span>
        </h1>
        <div className="relative mt-2 md:mt-4">
          <p className="text-[8.5vw] leading-[1.02] tracking-tight md:text-[5.5vw]">
            (Senior designer
            <br />
            &amp; brand strategist)
          </p>
          <Doodle name="chevrons" className="absolute right-2 top-2 h-10 w-10 text-accent md:h-14 md:w-14" delay={1} />
        </div>
      </section>

      {/* INTRO — word reveal */}
      {settings.heroLine && (
        <section className="mx-auto max-w-[1500px] px-5 py-24 md:px-10 md:py-36">
          <div className="relative mx-auto max-w-2xl md:ml-[38%]">
            <Doodle name="arrowCircle" className="absolute -left-20 top-1 hidden h-12 w-12 text-accent md:block" strokeWidth={5} />
            <WordReveal text={settings.heroLine} className="text-2xl leading-snug md:text-4xl" />
          </div>
        </section>
      )}

      {/* SERVICE TICKER */}
      <Ticker
        items={[
          "Brand identity",
          "Campaign design",
          "Art direction",
          "Packaging",
          "Email & retail",
          "Motion",
          "Brand strategy",
        ]}
      />

      {/* STATS — ghost numbers with caption cards */}
      <section className="mx-auto max-w-[1500px] px-5 py-20 md:px-10 md:py-28">
        <div className="relative grid gap-10 md:grid-cols-3 md:gap-8">
          <Doodle name="star" className="absolute -top-14 right-[8%] h-10 w-10 text-accent" strokeWidth={6} />
          {stats.map((s, i) => (
            <Reveal key={i} delay={i * 0.12}>
              <p className="display text-7xl text-ink/15 md:text-8xl">{s.value}</p>
              <p className="mt-4 max-w-xs bg-ink/5 p-4 text-sm leading-relaxed">{s.caption}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* FEATURED — big quiet image plates */}
      {featured.map((p, i) => (
        <section key={p._id} className="mx-auto max-w-[1500px] px-5 pb-24 md:px-10 md:pb-32">
          <Reveal>
            <Link href={`/work/${p.slug}`} className="group block">
              <div className="img-zoom relative aspect-[16/9] w-full overflow-hidden">
                {p.heroImage ? (
                  <Image
                    src={urlFor(p.heroImage).width(2200).fit("max").url()}
                    alt={p.title}
                    fill
                    priority={i === 0}
                    sizes="95vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="h-full w-full" style={{ background: i % 2 ? "#1B7754" : "#ECDFAB" }} />
                )}
              </div>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="flex items-baseline gap-3">
                  <span className="num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="display text-2xl transition-colors group-hover:text-accent md:text-4xl">
                    {p.title}
                  </span>
                </span>
                <span className="label opacity-60">{p.year}</span>
              </div>
              {p.intro && <p className="mt-2 max-w-2xl text-base leading-relaxed opacity-80">{p.intro}</p>}
            </Link>
          </Reveal>
        </section>
      ))}

      {/* QUIET INDEX */}
      {rest.length > 0 && (
        <section className="mx-auto max-w-[1500px] px-5 pb-24 md:px-10">
          <p className="label mb-5 opacity-50">More projects</p>
          <div className="border-t rule">
            {rest.map((p, i) => (
              <Link key={p._id} href={`/work/${p.slug}`} className="work-row flex items-baseline justify-between py-3.5">
                <span className="flex items-baseline gap-4">
                  <span className="num">{String(i + featured.length + 1).padStart(2, "0")}</span>
                  <span className="text-lg md:text-2xl">{p.title}</span>
                </span>
                <span className="label opacity-50">{p.tags?.[0]}</span>
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <Link href="/work" className="stamp-btn">
              See all work →
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
