"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

export default function Hero() {
    return (
        <section className="relative h-screen min-h-[700px] overflow-hidden bg-secondary lg:h-[90vh]">
            <div className="container mx-auto flex h-full items-center px-6 pt-20 lg:px-12 lg:pt-0">
                <div className="z-20 w-full lg:w-1/2 lg:mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 5 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="relative rounded-2xl bg-white/30 p-8 backdrop-blur-lg lg:bg-transparent lg:p-0 lg:backdrop-blur-0"
                    >
                        <span className="mb-4 block text-[13px] font-bold uppercase tracking-[0.2em] text-accent">
                            Expertise You Can Trust
                        </span>
                        <h1 className="mb-6 text-3xl font-serif leading-tight text-primary lg:text-7xl">
                            Elevating Your <br />
                            <span className="italic uppercase lg:normal-case">Tennessee</span> Lifestyle
                        </h1>
                        <p className="mb-8 max-w-lg text-sm font-medium text-primary lg:text-xl">
                            Savanna helps you find more than just a house. Discover the perfect place to call home in the heart of TN.
                        </p>
                        <div className="flex flex-col gap-4 sm:flex-row">
                            <button className="flex items-center justify-center gap-2 bg-primary px-8 py-4 text-white transition-all hover:bg-primary-light">
                                Browse Listings
                                <ArrowRight size={18} />
                            </button>
                            <button className="border border-primary px-8 py-4 text-primary transition-all hover:bg-primary/5">
                                Contact Savanna
                            </button>
                        </div>
                    </motion.div>
                </div>

                <motion.div
                    className="absolute right-0 top-0 h-full w-full lg:w-[60%]"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 1.2, ease: "easeOut" }}
                >
                    <div className="relative h-full w-full">
                        <Image
                            src="/savanna-hero.jpg"
                            alt="Savanna - Tennessee Real Estate Expert"
                            fill
                            className="object-cover object-[70%_center] lg:object-center"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary via-secondary/20 to-transparent lg:block hidden" />
                        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/10 lg:hidden" />
                    </div>
                </motion.div>
            </div>

            {/* Decorative accent */}
            <div className="absolute bottom-0 left-0 h-1 w-full bg-accent/20" />
        </section>
    );
}
