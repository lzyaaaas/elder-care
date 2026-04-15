import { Link, useLocation } from "react-router-dom";

import { Button } from "../../components/common/Button";

export function ThankYouPage() {
  const location = useLocation();
  const donorName = location.state?.donorName;
  const fromDonation = Boolean(location.state?.fromDonation);
  const createdAccount = Boolean(location.state?.createdAccount);
  const donationFrequency = location.state?.donationFrequency === "MONTHLY" ? "monthly" : "one-time";

  return (
    <div className="mx-auto flex max-w-4xl flex-col items-center px-4 py-24 text-center sm:px-6 lg:px-8">
      <div className="rounded-full bg-pine-700/12 px-4 py-2 text-sm font-semibold text-pine-800">
        Thank you
      </div>
      <h1 className="mt-8 font-display text-5xl leading-tight text-ink-950">
        {fromDonation
          ? `${donorName ? `${donorName}, ` : ""}your support is already making a difference.`
          : "Your support helps move the story forward."}
      </h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-900/72">
        {fromDonation
          ? `Your ${donationFrequency} gift has been recorded for Elder Care Foundation. ${
              createdAccount
                ? "Your donor account was created at the same time, so you can return to view updates, receipts, shipping, and feedback."
                : "The team can now continue with receipt handling, gift preparation, shipping, and follow-up care."
            }`
          : "The donation workflow is designed to continue beyond this moment, with internal receipt handling, gift kit preparation, shipping, and feedback tracking."}
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-4">
        {createdAccount ? (
          <Button as={Link} to="/sign-in" variant="accent">
            Sign in to your account
          </Button>
        ) : (
          <Button as={Link} to="/feedback" variant="accent">
            Leave feedback later
          </Button>
        )}
        <Button as={Link} to="/" variant="secondary">
          Return home
        </Button>
      </div>
    </div>
  );
}
