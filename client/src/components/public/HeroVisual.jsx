export function HeroVisual() {
  return (
    <div className="relative h-[460px] w-full animate-rise overflow-hidden rounded-[2.8rem] lg:h-[600px]">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(244,230,196,0.55),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(201,109,76,0.16),transparent_28%),linear-gradient(135deg,#f8f3ea_0%,#f2eadf_28%,#e6eef0_52%,#d7e2df_74%,#efe4d7_100%)]" />
      <div className="absolute inset-x-0 bottom-0 h-44 bg-gradient-to-t from-white/45 to-transparent" />
      <div className="absolute left-8 top-14 h-36 w-36 rounded-full bg-gold-300/28 blur-3xl" />
      <div className="absolute right-12 top-20 h-32 w-32 rounded-full bg-[#7ca6b4]/20 blur-3xl" />
      <div className="absolute bottom-8 right-16 h-24 w-56 rounded-full bg-terracotta-500/12 blur-2xl" />

      <div className="absolute left-6 top-10 h-[330px] w-[236px] rotate-[-6deg] rounded-[2rem] border border-[#d4c4a4]/70 bg-gradient-to-br from-[#faf6ee] via-[#f4ecdc] to-[#d7c49c] p-5 shadow-[0_32px_70px_rgba(22,32,44,0.18)] sm:left-12 sm:w-[260px] lg:h-[380px] lg:w-[288px]">
        <div className="flex h-full flex-col rounded-[1.6rem] bg-[#fffdfa]/96 px-6 py-6">
          <p className="text-[11px] font-semibold uppercase tracking-[0.36em] text-ink-900/40">
            Storybook
          </p>
          <div className="mt-8 space-y-2 font-display text-[2.15rem] leading-[0.94] text-ink-950 sm:text-[2.35rem] lg:text-[2.7rem]">
            <p>Chao Feng</p>
            <p>and Maui</p>
            <p>in: Making</p>
            <p>Friends</p>
          </div>
          <div className="mt-auto rounded-2xl bg-mist-100/92 px-4 py-3 text-xs font-medium uppercase tracking-[0.22em] text-ink-900/48">
            Thank-you Story Edition
          </div>
        </div>
      </div>

      <div className="absolute right-6 top-10 hidden h-[270px] w-[200px] overflow-hidden rounded-[2.2rem] border border-white/65 bg-[linear-gradient(160deg,rgba(30,59,65,0.9),rgba(47,71,102,0.82)),radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_38%)] shadow-[0_28px_56px_rgba(35,48,64,0.2)] sm:block sm:right-10 sm:w-[230px] lg:h-[328px] lg:w-[258px]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.15),transparent_22%),radial-gradient(circle_at_72%_68%,rgba(244,205,146,0.2),transparent_26%),linear-gradient(to_top,rgba(250,244,234,0.08),transparent_40%)]" />
        <div className="absolute inset-x-6 top-6 h-24 rounded-[1.7rem] border border-white/10 bg-white/5 backdrop-blur-[1px]" />
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#f8f3ea]/16 to-transparent" />
      </div>

      <div className="absolute bottom-10 left-[126px] right-6 rounded-[2rem] border border-white/70 bg-white/76 p-6 shadow-[0_20px_50px_rgba(35,48,64,0.16)] backdrop-blur-md sm:left-[180px] sm:right-10 lg:left-[242px] lg:right-10 lg:max-w-[420px]">
        <p className="text-xs font-semibold uppercase tracking-[0.28em] text-pine-800">In support of elder care</p>
        <p className="mt-4 text-lg font-semibold leading-8 text-ink-950 lg:text-[1.38rem]">
          Every donation helps extend companionship, dignity, and everyday care for older adults through Elder Care Foundation.
        </p>
      </div>
    </div>
  );
}
