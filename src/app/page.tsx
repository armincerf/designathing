"use client";

import { useCallback, useState } from "react";

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

type thing = {
  d: string;
  f: string;
  w: string;
};

function stringToThing(string: string): thing {
  const str = string.toLowerCase().trim().replaceAll("'", "");
  const designStart = str.indexOf("design") + 7;
  const forStart = str.indexOf("for");
  const withStart = str.includes("with")
    ? str.indexOf("with")
    : str.indexOf("using");

  const d = str.slice(designStart, forStart).trim();
  const f = str.slice(forStart + 4, withStart).trim();
  const w = str.slice(withStart + 5).trim();

  return { d, f, w };
}

export default function Page() {
  const defaul = "design a thing for a guy with a gun";

  const [thingPrompt, setThingPrompt] = useState(defaul);
  const [isFetching, setIsFetching] = useState(false);

  const [prompt, setPrompt] = useState("");

  const thing = stringToThing(thingPrompt);

  const { d, f, w } = thing;

  const handleRequest = useCallback(async () => {
    if (isFetching) return;
    setIsFetching(true);
    const res = await fetch(`/api/ai?prompt=${prompt}`, {
      method: "GET",
    });
    const json = await res.json();
    try {
      const aiResponse = json.choices[0].message.content as string;
      setThingPrompt(aiResponse);
    } catch (e) {
      console.log(e);
    }
    setIsFetching(false);
  }, [isFetching, prompt]);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="relative h-[100dvh] flex flex-col bg-sky-100">
      <div className="bg-sky-200 h-full m-4 p-4 rounded flex flex-col align-middle relative">
        {showSettings && (
          <div className="absolute top-0 left-0 w-full h-full bg-sky-100 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4">
              <input
                className="bg-white rounded-lg p-4"
                placeholder="Enter a prompt"
                onChange={(e) =>
                  setPrompt((e.target as HTMLInputElement).value)
                }
                value={prompt}
              />
              <button
                onClick={() => setShowSettings(false)}
                className="
              text-white bg-gradient-to-r from-green-500 to-lime-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2 text-center me-2"
              >
                Save
              </button>
            </div>
          </div>
        )}
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="absolute bottom-4 right-4
        text-white bg-gradient-to-r from-green-500 to-lime-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2 text-center me-2"
        >
          Edit Prompt
        </button>

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
          disabled={isFetching}
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-8 text-center me-2 disabled:opacity-20 disabled:cursor-wait"
          onClick={handleRequest}
        >
          Design another thing
        </button>
      </div>
    </main>
  );
}
