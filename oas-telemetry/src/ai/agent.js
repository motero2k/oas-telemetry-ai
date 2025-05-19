import OpenAI from 'openai';
import dotenv from 'dotenv';
import { tools, availableTools } from './tools.js';
dotenv.config();
 
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  dangerouslyAllowBrowser: true,
});

const messages = [
  {
    role: "assistant",
    content:
      "You are a helpful telemetry assistant. Only use the functions you have been provided with. If the question is not related to the functions, respond with 'I cannot help with that.'",
  },
];

async function agent(userInput) {
  messages.push({
    role: "user",
    content: userInput,
  });

  for (let i = 0; i < 5; i++) {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages,
      tools: tools,
    });

    const { finish_reason, message } = response.choices[0];

    if (finish_reason === "tool_calls" && message.tool_calls) {
      console.log("Tool calls detected:", message.tool_calls);

      const results = [];

      for (const toolCall of message.tool_calls) {
        const functionName = toolCall.function.name;
        const functionToCall = availableTools[functionName];
        const functionArgs = JSON.parse(toolCall.function.arguments);
        const functionArgsArr = Object.values(functionArgs);

        const functionResponse = await functionToCall.apply(null, functionArgsArr);
        results.push({
          name: functionName,
          response: functionResponse,
        });
      }

      const resultMessage = results.map(
        ({ name, response }) =>
          `Result from "${name}":\n${JSON.stringify(response, null, 2)}`
      ).join("\n\n");


      messages.push({
        role: "function",
        name: "multiple_tool_calls",
        content: resultMessage,
      });

    } else if (finish_reason === "stop") {
      messages.push(message);
      return message;
    }
  }

  return {content: "Se alcanzó el número máximo de iteraciones sin una respuesta adecuada. Intenta con una consulta más específica."};
}

export async function answerQuestion(question) {
  const response = await agent(question);
  console.log("Response from agent:", response);
  return response.content;
}