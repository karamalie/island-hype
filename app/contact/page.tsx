import { PageHero } from "@/components/layout/page-hero";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { Badge } from "@/components/ui/badge";
import { getImageUrl } from "@/lib/image-urls";
import { Mail, Phone, MapPin, Clock, Sparkles } from "lucide-react";

export const metadata = {
  title: "Contact Us | Island Hype",
  description:
    "Get in touch with Island Hype for custom Maldives travel packages, booking inquiries, and more.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      <PageHero
        backgroundSrc={getImageUrl("images", "hero/maldives-aerial.jpg")}
        backgroundAlt="Contact Island Hype"
        overlayTone="strong"
        minHeightClassName="min-h-[clamp(28rem,56vh,42rem)]"
        badge={
          <Badge variant="glass" size="lg" className="text-white border-white/20 mb-6 gap-2">
            <Sparkles className="w-4 h-4" />
            Personalized Travel Support
          </Badge>
        }
        title={
          <>
            Get in <span className="font-display italic">Touch</span>
          </>
        }
        subtitle="Have questions about Maldives packages, custom itineraries, or special requests? Our travel team responds quickly with tailored guidance."
      />

      {/* Contact Section */}
      <Section spacing="md" surface="plain" className="border-b border-gray-200">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <div className="bg-white rounded-3xl shadow-soft p-6 md:p-8 beam-border">
                <h2 className="text-2xl md:text-3xl font-bold text-maldives-ink mb-2">
                  Send us a message
                </h2>
                <p className="text-gray-600 mb-6">
                  Share your preferred islands, travel dates, and budget range.
                  We&apos;ll propose options that match your style.
                </p>
                <ContactForm />
              </div>
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl md:text-3xl font-bold text-maldives-ink mb-6">
                Contact Information
              </h2>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-5 shadow-soft">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl surface-maldives-icon flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-[var(--maldives-ocean-700)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Email
                      </p>
                      <a
                        href="mailto:hello@islandhype.com"
                        className="text-base text-maldives-ink hover:text-[var(--maldives-ocean-700)] transition-colors"
                      >
                        hello@islandhype.com
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-soft">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl surface-maldives-icon flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-[var(--maldives-ocean-700)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Phone
                      </p>
                      <a
                        href="tel:+9601234567"
                        className="text-base text-maldives-ink hover:text-[var(--maldives-ocean-700)] transition-colors"
                      >
                        +960 123 4567
                      </a>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-soft">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl surface-maldives-icon flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-[var(--maldives-ocean-700)]" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-500 mb-1">
                        Location
                      </p>
                      <p className="text-base text-maldives-ink">
                        Male&apos;, Maldives
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 p-6 rounded-2xl bg-maldives-sand-lagoon border border-cyan-100">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/80 flex items-center justify-center shrink-0">
                    <Clock className="w-5 h-5 text-[var(--maldives-ocean-700)]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-maldives-ink mb-1.5">
                      Response Time
                    </h3>
                    <p className="text-sm text-gray-700">
                      We usually reply within 24 hours. For urgent booking
                      requests, call us directly for faster support.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
