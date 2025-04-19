"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState } from "react";
import { ProjectUrls } from "@/constants";

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="w-full py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <span className="text-xl font-bold text-primary">Trenova</span>
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Zamknij menu" : "Otwórz menu"}
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>

        {/* Desktop navigation */}
        <nav className="hidden md:flex items-center space-x-4">
          <Button variant="ghost" asChild>
            <Link href={ProjectUrls.signIn}>Zaloguj się</Link>
          </Button>
          <Button asChild>
            <Link href={ProjectUrls.signUp}>Zarejestruj się</Link>
          </Button>
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background z-50 border-b md:hidden">
            <div className="container mx-auto py-4 px-4 flex flex-col space-y-2">
              <Button variant="ghost" asChild className="w-full justify-start">
                <Link href={ProjectUrls.signIn}>Zaloguj się</Link>
              </Button>
              <Button asChild className="w-full justify-start">
                <Link href={ProjectUrls.signUp}>Zarejestruj się</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
