import { GoogleGenerativeAI } from "@google/generative-ai";

export const GET = async () => {
  try {
    const GEMINI_API_KEY = process.env.GEMINI_API_KEY; // GEMINI API KEY
    const promptBase =
      "Create a list of 10 open-ended and engaging questions formatted as a single string. Each question should be separated by '| | '. These questions are for an anonymous social messaging platform, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? | | If you could have dinner with any historical figure, who would it be? | | What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
    const randomSeed = Math.random();
    const timestamp = new Date().getTime();
    const prompt = `${promptBase} Use a random seed of ${randomSeed}and timestamp ${timestamp}`;

    if (!GEMINI_API_KEY) {
      return Response.json(
        {
          success: false,
          message: "Failed to generate the  AI messages",
        },
        {
          status: 500,
        }
      );
    }
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 2.0,
      },
    });

    const chat = model.startChat({});
    const result = await model.generateContent(prompt);

    if (!result) {
      return Response.json(
        {
          success: false,
          message:
            "Internal server error while generating the AI powered message suggestions",
        },
        {
          status: 500,
        }
      );
    }

    return Response.json(
      {
        success: true,
        data: result.response.text(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error(
      error,
      "Internal server error while generating the AI powered message suggestions"
    );
    return Response.json(
      {
        success: false,
        message:
          "Internal server error while generating the AI powered message suggestions",
      },
      {
        status: 500,
      }
    );
  }
};

// const prompt = "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '| | '. These questions are for an anonymous social messaging platform, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What's a hobby you've recently started? | | If you could have dinner with any historical figure, who would it be? | | What's a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";
