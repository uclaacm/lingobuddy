from fastapi import FastAPI, Request, UploadFile, File, HTTPException, BackgroundTasks
from fastapi.responses import StreamingResponse, FileResponse
from fastapi.middleware.cors import CORSMiddleware
import io
import os
import time
import tempfile
import shutil # For copying file object
from dotenv import load_dotenv
from openai import OpenAI

from gemini_speech import speak_text
from pydub import AudioSegment
from pydub.utils import which

AudioSegment.converter = which("ffmpeg")

app = FastAPI()

# Load environment variables
load_dotenv()

# Create the OpenAI client
# Ensure OPENAI_API_KEY is set in your .env file
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
if not client.api_key:
    print("Warning: OPENAI_API_KEY not found in environment variables.")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

def pcm_to_wav(pcm_data, sample_rate=24000):
    audio_segment = AudioSegment(
        data=pcm_data,
        sample_width=2,
        frame_rate=sample_rate,
        channels=1
    )

    wav_buffer = io.BytesIO()
    audio_segment.export(wav_buffer, format="wav")
    wav_buffer.seek(0)
    return wav_buffer

# Function to remove files in the background
def remove_file(path: str):
    try:
        os.remove(path)
        print(f"[Cleanup] Removed temp file: {path}")
    except Exception as e:
        print(f"[Cleanup Error] Failed to remove {path}: {e}")

@app.post("/speak")
async def speak(request: Request):
    data = await request.json()
    text = data.get("text")

    if not text:
        return {"error": "No text provided"}

    pcm_data = await speak_text(text)
    wav_data = pcm_to_wav(pcm_data)

    print(f"[DEBUG] Final WAV buffer size: {wav_data.getbuffer().nbytes} bytes")

    return StreamingResponse(wav_data, media_type="audio/wav")

@app.post("/chat")
async def chat(background_tasks: BackgroundTasks, file: UploadFile = File(...)):
    if not client.api_key:
        raise HTTPException(status_code=500, detail="OpenAI API key not configured.")

    start_time = time.time()

    # 1. Save uploaded audio to a temporary file
    input_temp_file = None
    try:
        suffix = os.path.splitext(file.filename)[1] if file.filename else '.tmp'
        input_temp_file = tempfile.NamedTemporaryFile(delete=False, suffix=suffix)
        input_temp_file_path = input_temp_file.name

        await file.seek(0)
        with open(input_temp_file_path, 'wb') as f_dest:
            shutil.copyfileobj(file.file, f_dest)
        print(f"[DEBUG] Saved uploaded file to temp path: {input_temp_file_path}")

        background_tasks.add_task(remove_file, input_temp_file_path)

    except Exception as e:
        if input_temp_file and os.path.exists(input_temp_file.name):
            remove_file(input_temp_file.name)
        print(f"Error saving uploaded file: {e}")
        raise HTTPException(status_code=500, detail=f"Error saving uploaded file: {e}")
    finally:
        if input_temp_file:
            input_temp_file.close()
        if hasattr(file, 'file'):
             file.file.close()

    try:
        # 2. Audio input -> STT (Whisper)
        whisper_start = time.time()
        with open(input_temp_file_path, "rb") as audio_file:
            transcript = client.audio.transcriptions.create(
                model="whisper-1",
                file=audio_file,
            )
        user_text = transcript.text
        whisper_time = time.time() - whisper_start
        print(f"Transcription: {user_text}")
        print(f"Whisper transcription took: {whisper_time:.2f} seconds")

        # 3. Chat completion
        chat_prompt = f"Translate this input into English. Just output the translation: {user_text}"
        
        gpt_start = time.time()
        chat_response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You provide concise translations."}, 
                {"role": "user", "content": chat_prompt}
            ],
            max_tokens=100
        )
        gpt_text_response = chat_response.choices[0].message.content
        gpt_time = time.time() - gpt_start
        print(f"GPT answer: {gpt_text_response}")
        print(f"GPT response took: {gpt_time:.2f} seconds")

        # 4. Chat completion -> TTS
        tts_start = time.time()
        speech_temp_fd, speech_file_path = tempfile.mkstemp(suffix=".mp3")
        os.close(speech_temp_fd)
        print(f"[DEBUG] Created temp TTS file path: {speech_file_path}")
        
        background_tasks.add_task(remove_file, speech_file_path)

        tts_response = client.audio.speech.create(
            model="tts-1", 
            voice="shimmer", 
            input=gpt_text_response,
        )
        
        await tts_response.astream_to_file(speech_file_path)
        tts_time = time.time() - tts_start
        print(f"TTS took: {tts_time:.2f} seconds")
        print(f"Total processing time: {time.time() - start_time:.2f} seconds")

        # 5. Return the audio file
        return FileResponse(
            path=speech_file_path,
            media_type="audio/mpeg",
            filename="response.mp3" 
        )

    except Exception as e:
        print(f"Error during processing: {e}")
        raise HTTPException(status_code=500, detail=f"Error processing audio: {e}")
