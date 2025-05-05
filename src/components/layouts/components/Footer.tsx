import { Button } from "@/components/ui/button";
import { ProjectUrls } from "@/constants";
import Link from "next/link";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full py-8 px-4 border-t">
      <div className="container mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-4 md:mb-0">
            <p className="text-sm text-muted-foreground">
              © {year} Trenova. All rights reserved.
            </p>
          </div>
          <nav>
            <ul className="flex flex-wrap gap-4 justify-center">
              {links.map((link, index) => (
                <li key={index}>
                  <Button
                    asChild
                    variant="link"
                    className="text-accent-foreground px-0"
                  >
                    <Link href={link.href}>{link.text}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  );
}

interface LinkItem {
  text: string;
  href: string;
}

const links: LinkItem[] = [
  { text: "Privacy Policy", href: ProjectUrls.privacyPolicy },
  { text: "Terms of Service", href: ProjectUrls.termsOfService },
  { text: "About Us", href: ProjectUrls.aboutUs },
];
