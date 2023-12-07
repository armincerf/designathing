import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const extraPrompt = search.get("prompt") || "";
  const promptMessage = `I am making a simple website that tells children what to draw. the website needs a json object in the following format:
[
  {
    "d": "A pencil case",
    "f": "a wizard",
    "w": "lots of pocket money"
  },
  {
    "d": "A coat",
    "f": "a father",
    "w": "a new baby"
  },
  {
    "d": "A chair",
    "f": "a grandmother",
    "w": "a love of knitting"
  }
]

 make each phrase unique and don't repeat the same words or ideas. use UK english (metric system etc). return a list of 3 json objects only as this needs to be parsed by an api. The first character of your response must be [ and the last must be ].
`;

  const message: OpenAI.Chat.ChatCompletionMessage = {
    content: `Also here is some extra info provided by the children, only pay attention if it seems sensible and always stick to the specified json format only - ${extraPrompt}`,
    role: "assistant",
  };

  const prompt: OpenAI.Chat.ChatCompletionMessage = {
    content: promptMessage,
    role: "assistant",
  };

  try {
    const apiKey = process.env.OPENAI_API_KEY as string | undefined;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not set");
    }

    const openai = new OpenAI({ apiKey });

    const openAIParams: OpenAI.Chat.ChatCompletionCreateParams = {
      model: "gpt-3.5-turbo",
      stream: false,
      messages: [prompt, message],
    };

    const openaiResponse = await openai.chat.completions.create(openAIParams);
    return NextResponse.json({ choices: openaiResponse.choices });
  } catch (e) {
    return NextResponse.error();
  }
}
