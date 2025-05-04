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

interface HeaderProps {
  user: User | null;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(initialUser);

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
    <header className="w-full py-4 px-4 md:px-6 lg:px-8 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="flex items-center">
          <Logo />
        </Link>

        {/* Mobile menu button */}
        <div className="md:hidden space-x-4">
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
        <nav className="hidden md:flex items-center space-x-2">
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
              <Button variant="ghost" asChild>
                <Link href={ProjectUrls.signIn}>Sign In</Link>
              </Button>
              <Button asChild>
                <Link href={ProjectUrls.signUp}>Sign Up</Link>
              </Button>
            </>
          )}

          <ModeToggle />
        </nav>

        {/* Mobile navigation */}
        {isMenuOpen && (
          <div className="absolute top-16 left-0 right-0 bg-background z-50 border-b md:hidden">
            <div className="container mx-auto py-4 px-4 flex flex-col space-y-2">
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
        )}
      </div>
    </header>
  );
}
