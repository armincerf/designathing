"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState } from "react";

type thing = {
  d: string;
  f: string;
  w: string;
};

function stringToThing(string: string): thing {
  const str = string.toLowerCase().trim().replaceAll("'", "");
  const designStart = str.includes("design") ? str.indexOf("design") + 7 : 0;
  const forStart = str.indexOf("for");
  const withStart = str.includes("with")
    ? str.indexOf("with")
    : str.indexOf("using");
  const hasWith = str.includes("with") || str.includes("using");

  const d = str.slice(designStart, forStart).trim();
  const w =
    str.includes("with") || str.includes("using")
      ? str.slice(withStart + 5).trim()
      : "";
  const f = str.slice(forStart + 4, hasWith ? withStart : str.length).trim();

  return { d, f, w };
}

export default function Page() {
  const defaul =
    "Design a Christmas decoration for a family with a naughty elf";

  const [thingPrompt, setThingPrompt] = useState(defaul);
  const [isFetching, setIsFetching] = useState(false);

  const prompt = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();
  const aiMode = prompt.get("ai") === "true";
  const setPrompt = useCallback(
    (value: string) => {
      const encoded = encodeURIComponent(value);
      router.push(`${pathname}?prompt=${encoded}&ai=${aiMode}`);
    },
    [aiMode, pathname, router],
  );
  const [search, setSearch] = useState("");
  const setAiMode = useCallback(
    (value: boolean) => {
      router.push(`${pathname}?prompt=${search}&ai=${value}`);
    },
    [pathname, router, search],
  );
  const thing = stringToThing(thingPrompt);

  const { d, f, w } = thing;

  const handleRequest = useCallback(async () => {
    if ((prompt.get("ai") === "false" || !aiMode) && prompt.get("prompt")) {
      const search = decodeURIComponent(prompt.get("prompt") ?? "");
      const things = search.split("\n").filter((s) => s.length > 0);
      const thing = things[Math.floor(Math.random() * things.length)];
      console.log(thing);
      return setThingPrompt(thing);
    }
    if (isFetching) return;
    setIsFetching(true);
    const res = await fetch(`/api/ai?${prompt}`, {
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
  }, [aiMode, isFetching, prompt]);
  const [showSettings, setShowSettings] = useState(false);

  return (
    <main className="relative h-[100dvh] flex flex-col bg-sky-100">
      <div className="bg-sky-200 h-full m-4 p-4 rounded flex flex-col align-middle relative">
        {showSettings && (
          <div className="absolute top-0 left-0 w-full h-full bg-sky-100 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4 flex flex-col w-3/4">
              <div className="flex gap-2  m-2">
                <button
                  onClick={() => setAiMode(true)}
                  className={`${aiMode
                      ? "bg-gradient-to-r from-green-500 to-lime-500"
                      : "bg-gray-200"
                    } text-white hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2 text-center me-2`}
                >
                  Ai
                </button>
                <button
                  onClick={() => setAiMode(false)}
                  className={`${!aiMode
                      ? "bg-gradient-to-r from-green-500 to-lime-500"
                      : "bg-gray-200"
                    } text-white hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2 text-center me-2`}
                >
                  Manual
                </button>
              </div>

              <textarea
                className="bg-white rounded-lg p-4 mb-2"
                placeholder="Enter a prompt, theme, or write some examples to use"
                rows={12}
                onChange={(e) => setSearch(e.target.value)}
                value={search ?? ""}
              />
              <button
                onClick={() => {
                  setPrompt(search);
                  return setShowSettings(false);
                }}
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
          {f && (
            <span>
              for <span className="font-semibold text-orange-500">{f}</span>
            </span>
          )}
          {w && (
            <span>
              with <span className="font-semibold text-blue-400">{w}</span>
            </span>
          )}
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
