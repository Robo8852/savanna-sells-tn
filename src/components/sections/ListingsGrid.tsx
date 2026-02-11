"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { Bed, Bath, Square, MapPin } from "lucide-react";

const MOCK_PROPERTIES = [
    {
        id: 1,
        title: "Modern Oasis",
        location: "Nashville, TN",
        price: "$850,000",
        beds: 4,
        baths: 3,
        sqft: 2800,
        image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 2,
        title: "Luxury Estate",
        location: "Franklin, TN",
        price: "$1,200,000",
        beds: 5,
        baths: 4.5,
        sqft: 4200,
        image: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&q=80&w=800",
    },
    {
        id: 3,
        title: "Hillside Retreat",
        location: "Brentwood, TN",
        price: "$975,000",
        beds: 4,
        baths: 3.5,
        sqft: 3100,
        image: "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&q=80&w=800",
    },
];

export default function ListingsGrid() {
    return (
        <section id="listings" className="py-24 bg-secondary/30">
            <div className="container mx-auto px-6 md:px-12">
                <div className="mb-16 flex flex-col items-end justify-between gap-6 md:flex-row md:items-center">
                    <div>
                        <span className="mb-4 block text-sm font-medium uppercase tracking-[0.2em] text-accent">
                            Exclusive Inventory
                        </span>
                        <h2 className="text-4xl font-serif text-primary md:text-5xl">Featured Listings</h2>
                    </div>
                    <button className="border-b border-primary pb-1 font-medium text-primary transition-all hover:text-accent hover:border-accent">
                        View All Properties
                    </button>
                </div>

                <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                    {MOCK_PROPERTIES.map((property, index) => (
                        <motion.div
                            key={property.id}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="group cursor-pointer bg-white shadow-sm transition-all hover:shadow-xl"
                        >
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={property.image}
                                    alt={property.title}
                                    fill
                                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                                />
                                <div className="absolute left-4 top-4 bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                                    For Sale
                                </div>
                            </div>
                            <div className="p-6">
                                <div className="mb-2 flex items-center gap-1 text-sm text-primary/60">
                                    <MapPin size={14} className="text-accent" />
                                    {property.location}
                                </div>
                                <h3 className="mb-4 text-2xl font-serif text-primary">{property.title}</h3>
                                <div className="mb-6 grid grid-cols-3 border-y border-gray-100 py-4">
                                    <div className="flex flex-col items-center border-r border-gray-100">
                                        <span className="flex items-center gap-1 text-sm font-medium">
                                            <Bed size={16} className="text-accent" /> {property.beds}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-tighter text-gray-400">Beds</span>
                                    </div>
                                    <div className="flex flex-col items-center border-r border-gray-100">
                                        <span className="flex items-center gap-1 text-sm font-medium">
                                            <Bath size={16} className="text-accent" /> {property.baths}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-tighter text-gray-400">Baths</span>
                                    </div>
                                    <div className="flex flex-col items-center">
                                        <span className="flex items-center gap-1 text-sm font-medium">
                                            <Square size={16} className="text-accent" /> {property.sqft}
                                        </span>
                                        <span className="text-[10px] uppercase tracking-tighter text-gray-400">Sqft</span>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-semibold text-primary">{property.price}</span>
                                    <button className="text-sm font-semibold uppercase tracking-wider text-accent group-hover:underline">
                                        Details
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
