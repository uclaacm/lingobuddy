from fastapi import FastAPI, Request
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
import io
from gemini_speech import speak_text
from pydub import AudioSegment
from pydub.utils import which

AudioSegment.converter = which("ffmpeg")

app = FastAPI()

# ✅ Allow CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust this for production!
    allow_methods=["*"],
    allow_headers=["*"],
)

# ✅ PCM-to-WAV conversion
def pcm_to_wav(pcm_data, sample_rate=24000):
    audio_segment = AudioSegment(
        data=pcm_data,
        sample_width=2,            # 16-bit = 2 bytes
        frame_rate=sample_rate,
        channels=1
    )

    wav_buffer = io.BytesIO()
    audio_segment.export(wav_buffer, format="wav")
    wav_buffer.seek(0)
    return wav_buffer

# ✅ Main route: takes text, returns spoken WAV audio
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
