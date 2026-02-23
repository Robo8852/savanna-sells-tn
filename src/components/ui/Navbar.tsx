"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, Phone } from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
    { name: "Home", href: "/" },
    { name: "Listings", href: "/listings" },
    { name: "About", href: "#about" },
    { name: "Contact", href: "#contact" },
];

export default function Navbar() {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header
            className={cn(
                "fixed top-0 z-50 w-full transition-all duration-300",
                scrolled ? "bg-white/80 backdrop-blur-md py-4 shadow-sm" : "bg-transparent py-6"
            )}
        >
            <div className="container mx-auto flex items-center justify-between px-6 md:px-12">
                <Link href="/" className="group relative">
                    <div className={cn(
                        "relative transition-all duration-300 rounded-lg px-3 py-1.5",
                        !scrolled && "bg-white/30 backdrop-blur-md lg:bg-transparent lg:backdrop-blur-0 lg:p-0"
                    )}>
                        <span className="font-serif text-2xl font-bold tracking-tight text-primary drop-shadow-[0_1px_1px_rgba(255,255,255,0.8)]">
                            SAVANNA <span className="font-sans font-light text-accent">SELLS TN</span>
                        </span>
                        <span className="absolute bottom-1 left-3 right-3 h-0.5 w-0 bg-accent transition-all duration-300 group-hover:w-[calc(100%-1.5rem)] lg:left-0 lg:right-0 lg:bottom-0 lg:group-hover:w-full" />
                    </div>
                </Link>

                {/* Desktop Nav */}
                <nav className="hidden items-center gap-10 lg:flex">
                    {NAV_LINKS.map((link) => (
                        <Link
                            key={link.name}
                            href={link.href}
                            className="text-sm font-medium uppercase tracking-[0.15em] text-primary transition-colors hover:text-accent"
                        >
                            {link.name}
                        </Link>
                    ))}
                    <Link
                        href="tel:+1234567890"
                        className="flex items-center gap-2 bg-primary px-5 py-2.5 text-sm font-medium text-white transition-all hover:bg-primary-light"
                    >
                        <Phone size={16} />
                        Call Now
                    </Link>
                </nav>

                {/* Mobile Toggle */}
                <button
                    className={cn(
                        "lg:hidden text-primary p-2 rounded-lg transition-all",
                        !scrolled && !mobileMenuOpen && "bg-white/30 backdrop-blur-md"
                    )}
                    onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                >
                    {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 overflow-hidden"
                    >
                        <div className="container mx-auto px-6 py-8 flex flex-col gap-6 text-center">
                            {NAV_LINKS.map((link) => (
                                <Link
                                    key={link.name}
                                    href={link.href}
                                    className="text-lg font-medium text-primary"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <Link
                                href="tel:+1234567890"
                                className="flex items-center justify-center gap-2 bg-primary px-6 py-3 text-white"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                <Phone size={18} />
                                Call Now
                            </Link>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}
