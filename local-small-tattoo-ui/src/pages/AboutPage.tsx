import { AboutFinalCta } from "../features/about/components/AboutFinalCta";
import { AboutHero } from "../features/about/components/AboutHero";
import { MissionSection } from "../features/about/components/MissionSection";
import { StudioSpaceSection } from "../features/about/components/StudioSpaceSection";
import { StudioStorySection } from "../features/about/components/StudioStorySection";
import { useAboutPage } from "../features/about/hooks/useAboutPage";
import { FounderSection } from "../features/home/FounderSection";
export function AboutPage() {
  const { data, isLoading, error } = useAboutPage();
  if (isLoading) return <main className="about-page-state page-shell">Loading About Us...</main>;
  if (error || !data)
    return <main className="about-page-state page-shell">Unable to load About Us.</main>;
  return (
    <main className="about-page">
      {data.hero.isVisible !== false ? <AboutHero content={data.hero} /> : null}
      {data.story.isVisible !== false ? <StudioStorySection content={data.story} /> : null}
      {data.mission.isVisible !== false ? <MissionSection content={data.mission} /> : null}
      {data.studioSpace.isVisible !== false ? (
        <StudioSpaceSection content={data.studioSpace} />
      ) : null}
      {data.founderSection.isVisible !== false ? (
        <FounderSection content={data.founderSection} />
      ) : null}
      {data.finalCta.isVisible !== false ? <AboutFinalCta content={data.finalCta} /> : null}
    </main>
  );
}
