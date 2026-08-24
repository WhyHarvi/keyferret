// Placeholder ad unit. Sized to standard IAB formats so the layout won't
// jump once real ads are wired in. This site has no ad-network account yet
// — when one exists, replace the placeholder <div> below with the network's
// real unit, e.g. for Google AdSense:
//
//   1. Add the loader script once in app/layout.tsx <head>:
//      <script
//        async
//        src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX`}
//        crossOrigin="anonymous"
//      />
//   2. Replace the placeholder below with:
//      <ins
//        className="adsbygoogle"
//        style={{ display: "block" }}
//        data-ad-client="ca-pub-XXXXXXXXXXXXXXXX"
//        data-ad-slot="YOUR_AD_SLOT_ID"
//        data-ad-format="auto"
//        data-full-width-responsive="true"
//      />
//      then call `(window.adsbygoogle = window.adsbygoogle || []).push({})`
//      in a useEffect so the slot actually renders.
//   3. Add public/ads.txt with the line AdSense gives you in your account.

type AdSlotProps = {
  format?: "leaderboard" | "rectangle" | "banner";
  className?: string;
};

const FORMAT_META: Record<NonNullable<AdSlotProps["format"]>, { minHeight: string; note: string }> = {
  leaderboard: { minHeight: "90px", note: "728×90 leaderboard" },
  rectangle: { minHeight: "250px", note: "300×250 rectangle" },
  banner: { minHeight: "100px", note: "responsive banner" },
};

export default function AdSlot({ format = "banner", className = "" }: AdSlotProps) {
  const meta = FORMAT_META[format];

  return (
    <div
      role="complementary"
      aria-label="Advertisement"
      className={`flex w-full items-center justify-center rounded-xl border border-dashed border-border bg-surface/40 text-xs text-text-muted ${className}`}
      style={{ minHeight: meta.minHeight }}
    >
      Ad space · {meta.note}
    </div>
  );
}
