# LingoBuddy
 
## Table of Contents
- [Project Members](#project-members)
- [Project Description](#project-description)
- [Technology Stack](#technology-stack)

## Project Members
Jeff Huang, Lorelei Tang, Hannah Kendall, Sebastian Mendez Johannessen

## Project Description
LingoBuddy is an AI-powered tool for learning new languages. It provides a platform for practicing language skills through interactive exercises, quizzes, and conversation simulations. The tool is designed to be user-friendly and accessible, suitable for learners of all levels.

## Technology Stack
#### Frontend
- React.js
- Next.js

#### Backend
- FastAPI
- Google Gemini API

#### Database
- Supabase

## Setup Instructions - how to run LingoBuddy locally
1. Clone this GitHub repository
```
git clone https://github.com/sebomaniac/lingobuddy.git
```

2. In Visual Studio Code, change directory to lingobuddy
```
cd lingobuddy
```

3. Install dependencies
```
npm install
```

4. Change directory to the backend directory
```
cd backend
```

5. Make virtual environment
```
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
```

6. Run backend
```
python -m uvicorn server:app --reload --host 0.0.0.0 --port 8000
```

7. Change directory to frontend
```
cd ../frontend
```

8. Run frontend
```
npm run dev
```

9. Open the link in your browser
```
Cmd-Click --> http://localhost:3000/
```
