import Link from "next/link";
import { getProjects } from "@/lib/sanity";
import ThumbRow from "@/components/ThumbRow";
import WordReveal from "@/components/WordReveal";
import Doodle from "@/components/Doodle";

export const revalidate = 60;

export const metadata = { title: "Work — Nicole Avritch" };

export default async function WorkPage() {
  const projects = await getProjects();

  // split into drifting rows of ~4
  const rows: (typeof projects)[] = [];
  for (let i = 0; i < projects.length; i += 4) rows.push(projects.slice(i, i + 4));

  return (
    <div id="top">
      <section className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
        <p className="label mb-4 opacity-50">Projects that I&rsquo;m proud of</p>
        <div className="relative max-w-3xl">
          <WordReveal
            text="A curated selection of work — campaigns for a national pet-wellness retailer, a podcast brand I co-founded, packaging, motion pieces, and the passion projects in between."
            className="text-2xl leading-snug md:text-4xl"
          />
          <Doodle name="smiley" className="absolute -right-4 -top-2 hidden h-12 w-12 text-accent md:block" strokeWidth={5} delay={0.6} />
        </div>
      </section>

      <section className="mt-12 grid gap-2 md:mt-16">
        {rows.map((row, i) => (
          <ThumbRow key={i} projects={row} direction={i % 2 ? "right" : "left"} startIndex={i * 4} />
        ))}
      </section>

      {/* static index for anyone who wants to browse without the motion */}
      <section className="mx-auto max-w-[1500px] px-5 py-16 md:px-10">
        <p className="label mb-5 opacity-50">Full index</p>
        <div className="border-t rule">
          {projects.map((p, i) => (
            <Link key={p._id} href={`/work/${p.slug}`} className="work-row flex items-baseline justify-between py-3.5">
              <span className="flex items-baseline gap-4">
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <span className="text-lg md:text-2xl">{p.title}</span>
              </span>
              <span className="label opacity-50">{p.tags?.slice(0, 2).join(" · ")}</span>
            </Link>
          ))}
        </div>
        {projects.length === 0 && <p className="text-lg opacity-60">Projects are on their way — check back shortly.</p>}
      </section>
    </div>
  );
}
