import { Navbar } from "@/components/layout/nav-bar";
import { Container } from "@/components/ui/container";
import { Section } from "@/components/ui/section";
import { ContactForm } from "@/components/contact/contact-form";
import { Mail, Phone, MapPin } from "lucide-react";

export const metadata = {
  title: "Contact Us | Island Hype",
  description:
    "Get in touch with Island Hype for custom Maldives travel packages, booking inquiries, and more.",
};

export default function ContactPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero */}
      <section className="relative min-h-[40vh] flex items-center bg-slate-900">
        <Navbar variant="overlay" showLogo={true} />
        <Container className="relative z-10 pt-32 pb-16">
          <div className="max-w-2xl">
            <h1 className="text-4xl md:text-5xl lg:text-6xl mb-4 leading-tight text-white">
              Get in <span className="font-display italic">Touch</span>
            </h1>
            <p className="text-lg text-white/80 leading-relaxed">
              Have questions about our Maldives packages? Want a custom
              itinerary? We&apos;d love to hear from you.
            </p>
          </div>
        </Container>
      </section>

      {/* Contact Section */}
      <Section className="py-16">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
            {/* Contact Form */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Send us a message
              </h2>
              <ContactForm />
            </div>

            {/* Contact Info */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                Contact Information
              </h2>
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Email</p>
                    <a
                      href="mailto:hello@islandhype.com"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      hello@islandhype.com
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">Phone</p>
                    <a
                      href="tel:+9601234567"
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      +960 123 4567
                    </a>
                  </div>
                </div>

                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5 text-gray-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Location
                    </p>
                    <p className="text-sm text-gray-600">
                      Male&apos;, Maldives
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">
                  Response Time
                </h3>
                <p className="text-sm text-gray-600">
                  We typically respond within 24 hours. For urgent bookings,
                  please call us directly.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </Section>
    </main>
  );
}
