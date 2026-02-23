import Hero from "@/components/sections/Hero";
import ListingsGrid from "@/components/sections/ListingsGrid";
import ContactForm from "@/components/ui/ContactForm";

export default function Home() {
  return (
    <div>
      <Hero />
      <ListingsGrid />

      {/* Bio / About Section */}
      <section id="about" className="py-24 bg-white overflow-hidden">
        <div className="container mx-auto px-6 md:px-12">
          <div className="grid gap-16 md:grid-cols-2 items-center">
            <div className="relative">
              <div className="absolute -left-4 -top-4 h-full w-full border border-accent/20" />
              <div className="relative h-[600px] w-full">
                <img
                  src="/local-expertise.jpg"
                  alt="Savanna - Local Expertise"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
            <div>
              <span className="mb-4 block text-sm font-medium uppercase tracking-[0.2em] text-accent">
                Local Expertise
              </span>
              <h2 className="mb-8 text-4xl font-serif text-primary md:text-5xl">Meet Savanna</h2>
              <p className="mb-6 text-lg text-primary/80">
                With years of experience in the Tennessee real estate market, Savanna brings a personalized approach to every transaction. Whether you're buying your first home or selling a luxury estate, her commitment to excellence ensures a seamless experience.
              </p>
              <p className="mb-8 text-lg text-primary/80">
                Now calling Franklin, TN home, she has an intimate knowledge of the local neighborhoods, schools, and market trends that make Middle Tennessee so special.
              </p>
              <button className="bg-primary px-8 py-4 text-white transition-all hover:bg-primary-light">
                Read Full Bio
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section id="contact" className="py-24 bg-primary text-white">
        <div className="container mx-auto px-6">
          <div className="text-center">
            <h2 className="mb-6 text-4xl font-serif md:text-5xl">Ready to Start Your Journey?</h2>
            <p className="mb-10 mx-auto max-w-2xl text-lg text-white/70">
              Contact Savanna today for a complimentary market analysis or to schedule a viewing of our exclusive properties.
            </p>
          </div>
          <div className="mx-auto max-w-md rounded-xl bg-white p-6 shadow-lg">
            <ContactForm />
          </div>
        </div>
      </section>
    </div>
  );
}
