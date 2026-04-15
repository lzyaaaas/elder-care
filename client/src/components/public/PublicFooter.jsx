import { Link } from "react-router-dom";

export function PublicFooter() {
  return (
    <footer className="border-t border-ink-950/8 bg-white/60">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.3fr_0.7fr_0.7fr] lg:px-8">
        <div>
          <p className="font-display text-2xl text-ink-950">Creators</p>
          <p className="mt-3 max-w-md text-sm leading-7 text-ink-900/70">
            Creators is a nonprofit storybook project system that keeps the mission visible while the
            operations stay organized behind the scenes.
          </p>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink-900/55">
            Explore
          </p>
          <div className="mt-4 flex flex-col gap-3 text-sm text-ink-900/75">
            <Link to="/about">About the campaign</Link>
            <Link to="/gifts">Gifts</Link>
            <Link to="/feedback">Share feedback</Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.22em] text-ink-900/55">
            Contact
          </p>
          <div className="mt-4 space-y-3 text-sm text-ink-900/75">
            <p>storycart@example.org</p>
            <p>Shanghai storytelling outreach team</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
