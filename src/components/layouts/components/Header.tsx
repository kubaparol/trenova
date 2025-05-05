"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { ProjectUrls } from "@/constants";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/db/supabase.client";
import { signOut } from "@/db/actions/auth/sign-out";
import Logo from "@/components/shared/Logo";
import { ModeToggle } from "@/components/shared/ModeToggle";
import { cn } from "@/utils";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [isMenuOpen]);

  useEffect(() => {
    setCurrentUser(initialUser);

    const {
      data: { subscription },
    } = supabaseClient.auth.onAuthStateChange((_event, session) => {
      setCurrentUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, [initialUser]);

  const handleLogout = async () => {
    await signOut();

    setIsMenuOpen(false);
  };

  return (
    <header
      className={cn(
        "w-full px-4 md:px-6 lg:px-8 border-b bg-transparent py-5 fixed top-0 left-0 z-50 transition-all duration-300",
        isScrolled && "bg-background backdrop-blur-md py-3 shadow-lg"
      )}
    >
      <div className="container mx-auto flex justify-between items-center">
        <Link href={ProjectUrls.home} className="flex items-center">
          <Logo />
        </Link>

        <div className="hidden lg:flex items-center space-x-4">
          <Button
            asChild
            variant="link"
            className="text-accent-foreground px-3"
          >
            <Link href={`${ProjectUrls.home}#how-it-works`}>How It Works</Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="text-accent-foreground px-3"
          >
            <Link href={`${ProjectUrls.home}#features`}>Features</Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="text-accent-foreground px-3"
          >
            <Link href={`${ProjectUrls.home}#technology`}>Technology</Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="text-accent-foreground px-3"
          >
            <Link href={`${ProjectUrls.home}#testimonials`}>Testimonials</Link>
          </Button>

          <Button
            asChild
            variant="link"
            className="text-accent-foreground px-3"
          >
            <Link href={ProjectUrls.aboutUs}>About Us</Link>
          </Button>
        </div>

        {/* Mobile menu button */}
        <div className="lg:hidden space-x-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <Menu className="h-6 w-6" />
          </Button>

          <ModeToggle />
        </div>

        {/* Desktop navigation */}
        <nav className="hidden lg:flex items-center space-x-2">
          <ModeToggle />
          {currentUser ? (
            <>
              <Button variant="default" asChild>
                <Link href={ProjectUrls.dashboard}>Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Log Out
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" asChild>
                <Link href={ProjectUrls.signIn}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href={ProjectUrls.signUp}>Sign Up</Link>
              </Button>
            </>
          )}
        </nav>

        {/* Mobile navigation */}
        <div
          className={cn(
            "absolute top-[61px] left-0 right-0 bg-background z-50 border-b lg:hidden",
            !isScrolled && "top-[77px]",
            "transition-all duration-300 ease-in-out transform",
            isMenuOpen
              ? "opacity-100 translate-y-0"
              : "opacity-0 -translate-y-4 pointer-events-none"
          )}
        >
          <div className="container mx-auto py-4 px-4 flex flex-col space-y-2">
            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`${ProjectUrls.home}#how-it-works`}>
                How It Works
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`${ProjectUrls.home}#features`}>Features</Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`${ProjectUrls.home}#technology`}>Technology</Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={`${ProjectUrls.home}#testimonials`}>
                Testimonials
              </Link>
            </Button>

            <Button asChild variant="ghost" className="w-full justify-start">
              <Link href={ProjectUrls.aboutUs}>About Us</Link>
            </Button>

            {currentUser ? (
              <>
                <Button
                  variant="default"
                  asChild
                  className="w-full justify-start"
                >
                  <Link href={ProjectUrls.trainingPlans}>Dashboard</Link>
                </Button>

                <Button
                  variant="ghost"
                  onClick={handleLogout}
                  className="w-full justify-start"
                >
                  Log Out
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  asChild
                  className="w-full justify-start"
                >
                  <Link
                    href={ProjectUrls.signIn}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                </Button>
                <Button asChild className="w-full justify-start">
                  <Link
                    href={ProjectUrls.signUp}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
