import { getProjects } from "@/lib/sanity";
import ProjectCard from "@/components/ProjectCard";
import Reveal from "@/components/Reveal";
import Star from "@/components/Star";

export const revalidate = 60;

export const metadata = { title: "Work — Nicole Avritch" };

export default async function WorkPage() {
  const projects = await getProjects();

  return (
    <div>
      <div className="border-b-2 rule">
        <div className="relative mx-auto max-w-[1700px] px-5 py-10 md:px-10 md:py-14">
          <h1 className="display text-[16vw] md:text-[9vw]">
            All work<span className="text-accent">.</span>
          </h1>
          <Star className="absolute right-[8%] top-[20%] h-[8vw] w-[8vw] text-accent" />
          <p className="mono-label mt-4 opacity-60">
            ({String(projects.length).padStart(2, "0")}) projects — brand · campaign · packaging · motion
          </p>
        </div>
      </div>
      <div className="mx-auto max-w-[1700px] px-5 py-12 md:px-10">
        <div className="grid gap-8 md:grid-cols-2 md:gap-10">
          {projects.map((p, i) => (
            <Reveal key={p._id} delay={(i % 2) * 0.08}>
              <ProjectCard project={p} index={i} />
            </Reveal>
          ))}
        </div>
        {projects.length === 0 && (
          <p className="text-lg opacity-60">Projects are on their way — check back shortly.</p>
        )}
      </div>
    </div>
  );
}
