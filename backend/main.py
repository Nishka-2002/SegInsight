import os
import sys
import logging
from typing import Optional, List, Dict, Any

from fastapi import FastAPI, Request, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel
import pandas as pd
import numpy as np
import joblib
from sklearn.cluster import KMeans

# Add current directory to path
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

from genai_service import genai_service

if hasattr(sys.stdout, 'reconfigure'):
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

# -------------------------------
# LOGGING & INIT
# -------------------------------
logging.basicConfig(level=logging.INFO)
print("[SEG-INSIGHT] GENAI BACKEND RUNNING")

app = FastAPI(title="SegInsight GenAI Backend", version="2.0.0")

# Global in-memory storage
latest_df = None
users_db = []
feedback_db = []

# -------------------------------
# CORS
# -------------------------------
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# -------------------------------
# LOAD ML MODELS
# -------------------------------
model_path = os.path.join(BASE_DIR, "kmeans_model.pkl")
scaler_path = os.path.join(BASE_DIR, "scaler.pkl")

try:
    model = joblib.load(model_path)
    scaler = joblib.load(scaler_path)
    print("[OK] ML Models loaded successfully")
except Exception as e:
    print(f"[WARN] Error loading models: {e}")
    model = None
    scaler = None

# -------------------------------
# ✅ SCHEMAS
# -------------------------------
class User(BaseModel):
    name: str
    email: str
    password: str

class LoginUser(BaseModel):
    email: str
    password: str

class FeedbackData(BaseModel):
    name: Optional[str] = "Anonymous"
    email: Optional[str] = "N/A"
    rating: int
    comments: Optional[str] = ""

class GenAIPersonasRequest(BaseModel):
    clusters_summary: Dict[str, Dict[str, float]]
    total_records: int
    counts_by_cluster: Dict[str, int]
    api_key: Optional[str] = None
    provider: Optional[str] = "auto"

class GenAICampaignRequest(BaseModel):
    cluster_id: int
    persona: Dict[str, Any]
    campaign_goal: Optional[str] = "Flash Sale Activation"
    brand_name: Optional[str] = "SegInsight Retail"
    api_key: Optional[str] = None
    provider: Optional[str] = "auto"

class GenAIChatRequest(BaseModel):
    messages: List[Dict[str, str]]
    cluster_context: Dict[str, Any]
    api_key: Optional[str] = None
    provider: Optional[str] = "auto"

class GenAISyntheticRequest(BaseModel):
    cluster_id: int
    persona: Dict[str, Any]
    api_key: Optional[str] = None
    provider: Optional[str] = "auto"

class GenAIMemoRequest(BaseModel):
    cluster_summary: Dict[str, Any]
    total_customers: int
    api_key: Optional[str] = None
    provider: Optional[str] = "auto"

# -------------------------------
# ✅ DATA UTILS
# -------------------------------
def normalize_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = df.columns.str.strip()
    rename_map = {
        "ID": "CustomerID", "Customer Id": "CustomerID", "customerid": "CustomerID",
        "Age": "Age", "age": "Age",
        "Gender": "Gender", "gender": "Gender",
        "Income": "Annual Income (k$)", "income": "Annual Income (k$)", "Annual Income": "Annual Income (k$)",
        "Spending Score": "Spending Score (1-100)", "SpendingScore": "Spending Score (1-100)", "score": "Spending Score (1-100)"
    }
    df.rename(columns=rename_map, inplace=True)
    return df

def preprocess(df: pd.DataFrame) -> pd.DataFrame:
    df = df.drop_duplicates()
    numeric_cols = df.select_dtypes(include=[np.number]).columns
    df[numeric_cols] = df[numeric_cols].fillna(df[numeric_cols].mean())
    return df

def get_recommendation(cluster: int) -> str:
    mapping = {
        0: "Mid-range customers → Offer combo deals & loyalty kickstarters",
        1: "Premium customers → VIP exclusivity & early access drops",
        2: "Cautious customers → Clear ROI, warranties & bundle value",
        3: "Budget customers → Flash discounts & threshold free shipping",
        4: "High spenders → High-touch VIP concierge & loyalty rewards"
    }
    return mapping.get(cluster, "General marketing campaign")

