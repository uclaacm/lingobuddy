import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

function extractJSON(text) {
  // Remove markdown code block wrappers and trim
  return text.replace(/```json|```/g, '').trim();
}

export async function generateChineseLesson(level, topic) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Generate a Chinese language lesson for ${level} level students about ${topic}. 
  Include:
  1. Key vocabulary (with pinyin and English translation)
  2. Example sentences (with pinyin and English translation)
  3. Cultural notes or tips
  4. Practice exercises
  \nFormat the response in JSON with the following structure:\n{\n  "title": "string",\n  "vocabulary": [{"chinese": "string", "pinyin": "string", "english": "string"}],\n  "sentences": [{"chinese": "string", "pinyin": "string", "english": "string"}],\n  "culturalNotes": ["string"],\n  "exercises": ["string"]\n}`;

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

export async function getLessonSuggestions(level) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `Suggest 5 interesting topics for Chinese language lessons at ${level} level. \nReturn the response as a JSON array of strings.`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    text = extractJSON(text);
    return JSON.parse(text);
  } catch (error) {
    console.error('Error getting lesson suggestions:', error);
    throw error;
  }
} 