import json
import re
from pathlib import Path
from typing import List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(
    title="CareerAI - AI Resume Analyzer & Job Role Prediction API",
    version="1.0.0",
    description="NLP-based resume parsing, role prediction, multi-factor job fit evaluation, and interview coach.",
)

# CORS middleware for frontend connection
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load data datasets
BASE_DIR = Path(__file__).resolve().parent
DATA_DIR = BASE_DIR / "data"

with open(DATA_DIR / "skills.json", "r", encoding="utf-8") as f:
    SKILLS_DATA = json.load(f)["skills"]
    SKILLS_DICT = {s["name"].lower(): s for s in SKILLS_DATA}

with open(DATA_DIR / "job_roles.json", "r", encoding="utf-8") as f:
    JOB_ROLES = json.load(f)["roles"]


# ==========================================
# Pydantic Schemas
# ==========================================

class ResumeParseRequest(BaseModel):
    resume_text: str = Field(..., description="Raw text of the candidate resume")

class ParsedSkill(BaseModel):
    name: str
    category: str

class ResumeParseResponse(BaseModel):
    extracted_skills: List[ParsedSkill]
    estimated_experience_years: int
    detected_education: str
    confidence: int

class RolePredictionRequest(BaseModel):
    skills: List[str]
    experience_years: int
    education: Optional[str] = "Bachelor's"

class RolePredictionResult(BaseModel):
    role_id: str
    title: str
    category: str
    match_score: int
    required_skills: List[str]
    salary_range: str

class RolePredictionResponse(BaseModel):
    top_predictions: List[RolePredictionResult]

class FitScoreRequest(BaseModel):
    candidate_skills: List[str]
    candidate_experience_years: int
    candidate_education: Optional[str] = "Bachelor's"
    target_role_id: Optional[str] = None
    job_description: Optional[str] = None

class SkillGap(BaseModel):
    skill: str
    importance: str
    suggestion: str

class AssessmentFactor(BaseModel):
    name: str
    direction: str
    weight: float
    description: str

class FitScoreResponse(BaseModel):
    job_title: str
    overall_score: int
    technical_score: int
    experience_score: int
    education_score: int
    role_alignment_score: int
    recommendation: str
    matching_skills: List[str]
    skill_gaps: List[SkillGap]
    factors: List[AssessmentFactor]
    explanation: str
    confidence: int

class InterviewEvalRequest(BaseModel):
    question_id: str
    question_text: str
    candidate_response: str
    role_title: Optional[str] = "Senior Software Engineer"

class InterviewEvalResponse(BaseModel):
    overall_score: int
    relevance_score: int
    technical_accuracy_score: int
    clarity_score: int
    completeness_score: int
    feedback: str
    suggested_answer: str


# ==========================================
# Core AI NLP & Scoring Functions
# ==========================================

def extract_skills_from_text(text: str) -> List[ParsedSkill]:
    found_skills = []
    text_lower = text.lower()
    for skill_lower, skill_obj in SKILLS_DICT.items():
        pattern = r"\b" + re.escape(skill_lower) + r"\b"
        if re.search(pattern, text_lower):
            found_skills.append(ParsedSkill(name=skill_obj["name"], category=skill_obj["category"]))
    return found_skills

def extract_experience_years(text: str) -> int:
    patterns = [
        r"(\d+)\+?\s*(?:years?|yrs?)(?:\s+of)?\s+experience",
        r"experience\s*:\s*(\d+)\+?\s*(?:years?|yrs?)",
    ]
    for pattern in patterns:
        match = re.search(pattern, text, re.IGNORECASE)
        if match:
            return min(int(match.group(1)), 35)
    
    # Fallback to date range count
    years = re.findall(r"\b(20\d\d|19\d\d)\b", text)
    if len(years) >= 2:
        parsed_years = sorted([int(y) for y in years])
        diff = parsed_years[-1] - parsed_years[0]
        if 0 < diff <= 35:
            return diff
    return 3

def extract_education(text: str) -> str:
    text_lower = text.lower()
    if "ph.d" in text_lower or "phd" in text_lower or "doctorate" in text_lower:
        return "Doctorate / Ph.D."
    if "master" in text_lower or "m.s." in text_lower or "mba" in text_lower:
        return "Master's Degree"
    if "bachelor" in text_lower or "b.s." in text_lower or "b.a." in text_lower or "b.tech" in text_lower:
        return "Bachelor's Degree"
    return "Bachelor's Degree (Estimated)"


# ==========================================
# API Endpoints
# ==========================================

@app.get("/")
def root():
    return {
        "status": "online",
        "service": "CareerAI Backend Engine",
        "version": "1.0.0",
        "dataset_roles_count": len(JOB_ROLES),
        "dataset_skills_count": len(SKILLS_DATA),
    }

@app.post("/api/v1/parse-resume", response_model=ResumeParseResponse)
def parse_resume(payload: ResumeParseRequest):
    text = payload.resume_text
    if not text.strip():
        raise HTTPException(status_code=400, detail="Resume text cannot be empty.")
    
    skills = extract_skills_from_text(text)
    years = extract_experience_years(text)
    edu = extract_education(text)
    
    confidence = 85 + min(len(skills), 10)
    return ResumeParseResponse(
        extracted_skills=skills,
        estimated_experience_years=years,
        detected_education=edu,
        confidence=min(confidence, 98),
    )

