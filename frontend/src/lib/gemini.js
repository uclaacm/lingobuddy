import { GoogleGenerativeAI, createUserContent, createPartfromUri } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// function extractJSON(text) {
//   return text.replace(/```json|```/g, '').trim();
// }

// export function extractJSON(text) {
//   const match = text.match(/{[\s\S]*}/);  // Look for curly braces to find the object
//   if (match) {
//     return match[0];
//   }
//   throw new Error("No JSON object found in the response text");
// }

export function extractJSON(text) {
  const match = text.match(/\[[\s\S]*?\]/);  // Match the first JSON array in the text
  if (match) {
    return match[0];
  }
  throw new Error("No JSON array found in the response text");
}



export async function chat(message) {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = message;
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        let text = response.text();
        text = text.replace(/```(?:json)?|```/g, '').trim();
        return text;
    } catch (error) {
        console.error('Error chatting with Gemini:', error);
        throw error;
    }
}

export async function generateLesson(language, level, topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a ${language} language lesson for ${level} level students about ${topic}. 
  Include:
  1. Key vocabulary (with pronunciation and English translation)
  2. Example sentences (with pronunciation and English translation)
  3. Cultural notes or tips
  4. Practice exercises
  \nFormat the response in JSON with the following structure:\n{\n  "title": "string",\n  "vocabulary": 
  [{"${language}": "string", "pronounciation": "string", "english": "string"}],\n  "sentences": 
  [{"${language}": "string", "pronounciation": "string", "english": "string"}],\n  "culturalNotes": ["string"],\n  "exercises": ["string"]\n}`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = extractJSON(text);
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating lesson:', error);
    throw error;
  }
}

// export async function getLessonSuggestions(language, level) {
//   const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

//   // const prompt = `Suggest 6 real worlds topics (2-4 words each) for ${language} language lessons at ${level} level. Only return a JSON array of short topic names, no descriptions, with english definitions next to it preceded by a colon`;
//   const prompt = `Suggest 6 real-world topics (2-4 words each) for ${language} language lessons at ${level} level. ONLY return a JSON array like this: ["Travel", "Food and Dining", "Cultural Traditions", "Weather and Seasons", "Daily Routines", "Work and Careers"] DO NOT add any explanations or formatting — ONLY the raw JSON array.`;


//   try {
//     const result = await model.generateContent(prompt);
//     const response = await result.response;
//     // let text = response.text();
//     // text = extractJSON(JSON.stringify(text));
//     // return JSON.parse(text);


//     const rawText = response.text();
//     const jsonText = extractJSON(rawText);
//     const parsed = JSON.parse(jsonText);  // This should now be an object!
//     return parsed;

//   } catch (error) {
//     console.error('Error getting lesson suggestions:', error);
//     throw error;
//   }
// } 
export async function getLessonSuggestions(language, level) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `
Suggest 6 real-world topics (2-4 words each) for ${language} language lessons at ${level} level.
ONLY return a JSON array like this:
["Travel", "Food and Dining", "Cultural Traditions", "Weather and Seasons", "Daily Routines", "Work and Careers"]
DO NOT add any explanations or formatting — ONLY the raw JSON array.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = await response.text();
    const jsonText = extractJSON(text);              // Now should work!
    return JSON.parse(jsonText);                     // Should give you an array
  } catch (error) {
    console.error('Error getting lesson suggestions:', error);
    throw error;
  }
}
