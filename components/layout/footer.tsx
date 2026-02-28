// components/home/footer.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/ui/icons";

export function Footer() {
  return (
    <footer className="bg-gray-950 text-white py-16">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Newsletter */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 pb-12 border-b border-white/10">
          <div>
            <h3 className="text-3xl font-bold text-white">
              Book Your Tour Today!
            </h3>
            <p className="text-gray-400 mt-2">
              Join us for an unforgettable Maldives adventure
            </p>
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            <Input
              variant="outline"
              placeholder="Enter your email"
              className="bg-transparent border-white/20 text-white placeholder:text-gray-500 md:w-64"
            />
            <Button variant="white">Subscribe</Button>
          </div>
        </div>

        {/* Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 py-12">
          {/* Brand */}
          <div>
            <h2 className="text-2xl font-display italic mb-4 text-white">
              Island Hype
            </h2>
            <p className="text-gray-400 text-sm leading-relaxed">
              Discover the awe-inspiring beauty of the Maldives with our
              exclusive tour packages. Experience paradise like never before.
            </p>
            <Link
              href="/guide"
              className="inline-flex items-center gap-2 text-sm mt-4 text-white hover:text-gray-300 transition-colors"
            >
              More About us <Icons.arrowUpRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/packages"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Packages
                </Link>
              </li>
              <li>
                <Link
                  href="/accommodations"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accommodations
                </Link>
              </li>
              <li>
                <Link
                  href="/locations"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Locations
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Contact Us</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Icons.phone className="w-4 h-4" />
                +960 123 4567
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Icons.mail className="w-4 h-4" />
                hello@islandhype.mv
              </li>
            </ul>
            <h4 className="font-semibold mt-6 mb-4 text-white">Location</h4>
            <p className="text-gray-400 text-sm flex items-start gap-2">
              <Icons.mapPin className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>
                Island Hype Tours
                <br />
                Malé, Maldives
              </span>
            </p>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Company & Legal</h4>
            <ul className="space-y-3">
              <li>
                <Link
                  href="/guide"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/guide" className="text-gray-400 hover:text-white transition-colors">
                  FAQ & Travel Guide
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service (Request)
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy (Request)
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <div className="flex gap-3">
            <a
              href="https://www.facebook.com/islandhype"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Island Hype on Facebook"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <Icons.facebook className="w-4 h-4" />
            </a>
            <a
              href="https://www.instagram.com/islandhype"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Island Hype on Instagram"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <Icons.instagram className="w-4 h-4" />
            </a>
            <a
              href="https://x.com/islandhype"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Island Hype on X"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <Icons.twitter className="w-4 h-4" />
            </a>
            <a
              href="https://www.linkedin.com/company/islandhype"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Island Hype on LinkedIn"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <Icons.linkedin className="w-4 h-4" />
            </a>
            <a
              href="https://www.youtube.com/@islandhype"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Island Hype on YouTube"
              className="inline-flex items-center justify-center w-8 h-8 rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
            >
              <Icons.youtube className="w-4 h-4" />
            </a>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Island Hype Maldives. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
