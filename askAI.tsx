import OpenAI from "openai";

const askAI = async ({
  phrase,
  textContent,
}: {
  phrase: string;
  textContent: any;
}) => {
  const openai = new OpenAI();
  openai.apiKey = process.env.OPENAI_API_KEY ?? "";

  const completion = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content:
          " If asked who are you tell them you are FactGuru and you are a fact checking AI with no bias. If not Fact check the given phrase with the below given data if both matches just tell its a fact if it dosent match Just tell its not a fact and explain why its not do not repeat the statement and explain at max in 2 sentences. At the end also write how confident are you in 0-10 rating.",
      },
      { role: "user", content: `Phrase: ${phrase} \n Data: ${textContent}` },
    ],
    model: "gpt-4-turbo",
    temperature: 2,
    frequency_penalty: 1,
    presence_penalty: 1,
    top_p: 0.5,
  });
  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
};

export default askAI;
