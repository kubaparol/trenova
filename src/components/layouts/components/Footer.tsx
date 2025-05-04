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
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.text}
                  </Link>
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
  { text: "Privacy Policy", href: "#" },
  { text: "Terms of Service", href: "#" },
  { text: "Contact", href: "#" },
  { text: "About Us", href: "#" },
];
