import { getProjects } from "@/lib/sanity";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";

export const revalidate = 60;

export const metadata = { title: "Work — Nicole Avritch" };

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <div className="mx-auto max-w-[1600px] px-5 py-12 md:px-10 md:py-16">
      <h1 className="display text-[16vw] md:text-[9vw]">
        Work<span className="text-accent">.</span>
      </h1>
      <p className="mono-label mt-4 opacity-60">({projects.length}) projects — brand, campaign, packaging, motion</p>
      <div className="mt-12 grid gap-x-8 gap-y-14 md:grid-cols-2">
        {projects.map((p, i) => (
          <Reveal key={p._id} delay={(i % 2) * 0.08}>
            <ProjectCard project={p} index={i} />
          </Reveal>
        ))}
      </div>
      {projects.length === 0 && (
        <p className="mt-12 text-lg opacity-60">Projects are on their way — check back shortly.</p>
      )}
    </div>
  );
}
