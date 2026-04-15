import { Link } from "react-router-dom";

import { Button } from "../common/Button";

export function CampaignBanner() {
  return (
    <section className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8 lg:pt-10">
      <div className="overflow-hidden rounded-[1.6rem] border border-[#e8dac0] bg-[linear-gradient(180deg,rgba(255,251,244,0.94),rgba(244,237,225,0.72))] shadow-[0_22px_48px_rgba(31,41,55,0.1),inset_0_1px_0_rgba(255,255,255,0.85)]">
        <img
          src="/banner.jpg"
          alt="Friendship, kindness, and elder care campaign banner"
          className="block h-auto w-full"
        />
      </div>

      <div className="mt-5 flex justify-end">
        <Button
          as={Link}
          to="/donate"
          variant="accent"
          className="px-8 py-4 text-base font-medium shadow-[0_14px_28px_rgba(184,87,53,0.18)] sm:px-10 sm:text-lg"
        >
          Donate Now
        </Button>
      </div>
    </section>
  );
}
