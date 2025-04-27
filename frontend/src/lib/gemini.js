import { GoogleGenerativeAI, createUserContent, createPartfromUri } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

function extractJSON(text) {
  return text.replace(/```json|```/g, '').trim();
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

export async function getLessonSuggestions(language, level) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Suggest 6 real worlds topics (2-4 words each) for ${language} language lessons at ${level} level. Only return a JSON array of short topic names, no descriptions, with english definitions next to it preceded by a colon`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = extractJSON(JSON.stringify(text));
    return JSON.parse(text);
  } catch (error) {
    console.error('Error getting lesson suggestions:', error);
    throw error;
  }
} 