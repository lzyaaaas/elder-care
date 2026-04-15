import { Link } from "react-router-dom";

import { Button } from "../../components/common/Button";
import { SectionHeading } from "../../components/public/SectionHeading";
import { donorJourneySteps, donorReceiveItems, impactStats, trustHighlights } from "../../data/site-content";

export function HomePage() {
  return (
    <div>
      <section className="overflow-hidden">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 lg:py-14">
          <div className="grid gap-12 lg:grid-cols-[0.98fr_1.02fr] lg:items-center">
            <div className="max-w-3xl">
              <p className="inline-flex rounded-full border border-pine-800/12 bg-white/72 px-4 py-2 text-[11px] font-medium uppercase tracking-[0.28em] text-pine-800 shadow-soft">
                A storybook campaign for elder care
              </p>
              <h1 className="mt-6 max-w-3xl font-display text-[3.25rem] leading-[0.95] text-ink-950 sm:text-[4.2rem] lg:text-[5rem]">
                Give care through story.
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-8 text-ink-900/72">
                Support Elder Care Foundation through <span className="font-semibold text-ink-950">Chao Feng and Maui in: Making Friends</span> — a warm storybook and animated campaign celebrating family, friendship, and belonging. Your donation helps fund elder wellness and shares the story as a heartfelt thank-you.
              </p>
              <div className="mt-8 flex flex-wrap gap-4">
                <Button as={Link} to="/donate" variant="accent" className="px-7 font-medium">
                  Donate Now
                </Button>
                <Button as={Link} to="/gifts" variant="secondary" className="px-7 font-medium">
                  Preview the Story
                </Button>
              </div>
            </div>

            <div className="lg:pl-6">
              <div className="rounded-[2rem] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.76),rgba(249,242,232,0.66))] p-3 shadow-[0_24px_60px_rgba(31,41,55,0.12)] backdrop-blur-xl sm:p-4">
                <div className="overflow-hidden rounded-[1.5rem] border border-[#eadcc4] bg-[#fffaf2] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]">
                  <img
                    src="/care.png"
                    alt="A caring elder support campaign visual"
                    className="block h-full w-full object-cover"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-ink-950/8 bg-white/60">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
          {trustHighlights.map((item) => (
            <div key={item.title} className="py-4 lg:pr-8">
              <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pine-800">Why this matters</p>
              <h2 className="mt-3 font-display text-2xl text-ink-950">{item.title}</h2>
              <p className="mt-3 max-w-sm text-sm leading-7 text-ink-900/68">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="How it works"
          title="A simple way to turn a story-led gift into care."
          description="We want the donor journey to feel warm, easy, and meaningful. Give in support of elder care, receive the storybook as a thank-you, and help extend compassion across generations."
        />

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {donorJourneySteps.map((item) => (
            <article
              key={item.title}
              className="rounded-[2.2rem] border border-ink-950/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.88),rgba(250,244,234,0.72))] p-8 shadow-soft"
            >
              <div className="grid h-12 w-12 place-items-center rounded-full bg-[#f4ebdc] text-sm font-semibold uppercase tracking-[0.18em] text-pine-800">
                {item.step}
              </div>
              <h3 className="mt-6 font-display text-[1.9rem] leading-tight text-ink-950">{item.title}</h3>
              <p className="mt-4 text-base leading-8 text-ink-900/70">{item.description}</p>
            </article>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Button as={Link} to="/donate" variant="accent">
            Donate Now
          </Button>
          <Button as={Link} to="/gifts" variant="secondary">
            See What Donors Receive
          </Button>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <article className="rounded-[2.5rem] border border-ink-950/8 bg-[linear-gradient(145deg,#f8f1e5_0%,#f5ebdd_34%,#eef3f2_100%)] p-8 shadow-soft sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-terracotta-600">Our story</p>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-tight text-ink-950">
              Meet the heart behind Chao Feng and Maui in: Making Friends.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink-900/72">
              Explore the friendship, belonging, family warmth, and intergenerational compassion that shape the storybook at the center of this campaign.
            </p>
            <div className="mt-8">
              <Button as={Link} to="/our-story" variant="accent">
                Read Our Story
              </Button>
            </div>
          </article>

          <article className="rounded-[2.5rem] border border-ink-950/8 bg-white/78 p-8 shadow-soft sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pine-800">The cause</p>
            <h2 className="mt-4 max-w-md font-display text-4xl leading-tight text-ink-950">
              Why supporting elder care matters right now.
            </h2>
            <p className="mt-5 max-w-xl text-base leading-8 text-ink-900/72">
              Learn how companionship, dignity, wellness, and community support for older adults connect directly to the purpose of this campaign.
            </p>
            <div className="mt-8">
              <Button as={Link} to="/the-cause" variant="accent">
                Explore the Cause
              </Button>
            </div>
          </article>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
          <div>
            <SectionHeading
              eyebrow="What donors receive"
              title="A warm thank-you experience, centered on story."
              description="Supporters receive a thoughtful donor gift experience built around the storybook, digital access, and campaign materials that reflect the same values of care behind the cause."
            />
            <div className="mt-8">
              <Button as={Link} to="/gifts" variant="accent">
                See What Donors Receive
              </Button>
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {donorReceiveItems.slice(0, 2).map((item, index) => (
              <article
                key={item.title}
                className={`rounded-[2rem] border border-ink-950/8 p-7 shadow-soft ${
                  index % 2 === 0
                    ? "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(248,241,229,0.72))]"
                    : "bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(238,243,242,0.78))]"
                }`}
              >
                <p className="text-xs font-semibold uppercase tracking-[0.26em] text-pine-800">Included</p>
                <h3 className="mt-4 font-display text-[1.9rem] leading-tight text-ink-950">{item.title}</h3>
                <p className="mt-4 text-base leading-8 text-ink-900/70">{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="border-y border-ink-950/8 bg-[linear-gradient(180deg,rgba(255,255,255,0.58),rgba(244,237,227,0.72))]">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Campaign progress"
            title="Momentum that supporters can feel."
            description="This section is designed to connect with live campaign data later. For now, it shows the kind of progress indicators that build trust, visibility, and a sense of shared movement."
          />

          <div className="mt-12 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {impactStats.map((item) => (
              <article
                key={item.label}
                className="rounded-[2rem] border border-ink-950/8 bg-white/82 p-7 shadow-soft"
              >
                <p className="font-display text-4xl text-ink-950 sm:text-5xl">{item.value}</p>
                <p className="mt-4 text-sm uppercase tracking-[0.18em] text-ink-900/55">{item.label}</p>
              </article>
            ))}
          </div>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button as={Link} to="/donate" variant="accent">
              Join the Campaign
            </Button>
            <Button as={Link} to="/feedback" variant="secondary">
              Read Supporter Feedback
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="rounded-[2.5rem] bg-ink-950 px-8 py-10 text-white shadow-panel sm:px-12 sm:py-14">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-gold-300">
                Final call
              </p>
              <h2 className="mt-4 max-w-2xl font-display text-4xl leading-tight">
                Help us turn a storybook into a full campaign experience.
              </h2>
            </div>
            <Button as={Link} to="/donate" variant="accent" className="self-start lg:self-end">
              Open donation form
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
