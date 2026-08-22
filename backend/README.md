# CareerAI - AI Resume Analyzer & Role Prediction Backend

FastAPI Python microservice for resume NLP parsing, job role classification, multi-factor fit scoring, and mock interview coaching.

## Prerequisites
- Python 3.10+
- `pip`

## Quick Start

1. Install dependencies:
```bash
cd backend
pip install -r requirements.txt
```

2. Run the FastAPI development server:
```bash
uvicorn main:app --reload --port 8000
```

3. Interactive Swagger API Docs:
Open `http://localhost:8000/docs` in your browser.

## API Endpoints Overview

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/api/v1/parse-resume` | Extracts skills against the 115-skill taxonomy, detects education & experience. |
| `POST` | `/api/v1/predict-roles` | Returns top matched job roles from the 262-role catalog. |
| `POST` | `/api/v1/fit-score` | Multi-factor weighted score breakdown with positive/negative factors & gap alerts. |
| `POST` | `/api/v1/evaluate-interview` | Multi-dimensional response scoring and AI coaching critique. |
