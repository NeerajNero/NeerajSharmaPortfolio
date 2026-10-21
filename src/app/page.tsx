import { BootSequence } from "@/components/boot-sequence";
import { PlayerCard } from "@/components/player-card";
import { SectionHeader } from "@/components/section-header";

const sections = [
  { id: "loadout", title: "Loadout" },
  { id: "quests", title: "Quest log" },
  { id: "campaign", title: "Campaign" },
  { id: "arcade", title: "Arcade" },
  { id: "ping", title: "Send ping" },
] as const;

export default function Home() {
  return (
    <>
      <BootSequence />
      <div className="mx-auto flex max-w-[1040px] flex-col gap-16 px-6 py-12">
        <section id="player" aria-labelledby="player-name">
          <PlayerCard />
        </section>
        {sections.map((section) => (
          <section
            key={section.id}
            id={section.id}
            aria-labelledby={`${section.id}-title`}
          >
            <SectionHeader id={section.id} title={section.title} />
          </section>
        ))}
      </div>
    </>
  );
}
