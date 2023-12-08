import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export async function GET(req: NextRequest) {
  const search = req.nextUrl.searchParams;
  const extraPrompt = search.get("prompt") || "";
  const prevIdeas = search.get("history");
  const promptMessage = `Your job is to give school children in the uk aged 5 years old a prompt
to get them to design or draw something. Format the prompt like this:

'Design {something} for {someone} with {conditions}'

return only one sentance which must contain the words 'design' and 'for' and 'with'
`;

  const historyMessage = prevIdeas
    ? `These are previous suggestions, make sure you don't repeat any ideas from these: ${prevIdeas} `
    : "";

  const message: OpenAI.Chat.ChatCompletionMessage = {
    content:
      historyMessage +
      (extraPrompt
        ? ` and use this extra info to build the sentance - ${extraPrompt}`
        : ""),
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
