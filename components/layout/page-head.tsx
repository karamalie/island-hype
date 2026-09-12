// components/layout/page-head.tsx
//
// The photograph band at the top of a page, with the nav inside it.
//
// The scrim lives here rather than at the call site, and that is the whole point
// of the component: `nav-bar.tsx` used to rely on hero images happening to be
// dark, and a bright midday reef frame made the labels invisible. A page cannot
// forget a scrim it does not apply.
//
// Two heights: 640px for Home, where the hero is the page's thesis, and 380px for
// the listing heads. When there is no photograph yet, the teal-to-ink gradient
// stands in — and the mono photo caption is suppressed, because a caption naming
// a photograph that does not exist is a review artefact, not content.

import Image from "next/image";
import { NavBar, type NavBarProps } from "./nav-bar";
import { Label } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface PageHeadProps {
  eyebrow: string;
  title: string;
  lede?: string;
  /** Already a resolved URL. Null renders the stand-in ground. */
  image?: string | null;
  /**
   * Art direction, not just a smaller crop. A hero that reads fine on a desktop,
   * where the copy sits in the lower third, can be unusable on a phone, where the
   * same copy is nearly twice as tall and runs through the middle of the frame.
   * Pass a darker image here and the breakpoint swaps it.
   */
  mobileImage?: string | null;
  imageAlt?: string;
  height?: "hero" | "band";
  nav: Omit<NavBarProps, "surface">;
  /** Constrain the copy block to the page container, as the listing heads do. */
  contained?: boolean;
  children?: React.ReactNode;
}

export function PageHead({
  eyebrow,
  title,
  lede,
  image,
  mobileImage,
  imageAlt = "",
  height = "band",
  nav,
  contained = true,
  children,
}: PageHeadProps) {
  const isHero = height === "hero";

  return (
    <div
      className={cn("relative flex flex-col", isHero ? "min-h-[640px]" : "min-h-[380px]")}
      style={image ? undefined : { background: "var(--ground-photo)" }}
    >
      {image && mobileImage && (
        /* A <picture> rather than two next/image elements toggled with CSS:
           hiding an <img> does not stop the browser fetching it, so the CSS
           version downloaded both heroes on every load — 2.8 MB between them.
           A source/media pair fetches exactly one. next/image buys us nothing
           here anyway, since the project runs with unoptimized: true. */
        <picture>
          <source media="(max-width: 767px)" srcSet={mobileImage} />
          <source media="(min-width: 768px)" srcSet={image} />
          <img
            src={image}
            alt={imageAlt}
            fetchPriority="high"
            decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
          />
        </picture>
      )}
      {image && !mobileImage && (
        <Image
          src={image}
          alt={imageAlt}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
      )}

      {/* Mandatory. See the note above. */}
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{ background: isHero ? "var(--scrim-hero)" : "var(--scrim-band)" }}
      />

      <div className="relative">
        <NavBar {...nav} surface="glass" />
      </div>

      <div className="relative mt-auto px-[var(--gutter)] pb-10 pt-10">
        <div
          className={cn("mx-auto w-full", contained && "max-w-[var(--container-page)]")}
        >
          <div className={cn("min-w-0", isHero && "max-w-[700px]")}>
            <Label className="mb-4 text-white">{eyebrow}</Label>
            <h1
              className={cn(
                "m-0 mb-4 text-white",
                isHero ? "text-display-xl" : "text-display-l"
              )}
            >
              {title}
            </h1>
            {lede && (
              <p
                className={cn(
                  "m-0 max-w-[34em] text-white",
                  isHero
                    ? "text-[clamp(17px,1.6vw,20px)] leading-[1.55]"
                    : "text-[clamp(16px,1.5vw,18px)] leading-[1.55]"
                )}
              >
                {lede}
              </p>
            )}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
