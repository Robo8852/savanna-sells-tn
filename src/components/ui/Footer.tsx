import Link from "next/link";
import { Mail, Phone, Instagram, Facebook, Linkedin } from "lucide-react";

export default function Footer() {
    return (
        <footer className="bg-primary pt-24 pb-12 text-white">
            <div className="container mx-auto px-6 md:px-12">
                <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-4">
                    <div className="col-span-1 lg:col-span-2">
                        <Link href="/" className="mb-6 block">
                            <span className="font-serif text-3xl font-bold tracking-tight">
                                SAVANNA <span className="font-sans font-light text-accent">SELLS TN</span>
                            </span>
                        </Link>
                        <p className="mb-8 max-w-sm text-white/60">
                            Dedicated to providing unparalleled real estate expertise and personalized service across the beautiful state of Tennessee.
                        </p>
                        <div className="flex gap-4">
                            <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-accent hover:text-accent">
                                <Instagram size={20} />
                            </Link>
                            <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-accent hover:text-accent">
                                <Facebook size={20} />
                            </Link>
                            <Link href="#" className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 transition-colors hover:border-accent hover:text-accent">
                                <Linkedin size={20} />
                            </Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="mb-6 font-serif text-xl">Quick Links</h4>
                        <ul className="space-y-4">
                            <li><Link href="#" className="text-white/60 transition-colors hover:text-white">Home</Link></li>
                            <li><Link href="#listings" className="text-white/60 transition-colors hover:text-white">Property Listings</Link></li>
                            <li><Link href="#about" className="text-white/60 transition-colors hover:text-white">About Savanna</Link></li>
                            <li><Link href="#contact" className="text-white/60 transition-colors hover:text-white">Contact</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="mb-6 font-serif text-xl">Contact</h4>
                        <ul className="space-y-4">
                            <li className="flex items-center gap-3 text-white/60">
                                <Phone size={18} className="text-accent" />
                                (123) 456-7890
                            </li>
                            <li className="flex items-center gap-3 text-white/60">
                                <Mail size={18} className="text-accent" />
                                savanna@savannasellstn.com
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="mt-24 flex flex-col items-center justify-between border-t border-white/10 pt-12 md:flex-row">
                    <p className="text-sm text-white/40">
                        &copy; {new Date().getFullYear()} Savanna Sells TN. All rights reserved.
                    </p>
                    <p className="mt-4 text-sm text-white/40 md:mt-0">
                        Designed for Excellence
                    </p>
                </div>
            </div>
        </footer>
    );
}
