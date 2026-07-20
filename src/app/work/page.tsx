import { getProjects } from "@/lib/sanity";
import ScrollRow from "@/components/ScrollRow";

export const revalidate = 60;

export const metadata = { title: "Work — Nicole Avritch" };

export default async function WorkPage() {
  const projects = await getProjects();

  // rows of 2 large thumbnails, sliding on scroll in alternating directions
  const rows: (typeof projects)[] = [];
  for (let i = 0; i < projects.length; i += 2) rows.push(projects.slice(i, i + 2));

  return (
    <div id="top">
      <div className="mx-auto max-w-[1500px] px-5 pt-8 md:px-10">
        <p className="label opacity-50">Selected projects</p>
      </div>
      <section className="mt-6 grid gap-10 pb-16 md:gap-14">
        {rows.map((row, i) => (
          <ScrollRow key={i} projects={row} direction={i % 2 ? "right" : "left"} startIndex={i * 2} />
        ))}
        {projects.length === 0 && (
          <p className="mx-auto max-w-[1500px] px-5 text-lg opacity-60 md:px-10">
            Projects are on their way. Check back shortly.
          </p>
        )}
      </section>
    </div>
  );
}
