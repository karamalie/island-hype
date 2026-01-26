// components/home/footer.tsx
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { IconButton } from "@/components/ui/icon-button";
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
            <a
              href="#"
              className="inline-flex items-center gap-2 text-sm mt-4 text-white hover:text-gray-300 transition-colors"
            >
              More About us <Icons.arrowUpRight className="w-4 h-4" />
            </a>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold mb-4 text-white">Navigation</h4>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Packages
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Accommodations
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Locations
                </a>
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
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  About Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  FAQ
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Terms of Service
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 pt-8 border-t border-white/10">
          <div className="flex gap-3">
            <IconButton
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Icons.facebook className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Icons.instagram className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Icons.twitter className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Icons.linkedin className="w-4 h-4" />
            </IconButton>
            <IconButton
              variant="outline"
              size="sm"
              className="border-white/20 text-white hover:bg-white/10"
            >
              <Icons.youtube className="w-4 h-4" />
            </IconButton>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 Island Hype Maldives. All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
