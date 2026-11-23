"use client";

import { useState } from "react";

export default function Home() {
  const [key, setKey] = useState(0);
  const name = "DHEERAJ";

  return (
    <main className="flex h-[100dvh] w-screen items-center justify-center overflow-hidden bg-[#fffaf0] p-4 sm:p-8 text-[#563e3b] select-none">
      <h1
        key={key}
        onClick={() => setKey((prev) => prev + 1)}
        title="Click to replay animation"
        className="cursor-pointer font-[family-name:var(--font-serif)] text-[clamp(3.8rem,16vw,16rem)] font-normal italic leading-none tracking-[-0.03em] text-[#563e3b] text-center"
      >
        {name.split("").map((letter, index) => (
          <span
            key={index}
            className="animate-letter"
            style={{
              animationDelay: `${index * 85 + 150}ms`,
            }}
          >
            {letter}
          </span>
        ))}
      </h1>
    </main>
  );
}
