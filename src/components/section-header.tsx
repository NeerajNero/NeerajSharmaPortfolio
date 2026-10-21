interface SectionHeaderProps {
  id: string;
  title: string;
}

/** HUD tab: a 1px top rule with a short accent tick, title in Press Start 2P. */
export function SectionHeader({ id, title }: SectionHeaderProps) {
  return (
    <div className="relative border-t border-line pt-4">
      <span
        aria-hidden="true"
        className="absolute -top-px left-0 h-px w-6 bg-accent"
      />
      <h2 id={`${id}-title`} className="font-display text-[13px] leading-[1.6] text-text">
        {title}
      </h2>
    </div>
  );
}
