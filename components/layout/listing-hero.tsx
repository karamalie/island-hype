import Image from "next/image";
import { ReactNode } from "react";
import { Navbar } from "@/components/layout/nav-bar";
import { Container } from "@/components/ui/container";
import { cn } from "@/lib/utils";

interface ListingHeroProps {
  title: ReactNode;
  subtitle?: ReactNode;
  badge?: ReactNode;
  stats?: ReactNode;
  backgroundSrc: string;
  backgroundAlt: string;
  overlayTone?: "soft" | "medium" | "strong";
  showLogo?: boolean;
}

const overlayClasses = {
  soft: "from-black/45 via-black/25 to-black/15",
  medium: "from-black/60 via-black/38 to-black/24",
  strong: "from-black/72 via-black/50 to-black/32",
} as const;

export function ListingHero({
  title,
  subtitle,
  badge,
  stats,
  backgroundSrc,
  backgroundAlt,
  overlayTone = "medium",
  showLogo = true,
}: ListingHeroProps) {
  return (
    <section className="relative min-h-[clamp(24rem,52vh,36rem)] overflow-hidden">
      <div className="absolute inset-0 z-0">
        <Image
          src={backgroundSrc}
          alt={backgroundAlt}
          fill
          className="object-cover"
          priority
        />
        <div
          className={cn(
            "absolute inset-0 bg-gradient-to-r",
            overlayClasses[overlayTone]
          )}
        />
      </div>

      <Navbar variant="overlay" showLogo={showLogo} />

      <Container className="relative z-10 pt-28 pb-14 md:pt-32 md:pb-16">
        <div className="max-w-4xl">
          {badge}
          <h1 className="text-5xl md:text-6xl leading-[1.08] text-white mb-5 max-w-4xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="text-lg md:text-xl text-white/90 leading-relaxed max-w-2xl">
              {subtitle}
            </p>
          ) : null}
          {stats ? <div className="mt-7">{stats}</div> : null}
        </div>
      </Container>
    </section>
  );
}
