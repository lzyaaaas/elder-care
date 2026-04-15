import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/public/SectionHeading";
import { donorReceiveItems } from "../../data/site-content";

export function StorybookPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
        <div className="rounded-[2.8rem] bg-gradient-to-br from-pine-800 to-ink-950 p-8 text-white shadow-panel sm:p-10">
          <p className="text-xs uppercase tracking-[0.28em] text-gold-300">What donors receive</p>
          <h1 className="mt-5 max-w-lg font-display text-5xl leading-none">A thoughtful thank-you, shaped through story.</h1>
          <p className="mt-6 max-w-md text-base leading-8 text-white/78">
            Supporters receive more than a single item. They receive a warm story-led experience built around Chao Feng and Maui in: Making Friends and the larger message of care behind the campaign.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/donate" variant="accent">
              Donate Now
            </Button>
          </div>
        </div>

        <div>
          <SectionHeading
            eyebrow="Gifts"
            title="Here is the meaningful experience your support helps unlock."
            description="We present donor recognition with warmth and care. Each piece is meant to feel like part of a generous thank-you experience, not a commercial bundle."
          />
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {donorReceiveItems.map((item, index) => (
              <article
                key={item.title}
                className={`rounded-[1.9rem] border border-ink-950/8 p-6 shadow-soft ${
                  index % 2 === 0
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,241,229,0.72))]"
                    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,243,242,0.78))]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-pine-800">Included</p>
                <h3 className="mt-4 font-display text-2xl leading-tight text-ink-950">{item.title}</h3>
                <p className="mt-3 text-base leading-8 text-ink-900/70">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>

      <section className="mt-20 rounded-[2.6rem] border border-ink-950/8 bg-white/78 px-8 py-10 shadow-soft sm:px-10 sm:py-12">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-600">Donor experience</p>
        <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-ink-950">
          Every contribution supports elder care and returns as a story-led thank-you with real emotional meaning.
        </h2>
        <p className="mt-5 max-w-3xl text-base leading-8 text-ink-900/72">
          The goal is simple: help supporters feel the warmth of the campaign while keeping the charitable purpose clear and central.
        </p>
        <div className="mt-8">
          <Button as={Link} to="/donate" variant="accent">
            Donate to Receive the Gifts
          </Button>
        </div>
      </section>
    </div>
  );
}