# -------------------------------
# ✅ TRADITIONAL ML ROUTES
# -------------------------------
@app.post("/register")
def register(user: User):
    if any(u["email"] == user.email for u in users_db):
        raise HTTPException(status_code=400, detail="Email already registered")
    users_db.append(user.dict())
    return {"message": "Registered successfully", "user": user.name}

@app.post("/login")
def login(user: LoginUser):
    for u in users_db:
        if u["email"] == user.email and u["password"] == user.password:
            return {"message": "Login successful", "user": u["name"]}
    raise HTTPException(status_code=401, detail="Invalid credentials")

@app.post("/upload")
async def upload(file: UploadFile = File(...)):
    global latest_df
    try:
        df = pd.read_csv(file.file)
        df = normalize_columns(df)
        df = preprocess(df)
        latest_df = df.copy()

        required = ["Annual Income (k$)", "Spending Score (1-100)"]
        X = df[required]
        
        # If scaler/model are loaded, predict; otherwise dynamic fit
        if scaler and model:
            X_scaled = scaler.transform(X)
            clusters = model.predict(X_scaled)
        else:
            from sklearn.preprocessing import StandardScaler
            temp_scaler = StandardScaler()
            X_scaled = temp_scaler.fit_transform(X)
            temp_kmeans = KMeans(n_clusters=5, init='k-means++', random_state=42, n_init=10)
            clusters = temp_kmeans.fit_predict(X_scaled)

        return {
            "message": "Upload successful",
            "clusters": clusters.tolist(),
            "recommendations": {int(c): get_recommendation(int(c)) for c in set(clusters)},
            "total_records": len(df)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/sample-demo")
def load_sample_demo():
    """1-Click instant demo dataset loader for fast interview presentations."""
    global latest_df
    sample_csv_path = os.path.join(BASE_DIR, "Mall_Customers.csv")
    if not os.path.exists(sample_csv_path):
        raise HTTPException(status_code=404, detail="Sample dataset not found.")
    
    df = pd.read_csv(sample_csv_path)
    df = normalize_columns(df)
    df = preprocess(df)
    latest_df = df.copy()

    required = ["Annual Income (k$)", "Spending Score (1-100)"]
    X = df[required]
    
    if scaler and model:
        X_scaled = scaler.transform(X)
        clusters = model.predict(X_scaled)
    else:
        from sklearn.preprocessing import StandardScaler
        temp_scaler = StandardScaler()
        X_scaled = temp_scaler.fit_transform(X)
        temp_kmeans = KMeans(n_clusters=5, init='k-means++', random_state=42, n_init=10)
        clusters = temp_kmeans.fit_predict(X_scaled)

    # Prepare scatter data
    scatter_data = []
    for i, row in latest_df.iterrows():
        scatter_data.append({
            "x": int(row["Annual Income (k$)"]),
            "y": int(row["Spending Score (1-100)"]),
            "cluster": int(clusters[i])
        })

    summary = latest_df.copy()
    summary["Cluster"] = clusters
    summary_stats = summary.groupby("Cluster")[required].mean().to_dict('index')

    return {
        "message": "Sample dataset loaded successfully",
        "clusters": clusters.tolist(),
        "scatter": scatter_data,
        "summary": summary_stats,
        "recommendations": {int(c): get_recommendation(int(c)) for c in set(clusters)},
        "total_records": len(df)
    }

@app.post("/segment")
async def segment_data(request: Request):
    global latest_df
    if latest_df is None:
        # Auto fallback to sample dataset if user clicked Run Model without uploading first
        sample_csv_path = os.path.join(BASE_DIR, "Mall_Customers.csv")
        if os.path.exists(sample_csv_path):
            df = pd.read_csv(sample_csv_path)
            latest_df = preprocess(normalize_columns(df))
        else:
            raise HTTPException(status_code=400, detail="Please upload a CSV first")
    
    body = await request.json()
    k = body.get("k", 4)
    
    try:
        required = ["Annual Income (k$)", "Spending Score (1-100)"]
        X = latest_df[required]
        
        from sklearn.preprocessing import StandardScaler
        current_scaler = scaler if scaler else StandardScaler()
        if scaler:
            X_scaled = scaler.transform(X)
        else:
            X_scaled = current_scaler.fit_transform(X)

        # Dynamic K-Means with user-specified k
        kmeans = KMeans(n_clusters=k, init='k-means++', random_state=42, n_init=10)
        clusters = kmeans.fit_predict(X_scaled)
        
        scatter_data = []
        for i, row in latest_df.iterrows():
            scatter_data.append({
                "x": int(row["Annual Income (k$)"]),
                "y": int(row["Spending Score (1-100)"]),
                "cluster": int(clusters[i])
            })

        summary = latest_df.copy()
        summary["Cluster"] = clusters
        summary_stats = summary.groupby("Cluster")[required].mean().to_dict('index')

        return {
            "scatter": scatter_data,
            "clusters": clusters.tolist(),
            "summary": summary_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/feedback")
async def receive_feedback(data: FeedbackData):
    feedback_db.append(data.dict())
    logging.info(f"Feedback received from {data.email}: {data.rating} stars")
    return {"status": "success", "message": "Feedback recorded"}

# -------------------------------
# 🚀 GENERATIVE AI ROUTES
# -------------------------------
@app.post("/genai/personas")
def generate_ai_personas(req: GenAIPersonasRequest):
    """Generates rich LLM psychographic personas for each customer cluster."""
    try:
        # Convert keys in counts_by_cluster to int
        counts_dict = {int(k): v for k, v in req.counts_by_cluster.items()}
        result = genai_service.generate_personas(
            clusters_summary=req.clusters_summary,
            total_records=req.total_records,
            counts_by_cluster=counts_dict,
            api_key=req.api_key,
            provider=req.provider or "auto"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /genai/personas: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/genai/campaign")
def generate_ai_campaign(req: GenAICampaignRequest):
    """Generates multi-channel marketing campaigns (Email, SMS, Social Ads, Discounts)."""
    try:
        result = genai_service.generate_campaign(
            cluster_id=req.cluster_id,
            persona=req.persona,
            campaign_goal=req.campaign_goal or "Weekend Flash Sale",
            brand_name=req.brand_name or "SegInsight Retail",
            api_key=req.api_key,
            provider=req.provider or "auto"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /genai/campaign: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/genai/chat")
def copilot_chat(req: GenAIChatRequest):
    """Interactive GenAI Copilot for cluster data analysis and strategy consultation."""
    try:
        result = genai_service.copilot_chat(
            messages=req.messages,
            cluster_context=req.cluster_context,
            api_key=req.api_key,
            provider=req.provider or "auto"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /genai/chat: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/genai/synthetic-profiles")
def generate_synthetic_profiles(req: GenAISyntheticRequest):
    """Generates synthetic individual customer profiles belonging to a cluster."""
    try:
        result = genai_service.generate_synthetic_profiles(
            cluster_id=req.cluster_id,
            persona=req.persona,
            api_key=req.api_key,
            provider=req.provider or "auto"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /genai/synthetic-profiles: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/genai/executive-memo")
def generate_executive_memo(req: GenAIMemoRequest):
    """Generates an executive C-Suite strategic memo synthesizing cluster economics."""
    try:
        result = genai_service.generate_executive_memo(
            cluster_summary=req.cluster_summary,
            total_customers=req.total_customers,
            api_key=req.api_key,
            provider=req.provider or "auto"
        )
        return result
    except Exception as e:
        logger.error(f"Error in /genai/executive-memo: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# -------------------------------
# ✅ SERVER START
# -------------------------------
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)