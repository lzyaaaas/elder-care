import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { CampaignBanner } from "../../components/public/CampaignBanner";
import { SectionHeading } from "../../components/public/SectionHeading";
import { ourStoryThemes } from "../../data/site-content";

export function AboutPage() {
  return (
    <div>
      <CampaignBanner />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
          <div className="relative overflow-hidden rounded-[2.8rem] border border-white/80 bg-[#f3eadf] shadow-panel">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(245,206,120,0.18),transparent_34%),radial-gradient(circle_at_bottom_right,rgba(124,166,180,0.18),transparent_28%)]" />
            <img
              src="/together.png"
              alt="Characters and family from the campaign story standing together on the beach"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#f6efe7] via-[#f6efe7]/70 to-transparent" />
            <div className="absolute inset-x-6 bottom-6 sm:inset-x-8 sm:bottom-8">
              <div className="max-w-md rounded-[1.8rem] border border-[#e6d3bb] bg-[linear-gradient(145deg,rgba(255,247,235,0.98)_0%,rgba(249,237,220,0.98)_38%,rgba(240,244,239,0.96)_100%)] px-6 py-5 shadow-[0_22px_55px_rgba(68,47,27,0.16)]">
                <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-600">
                  Our story
                </p>
                <p className="mt-3 text-base leading-8 text-ink-900/76">
                  What begins as a children&apos;s story grows into a message of welcome, care, and
                  belonging that reaches far beyond the page.
                </p>
              </div>
            </div>
          </div>

          <div>
            <SectionHeading
              eyebrow="Our story"
              title="A storybook meant to carry warmth, belonging, and intergenerational care."
              description="Chao Feng and Maui in: Making Friends is more than a gift for donors. It is the emotional heart of the campaign, shaped around friendship, family, compassion, and the kind of connection that makes people feel seen."
            />

            <div className="mt-10 space-y-5">
              {ourStoryThemes.map((item) => (
                <div
                  key={item.title}
                  className="rounded-[1.8rem] border border-ink-950/8 bg-white/72 px-6 py-5 shadow-soft"
                >
                  <h3 className="font-display text-2xl text-ink-950">{item.title}</h3>
                  <p className="mt-3 text-base leading-8 text-ink-900/70">{item.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button as={Link} to="/donate" variant="accent">
                Donate Now
              </Button>
              <Button as={Link} to="/gifts" variant="secondary">
                See the Gifts
              </Button>
            </div>
          </div>
        </div>

        <section className="mt-20 rounded-[2.6rem] border border-ink-950/8 bg-white/75 px-8 py-10 shadow-soft sm:px-10 sm:py-12">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pine-800">Why this story matters</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-tight text-ink-950">
            It brings together imagination, cultural warmth, and the reminder that care begins with how we welcome one another.
          </h2>
          <p className="mt-5 max-w-3xl text-base leading-8 text-ink-900/72">
            The story invites children, families, and supporters into a world where friendship feels brave, kindness feels magical, and belonging is something we make together.
          </p>
          <div className="mt-8">
            <Button as={Link} to="/donate" variant="accent">
              Donate to Support Elder Care
            </Button>
          </div>
        </section>
      </div>
    </div>
  );
}
