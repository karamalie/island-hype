// components/layout/logo.tsx
//
// The brand mark, in the two forms the site uses.
//
// It replaces a text wordmark set in Playfair italic, which was a stand-in for
// the real logo rather than a design decision.
//
// THE LOGO IS ALWAYS GOLD, #AC9A74. That is the constraint everything else here
// works around, because gold is not in the black/white/teal palette and is
// mid-tone: 6.24:1 on the ink footer, but 2.75:1 on white and worse on a sunlit
// sandbank. So instead of recolouring the brand, each placement gives it a ground
// it can sit on:
//
//   on a photograph  -> a white pill, the same device the nav already uses for
//                       its links, so it reads as part of the design rather than
//                       as a patch
//   on ink           -> nothing, the gold carries itself
//   on white         -> nothing, and no pill; a white pill on a white page is an
//                       invisible box with padding
//
// The pill is CSS, not baked into the image. A baked white rectangle cannot have
// a radius that matches the nav's other pills, and would not adapt if the nav
// height changed. The `-on-white` and `-on-ink` files exist for places that
// cannot do CSS at all — email, social cards — not for this.
//
// `priority` is worth passing in the nav: the logo is above the fold on every
// page and is the one image that should never pop in late.

import Link from "next/link";
import { cn } from "@/lib/utils";

// The images carry alt="" on purpose: the link itself has the accessible name
// (aria-label below), so labelling both makes a screen reader say it twice.

const WORDMARK_SRC = "/brand/island-hype-wordmark-640.webp";
const LOCKUP_SRC = "/brand/island-hype-logo-640.webp";
// 128px, not the 512 PNG: the nav renders the mark at ~42px, and the large
// PNG was 94KB for that slot. The 128 WebP is a fraction of it.
const MARK_SRC = "/brand/island-hype-mark-128.webp";

/** Measured from the generated masters, and the reason "horizontal" exists. */
const WORDMARK = { w: 863, h: 144 };
const LOCKUP = { w: 863, h: 504 };
const MARK = { w: 326, h: 309 };

export interface LogoProps {
  /**
   * "horizontal" is the mark beside the words — the whole logo, laid out for a
   * nav bar. "lockup" is the supplied stacked artwork, mark above the words, for
   * the footer where there is vertical room. "wordmark" is the words alone.
   *
   * The horizontal arrangement is not a stylistic preference, it is arithmetic.
   * In the supplied lockup "MALDIVES" is 5.4% of the height and "ISLAND HYPE" is
   * 16.5%, so a lockup small enough for a header renders MALDIVES at about 4px
   * and the name at 13px. Setting the mark beside the words instead gives the
   * name 15px in a header that is 30px SHORTER — the mark keeps its size because
   * it no longer has to share the vertical space.
   */
  form?: "horizontal" | "wordmark" | "lockup";
  /** What it is sitting on. Decides whether it gets a pill. */
  ground: "photo" | "ink" | "white";
  /** Rendered width in px. Height follows the aspect ratio. */
  width?: number;
  priority?: boolean;
  className?: string;
}

export function Logo({
  form = "horizontal",
  ground,
  width,
  priority = false,
  className,
}: LogoProps) {
  const onPhoto = ground === "photo";

  // Default widths per form, chosen so the name reads at a normal header size.
  const w = width ?? (form === "lockup" ? 220 : form === "wordmark" ? 200 : 216);

  const plain = (
    src: string,
    box: { w: number; h: number },
    px: number,
    extra?: string
  ) => (
    // A plain <img>: the project runs next/image with unoptimized: true, so
    // next/image adds indirection and gives nothing back. See photo-frame.tsx.
    <img
      src={src}
      alt=""
      width={px}
      height={Math.round((px * box.h) / box.w)}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={cn("block", extra)}
      style={{ width: px, height: Math.round((px * box.h) / box.w) }}
    />
  );

  let content: React.ReactNode;
  if (form === "horizontal") {
    // Split the width between mark and words, with the gap taken out first.
    const gap = Math.round(w * 0.055);
    const markW = Math.round(w * 0.2);
    const wordW = w - markW - gap;
    // Below md the words are dropped and only the mark shows. That is the same
    // breakpoint at which the nav collapses its links to a hamburger, so the bar
    // sheds the wordmark and the menu together rather than at two different
    // widths. It also buys back the room the hamburger needs: at 390px a 208px
    // logo plus a 44px button plus the gutters is most of the screen.
    //
    // The mark is a touch larger on mobile, because on its own it is the whole
    // logo rather than an adornment next to the words.
    const markMobile = Math.round(markW * 1.15);
    content = (
      <>
        {plain(MARK_SRC, MARK, markMobile, "md:hidden")}
        <span className="hidden items-center md:inline-flex" style={{ gap }}>
          {plain(MARK_SRC, MARK, markW)}
          {plain(WORDMARK_SRC, WORDMARK, wordW)}
        </span>
      </>
    );
  } else if (form === "lockup") {
    content = plain(LOCKUP_SRC, LOCKUP, w);
  } else {
    content = plain(WORDMARK_SRC, WORDMARK, w);
  }

  return (
    <Link
      href="/"
      aria-label="Island Hype Maldives — home"
      className={cn(
        "inline-flex shrink-0 items-center",
        // The pill: the nav's own radius and a white fill, so the logo belongs to
        // the same family as the link pill beside it.
        onPhoto &&
          "rounded-full bg-white px-5 py-2.5 shadow-[0_2px_12px_rgba(28,27,27,0.18)]",
        className
      )}
    >
      {content}
    </Link>
  );
}
