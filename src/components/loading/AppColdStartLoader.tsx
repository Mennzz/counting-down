import Lottie from "lottie-react";

import catPookieAnimation from "@/assets/catPookieAnimation";

export const AppColdStartLoader = () => {
  return (
    <div className="romantic-gradient flex min-h-screen items-center justify-center px-6 py-10">
      <div className="w-full max-w-xl rounded-[2rem] border border-white/60 bg-white/80 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-6 flex h-48 w-48 items-center justify-center rounded-full bg-rose-50/80 shadow-inner">
          <Lottie
            animationData={catPookieAnimation}
            autoplay
            loop
            className="h-40 w-40"
            aria-label="Animated cat loading indicator"
          />
        </div>
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.35em] text-rose-400">
          Waking The Backend
        </p>
        <h1 className="text-4xl font-playfair font-semibold text-rose-600">
          Cat on standby
        </h1>
        <p className="mx-auto mt-4 max-w-md text-base font-inter leading-relaxed text-gray-600">
          The app is waiting for the server to warm up. Once it answers, everything else will slide in normally.
        </p>
        <div className="mt-8 flex items-center justify-center gap-3 text-sm font-inter text-rose-500">
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-400" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-500 [animation-delay:200ms]" />
          <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-rose-600 [animation-delay:400ms]" />
        </div>
      </div>
    </div>
  );
};
