import { Cpu, Eye, Gamepad2, Link2, Palette } from "lucide-react";
import type { Game } from "@/lib/types";

export default function GameFacts({ game }: { game: Game }) {
  const facts = [
    { label: "Game modes", values: game.gameModes, icon: Gamepad2 },
    { label: "Perspective", values: game.playerPerspectives, icon: Eye },
    { label: "Themes", values: game.themes, icon: Palette },
    { label: "Engine", values: game.gameEngines, icon: Cpu },
    { label: "Franchise", values: game.franchises, icon: Link2 },
  ].filter((fact) => fact.values.length > 0);

  if (facts.length === 0) return null;

  return (
    <section aria-labelledby="game-facts-title">
      <p className="text-sm font-medium text-text-muted">Details</p>
      <h2 id="game-facts-title" className="mt-1 text-2xl font-semibold tracking-tight text-text-main">Features and facts</h2>
      <dl className="mt-4 grid grid-cols-1 gap-x-8 gap-y-5 rounded-2xl border border-border bg-surface/50 px-5 py-5 sm:grid-cols-2 lg:grid-cols-3">
        {facts.map(({ label, values, icon: Icon }) => (
          <div key={label} className="min-w-0">
            <dt className="flex items-center gap-2 text-xs font-medium text-text-muted">
              <Icon size={14} className="text-accent" aria-hidden="true" />
              {label}
            </dt>
            <dd className="mt-1.5 text-sm leading-6 text-text-main">{values.join(", ")}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
