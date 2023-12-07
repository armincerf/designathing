"use client";

import { useCallback, useEffect, useState } from "react";

function shuffle<T>(array: T[]): T[] {
  let arr = [...array]; // Clone the original array
  let m = arr.length,
    t,
    i;

  // While there remain elements to shuffle…
  while (m) {
    // Pick a remaining element…
    i = Math.floor(Math.random() * m--);

    // And swap it with the current element.
    t = arr[m];
    arr[m] = arr[i];
    arr[i] = t;
  }

  return arr;
}

// Example usage:
let shuffledArray = shuffle([1, 2, 3, 4, 5]);
console.log(shuffledArray); // Output: [3, 5, 2, 1, 4] (random output)

// In units
export default function Page() {
  const defaul = [
    {
      d: "A pencil case",
      f: "a wizard",
      w: "lots of pocket money",
    },
    {
      d: "A coat",
      f: "a father",
      w: "a new baby",
    },
    {
      d: "A chair",
      f: "a grandmother",
      w: "a love of knitting",
    },
    {
      d: "A cat",
      f: "a princess",
      w: "a crown",
    },
    {
      d: "A tree",
      f: "a scientist",
      w: "a groundbreaking discovery",
    },
    {
      d: "A bicycle",
      f: "an astronaut",
      w: "a trip to the moon",
    },
  ];

  type thing = (typeof defaul)[number];
  const initial = shuffle(defaul);

  const [things, setThings] = useState(initial);
  const [count, setCount] = useState(0);
  const [isFetching, setIsFetching] = useState(false);

  const { d, f, w } = things[count];

  const needMoreThings = things.length - 1 === count;

  const handleRequest = useCallback(async () => {
    if (things.length - 1 !== count) {
      setCount(count + 1);
    }
    if (isFetching && needMoreThings) {
      setThings((prev) => shuffle(prev));
      setCount(0);
      return;
    }
    const host = process.env.NEXT_PUBLIC_PARTYKIT_HOST;
    if (!host) return;
    setIsFetching(true);
    const res = await fetch(`/api/ai`, {
      method: "GET",
    });
    const json = await res.json();
    try {
      const aiResponse = json.choices[0].message.content as string;
      const jsonString = aiResponse.substring(
        aiResponse.indexOf("["),
        aiResponse.lastIndexOf("]") + 1,
      );
      const newThings = JSON.parse(jsonString) as thing[];
      console.log(newThings);
      setThings([...things, ...newThings]);
    } catch (e) {
      console.log(e);
    }
    setIsFetching(false);
  }, [count, isFetching, needMoreThings, things]);

  return (
    <main className="relative h-[100dvh] flex flex-col bg-sky-100">
      <div className="bg-sky-200 h-full m-4 p-4 rounded flex flex-col align-middle">
        <div className="flex gap-1 flex-col text-3xl font-light mb-4">
          <span>
            design <span className="font-semibold text-pink-600">{d}</span>
          </span>
          <span>
            for <span className="font-semibold text-orange-500">{f}</span>
          </span>
          <span>
            with <span className="font-semibold text-blue-400">{w}</span>
          </span>
        </div>
        <button
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-8 text-center me-2"
          onClick={handleRequest}
        >
          Design another thing
        </button>
      </div>
    </main>
  );
}
