import { Suspense } from "react";
import { BootSequence } from "@/components/boot-sequence";
import { Campaign } from "@/components/campaign";
import { Loadout } from "@/components/loadout";
import { PlayerCard } from "@/components/player-card";
import { QuestLog } from "@/components/quest-log";
import { SectionHeader } from "@/components/section-header";
import { SendPing } from "@/components/send-ping";
import { TrophyCase } from "@/components/trophy-case";
import { TrophyCaseSkeleton } from "@/components/trophy-case-skeleton";

export default function Home() {
  return (
    <>
      <BootSequence />
      <div className="mx-auto flex max-w-[1040px] flex-col gap-16 px-6 py-12">
        <section id="player" aria-labelledby="player-name">
          <PlayerCard />
        </section>

        <section id="loadout" aria-labelledby="loadout-title">
          <SectionHeader id="loadout" title="Loadout" />
          <Loadout />
        </section>

        <section id="quests" aria-labelledby="quests-title">
          <SectionHeader id="quests" title="Quest log" />
          <QuestLog />
        </section>

        <section id="campaign" aria-labelledby="campaign-title">
          <SectionHeader id="campaign" title="Campaign" />
          <Campaign />
        </section>

        <section id="arcade" aria-labelledby="arcade-title">
          <SectionHeader id="arcade" title="Arcade" />
          <Suspense fallback={<TrophyCaseSkeleton />}>
            <TrophyCase />
          </Suspense>
        </section>

        <section id="ping" aria-labelledby="ping-title">
          <SectionHeader id="ping" title="Send ping" />
          <SendPing />
        </section>
      </div>
    </>
  );
}
