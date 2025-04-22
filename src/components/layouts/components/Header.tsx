"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { useState, useEffect } from "react";
import { ProjectUrls } from "@/constants";
import { User } from "@supabase/supabase-js";
import { supabaseClient } from "@/db/supabase.client";
import { signOut } from "@/db/actions/auth/sign-out";

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
          {currentUser ? (
            <>
              <Button variant="default" asChild>
                <Link href={ProjectUrls.trainingPlans}>Dashboard</Link>
              </Button>
              <Button variant="ghost" onClick={handleLogout}>
                Wyloguj się
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href={ProjectUrls.signIn}>Zaloguj się</Link>
              </Button>
              <Button asChild>
                <Link href={ProjectUrls.signUp}>Zarejestruj się</Link>
              </Button>
            </>
          )}
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
                    Wyloguj się
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
                      Zaloguj się
                    </Link>
                  </Button>
                  <Button asChild className="w-full justify-start">
                    <Link
                      href={ProjectUrls.signUp}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Zarejestruj się
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
