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
  const [thingHistory, setThingHistory] = useState<string[]>([]);
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
    const res = await fetch(
      `/api/ai?${prompt}&history=${JSON.stringify(thingHistory)}`,
      {
        method: "GET",
      },
    );
    const json = await res.json();
    try {
      const aiResponse = json.choices[0].message.content as string;
      setThingPrompt(aiResponse);
      setThingHistory([...thingHistory, aiResponse]);
    } catch (e) {
      console.log(e);
    }
    setIsFetching(false);
  }, [aiMode, isFetching, prompt, thingHistory]);
  const [showSettings, setShowSettings] = useState(false);
  const [showAbout, setShowAbout] = useState(false);

  return (
    <main
      onClick={() => {
        setShowAbout(false);
        setShowSettings(false);
      }}
      className="relative h-[100dvh] flex flex-col bg-sky-100"
    >
      <div className="bg-sky-200 h-full m-4 p-4 rounded flex flex-col align-middle relative">
        {showAbout && (
          <div className="absolute top-0 left-0 w-full h-full bg-sky-100 bg-opacity-50 flex justify-center items-center">
            <div className="bg-white rounded-lg p-4 flex flex-col w-3/4">
              <div className="p-4">
                <h1 className="text-3xl font-bold mb-4">Privacy Policy</h1>
                <p className="mb-4">Last updated: December 11, 2023</p>
                <h2 className="text-2xl font-semibold mb-2">1. Introduction</h2>
                <p className="mb-4">
                  Welcome to {'"Design a Thing"'}, a word game specifically
                  developed for St. Helen{"'"}s Primary School. We value the
                  privacy of our users and are devoted to safeguarding their
                  personal information. Our service does not gather or use any
                  personal data from its users.
                </p>
                <h2 className="text-2xl font-semibold mb-2">
                  2. Information We Don’t Collect
                </h2>
                <p className="mb-2">
                  Our website does not collect any personal or usage data. We do
                  not require nor store any identifiable information such as:
                </p>
                <ul className="list-disc ml-5 mb-4">
                  <li className="mb-1">
                    Personal identifiable information (e.g., names, addresses,
                    email addresses, phone numbers)
                  </li>
                  <li className="mb-1">
                    Device and browser information (e.g., IP addresses, device
                    types, cookies)
                  </li>
                  <li>Usage data (e.g., game history, scores)</li>
                </ul>
                <p className="mb-4">
                  Our website{"'"}s sole purpose is to deliver a secure and
                  enjoyable learning environment for St. Helen{"'"}s Primary
                  School children.
                </p>
                <h2 className="text-2xl font-semibold mb-2">
                  3. No Third-Party Websites or Content
                </h2>
                <p className="mb-4">
                  There are no links to third-party websites or content present
                  on our website. As such, this privacy policy governs all
                  aspects of our site exclusively.
                </p>
                <h2 className="text-2xl font-semibold mb-2">
                  4. No Changes To The Website{"'"}s Content
                </h2>
                <p className="mb-4">
                  The content of the {'"Design a Thing"'} game, once launched,
                  will remain the same. Therefore, no changes to this privacy
                  policy are foreseen.
                </p>{" "}
                <p className="mt-8 text-center">
                  Created by Tara Davis for use at St Helen{"'"}s Primary School
                </p>
              </div>{" "}
            </div>
          </div>
        )}
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
                onChange={(e) => {
                  e.stopPropagation();
                  setSearch(e.target.value);
                }}
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
          onClick={(e) => {
            e.stopPropagation();
            return setShowAbout(!showAbout);
          }}
          className="absolute bottom-4 left-4
        text-white bg-gradient-to-r from-green-500 to-lime-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-full text-sm px-4 py-2 text-center"
        >
          ?
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            return setShowSettings(!showSettings);
          }}
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
