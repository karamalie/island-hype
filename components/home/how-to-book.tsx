// components/home/how-to-book.tsx
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/ui/icons";

const services = [
  "Transportation",
  "Exploration",
  "Tour Guide",
  "Adventure",
  "Diving",
  "Snorkeling",
  "Honeymoon",
  "Wellness",
  "Island Hopping",
  "Water Sports",
];

const steps = [
  {
    num: "01",
    title: "Choose Package",
    desc: "Visit our website and explore the various tour packages we offer. Select the one that best suits your interests.",
  },
  {
    num: "02",
    title: "Confirm Availability",
    desc: "Check the availability for your preferred tour dates. Contact us and our customer service team will assist you.",
  },
  {
    num: "03",
    title: "Make a Reservation",
    desc: "Once you've confirmed availability, fill out our online reservation form, including the chosen package and date.",
  },
  {
    num: "04",
    title: "Receive Confirmation",
    desc: "After your payment is processed, you'll receive a booking confirmation via email with all the necessary details.",
  },
];

export function HowToBook() {
  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Marquee */}
        <div className="overflow-hidden mb-16">
          <div className="animate-marquee flex gap-8 whitespace-nowrap">
            {[...services, ...services].map((item, i) => (
              <span
                key={i}
                className="flex items-center gap-4 text-2xl font-light text-gray-300"
              >
                <Icons.sparkle className="w-4 h-4 text-teal-400" />
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Heading */}
        <h2 className="text-5xl md:text-6xl font-bold mb-16 text-gray-900">
          How to Book Your Tour
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Info */}
          <div className="lg:col-span-1">
            <h3 className="text-2xl font-bold mb-4 text-gray-900">
              4 Easy Steps
            </h3>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Booking your Maldives adventure is easy and straightforward.
              Follow these four simple steps to secure your unforgettable
              experience.
            </p>
            <Button className="gap-2">
              Book Our Tour
              <Icons.arrowUpRight className="w-4 h-4" />
            </Button>
          </div>

          {/* Steps Grid */}
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-px bg-gray-200">
            {steps.map((step) => (
              <div key={step.num} className="bg-white p-8">
                <span className="text-4xl font-light text-gray-300">
                  {step.num}.
                </span>
                <h4 className="text-xl font-bold mt-4 mb-3 text-gray-900">
                  {step.title}
                </h4>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
