import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/public/SectionHeading";
import { causePillars } from "../../data/site-content";

export function CausePage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[1.02fr_0.98fr] lg:items-center">
        <div>
          <SectionHeading
            eyebrow="The cause"
            title="Why this campaign supports elder care."
            description="This campaign supports Elder Care Foundation in a way that feels personal and meaningful. Every donation helps strengthen companionship, dignity, and wellness for older adults while inviting more families into the work of care."
          />

          <div className="mt-10 flex flex-wrap gap-4">
            <Button as={Link} to="/donate" variant="accent">
              Donate Now
            </Button>
            <Button as={Link} to="/feedback" variant="secondary">
              Hear from Supporters
            </Button>
          </div>
        </div>

        <div className="rounded-[2.8rem] border border-ink-950/8 bg-[linear-gradient(160deg,#f7efe3_0%,#fbf7f0_42%,#e8efef_100%)] p-8 shadow-soft sm:p-10">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-600">A human need</p>
          <h2 className="mt-4 max-w-lg font-display text-4xl leading-tight text-ink-950">
            Care is not only practical. It is emotional, relational, and deeply human.
          </h2>
          <p className="mt-5 max-w-xl text-base leading-8 text-ink-900/72">
            Older adults deserve more than support in name alone. They deserve community, dignity, and the steady reminder that they are valued.
          </p>
        </div>
      </div>

      <section className="mt-16">
        <div className="grid gap-8 lg:grid-cols-3">
          {causePillars.map((item) => (
            <article
              key={item.title}
              className="rounded-[2.1rem] border border-ink-950/8 bg-white/78 p-8 shadow-soft"
            >
              <div className="h-1.5 w-16 rounded-full bg-gradient-to-r from-terracotta-500 to-gold-300" />
              <h3 className="mt-6 font-display text-[1.9rem] leading-tight text-ink-950">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-ink-900/70">{item.description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-20 rounded-[2.6rem] bg-ink-950 px-8 py-10 text-white shadow-panel sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-gold-300">Take part</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight">
          Help extend companionship, dignity, and everyday care for older adults.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-white/76">
          Your donation supports Elder Care Foundation while sharing a story-led message of kindness and belonging.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/donate" variant="accent">
            Donate Now
          </Button>
        </div>
      </section>
    </div>
  );
}