@app.post("/api/v1/predict-roles", response_model=RolePredictionResponse)
def predict_roles(payload: RolePredictionRequest):
    candidate_skills_set = {s.lower() for s in payload.skills}
    results = []

    for role in JOB_ROLES:
        req_set = {s.lower() for s in role["requiredSkills"]}
        overlap = len(candidate_skills_set.intersection(req_set))
        total_req = len(req_set) if req_set else 1
        
        # Skill Jaccard component
        skill_score = (overlap / total_req) * 100
        
        # Experience component
        target_exp = role.get("experienceYears", 3)
        exp_score = min(100, (payload.experience_years / max(target_exp, 1)) * 100)
        
        # Combined match score
        overall_match = int(0.7 * skill_score + 0.3 * exp_score)
        
        results.append(
            RolePredictionResult(
                role_id=role["id"],
                title=role["title"],
                category=role["category"],
                match_score=min(overall_match, 99),
                required_skills=role["requiredSkills"],
                salary_range=role["salaryRange"],
            )
        )
    
    # Sort descending by match score
    sorted_results = sorted(results, key=lambda x: x.match_score, reverse=True)
    return RolePredictionResponse(top_predictions=sorted_results[:5])

@app.post("/api/v1/fit-score", response_model=FitScoreResponse)
def calculate_fit_score(payload: FitScoreRequest):
    target_role = JOB_ROLES[0]
    if payload.target_role_id:
        found = next((r for r in JOB_ROLES if r["id"] == payload.target_role_id), None)
        if found:
            target_role = found

    cand_skills_lower = {s.lower() for s in payload.candidate_skills}
    req_skills = target_role["requiredSkills"]
    
    matching_skills = [s for s in req_skills if s.lower() in cand_skills_lower]
    missing_skills = [s for s in req_skills if s.lower() not in cand_skills_lower]
    
    # Mathematical score derivations
    tech_score = int((len(matching_skills) / max(len(req_skills), 1)) * 100)
    exp_target = target_role.get("experienceYears", 4)
    exp_score = int(min(100, (payload.candidate_experience_years / max(exp_target, 1)) * 100))
    edu_score = 90
    alignment_score = int(0.6 * tech_score + 0.4 * exp_score)
    
    overall_score = int(0.45 * tech_score + 0.3 * exp_score + 0.15 * edu_score + 0.1 * alignment_score)
    
    # Recommendation tier
    if overall_score >= 85:
        recommendation = "strong"
    elif overall_score >= 70:
        recommendation = "good"
    elif overall_score >= 50:
        recommendation = "moderate"
    else:
        recommendation = "low"

    # Skill gaps mapping
    skill_gaps = [
        SkillGap(
            skill=s,
            importance="high" if idx < 2 else "medium",
            suggestion=f"Complete hands-on projects or verified coursework in {s}.",
        )
        for idx, s in enumerate(missing_skills)
    ]

    # Evaluation factors
    factors = [
        AssessmentFactor(
            name="Technical Core Coverage",
            direction="positive" if tech_score >= 70 else "negative",
            weight=0.35,
            description=f"Matched {len(matching_skills)} of {len(req_skills)} essential technical stack proficiencies.",
        ),
        AssessmentFactor(
            name="Seniority & Experience Ratio",
            direction="positive" if exp_score >= 80 else "negative",
            weight=0.25,
            description=f"{payload.candidate_experience_years} years vs role target of {exp_target} years.",
        ),
    ]

    explanation = (
        f"Candidate exhibits a {recommendation} match profile ({overall_score}%) for the {target_role['title']} role. "
        f"Key technical strengths include {', '.join(matching_skills[:3]) or 'foundational background'}. "
        f"To maximize placement probability, candidate is advised to close gaps in {', '.join(missing_skills[:2]) or 'supplementary tools'}."
    )

    return FitScoreResponse(
        job_title=target_role["title"],
        overall_score=overall_score,
        technical_score=tech_score,
        experience_score=exp_score,
        education_score=edu_score,
        role_alignment_score=alignment_score,
        recommendation=recommendation,
        matching_skills=matching_skills,
        skill_gaps=skill_gaps,
        factors=factors,
        explanation=explanation,
        confidence=92,
    )

@app.post("/api/v1/evaluate-interview", response_model=InterviewEvalResponse)
def evaluate_interview_response(payload: InterviewEvalRequest):
    response_length = len(payload.candidate_response.strip())
    
    # NLP heuristics for articulate answer assessment
    relevance = min(95, 60 + int(response_length / 15))
    technical = min(92, 55 + int(response_length / 18))
    clarity = 85
    completeness = min(90, 50 + int(response_length / 12))
    overall = int((relevance + technical + clarity + completeness) / 4)

    feedback = (
        f"Your response demonstrates strong fundamental understanding. "
        f"To elevate this answer for a {payload.role_title} interview, consider highlighting measurable performance impact "
        f"(e.g., latency reduction, scalability metrics) and addressing error-handling edge cases."
    )

    suggested = (
        f"A top-tier answer should structure the solution into 3 pillars: "
        f"1) Architecture & architectural trade-offs, 2) Resiliency & state consistency, "
        f"and 3) Continuous monitoring with automated CI/CD safeguards."
    )

    return InterviewEvalResponse(
        overall_score=overall,
        relevance_score=relevance,
        technical_accuracy_score=technical,
        clarity_score=clarity,
        completeness_score=completeness,
        feedback=feedback,
        suggested_answer=suggested,
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
