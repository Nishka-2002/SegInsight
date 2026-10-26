# 🚀 SegInsight: Intelligent Customer Segmentation & Generative AI Studio

> **An End-to-End Enterprise Solution Bridging Unsupervised Machine Learning (K-Means) with Generative AI (LLMs)**  
> *Engineered for modern data-driven marketing, customer lifetime value (LTV) optimization, and automated omnichannel campaign generation.*

---

## 💡 The Core Problem & GenAI Solution

### The Classic ML Bottleneck
In traditional data science workflows, **K-Means clustering** groups customers mathematically into clusters based on numerical attributes (e.g., Annual Income vs. Spending Score). However, marketing executives and non-technical stakeholders cannot execute on raw statistical centroids like `Cluster 2: Income $55k, Score 49`.

### The Generative AI Leap
SegInsight solves this "last-mile activation problem" by layering **Generative AI** directly on top of unsupervised clustering:
1. **Centroid-to-Persona Grounding**: Numerical cluster centroids are prompt-engineered into rich, humanized psychographic customer archetypes (desires, buying frictions, churn risks, price elasticities).
2. **Omnichannel Campaign Studio**: Generates high-converting, tailored email sequences, SMS/WhatsApp promo blasts, social media ad copy, and pricing elasticity strategies in 1 click.
3. **SegInsight AI Copilot**: A multi-turn conversational assistant grounded in your cluster metrics allowing marketers to ask questions, brainstorm strategies, and simulate customer reactions.
4. **Synthetic Customer Simulation**: Augments data with realistic individual customer test profiles for testing campaigns prior to launch.
5. **C-Suite Executive Briefing**: Automatically drafts board-ready strategic memoranda with cluster economics, SWOT, and a 90-day execution roadmap.

---

## 🌟 Key Features

| Capability | Tech Stack | Description |
| :--- | :--- | :--- |
| **K-Means Clustering** | `Scikit-Learn`, `Pandas`, `NumPy` | Dynamic $K$-selection ($K=2$ to $6$), K-Means++ initialization, StandardScaler normalization, and 2D scatter visualization. |
| **AI Persona Studio** | Google Gemini / OpenAI / Smart Engine | Generates archetypes, core desires, friction points, churn vulnerability, and 5-dimension radar traits. |
| **Omnichannel Campaign Studio** | LLM Direct Response Copywriting | Produces full Email campaigns (subject, preheader, body, CTA), SMS blasts (<160 chars), social ads, and discount rationale. |
| **Synthetic Customer Lab** | LLM Data Augmentation | Synthesizes realistic individual test profiles with age, occupation, affinity brands, quotes, and simulated discount reactions. |
| **SegInsight AI Copilot** | Conversational LLM Layer | Persistent slide-over assistant answering analytical questions, simulating price bumps, and drafting sequences. |
| **1-Click Demo Mode** | FastAPI & React | Instant launch with 200 Mall Customer benchmark records—no CSV search required during interview screen shares! |
| **Dual Engine Architecture** | Live LLM + Heuristic Fallback | Seamlessly connects to **Google Gemini** or **OpenAI**, with an automatic built-in Smart Engine fallback that ensures 100% demo reliability even without an API key. |

---

## 🛠️ Architecture Overview

```
┌────────────────────────────────────────────────────────┐
│                   React 19 + Vite UI                   │
│   (AI Studio • Campaign Studio • Copilot • Analytics)  │
└───────────────────────────▲────────────────────────────┘
                            │ REST APIs
┌───────────────────────────▼────────────────────────────┐
│                    FastAPI Backend                     │
├───────────────────────────┬────────────────────────────┤
│   Unsupervised ML Layer   │      Generative AI Layer   │
│   • K-Means++ Clustering  │      • Persona Synthesis   │
│   • StandardScaler        │      • Campaign Studio     │
│   • Silhouette Analysis   │      • AI Copilot Chat     │
│   • Centroid Statistics   │      • Synthetic Profiles  │
│                           │      • C-Suite Memo        │
└───────────────────────────┴─────────────▲──────────────┘
                                          │
                   ┌──────────────────────┴──────────────────────┐
                   │                                             │
                   ▼                                             ▼
        [Live LLM Providers]                          [SegInsight Smart Engine]
     • Google Gemini (2.0 / 1.5 Flash)               • Built-in Heuristic Emulator
     • OpenAI (GPT-4o-mini)                          • Guaranteed 0-Key Offline Demo
```

---

## 🚀 Quickstart Guide

### 1. Prerequisites
- **Python 3.10+**
- **Node.js 18+**

### 2. Backend Setup
```bash
# Navigate to the backend directory
cd backend

# Create & activate a virtual environment (if not already active)
python -m venv venv
# Windows:
venv\Scripts\activate
# Mac/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt
# (or: pip install fastapi uvicorn pandas numpy scikit-learn joblib httpx python-dotenv google-genai openai)

# Optional: Add your API Key in .env (if left blank, Smart Engine will run automatically!)
cp .env.example .env

# Run the FastAPI server
python -m uvicorn main:app --reload --port 8000
```
Backend runs on: `http://127.0.0.1:8000`

### 3. Frontend Setup
```bash
# In the project root directory
npm install

# Start the Vite development server
npm run dev
```
Frontend runs on: `http://localhost:5173`

---

## 🎙️ How to Demo This Project in an Interview

1. **Start at `/upload`**:
   - Click the **"⚡ 1-Click Instant Demo Launch"** button. This automatically loads the benchmark 200-customer dataset without needing to find a CSV file.
2. **Review `/overview` & `/segmentation`**:
   - Showcase the K-Means clustering algorithm computing centroids across Annual Income and Spending Score.
   - Click **"Launch GenAI Persona & Campaign Studio"**.
3. **Explore `/insights` (The GenAI Showcase)**:
   - **Tab 1 (AI Personas)**: Show how mathematical centroids are turned into humanized personas with churn risk, price sensitivity, and tactical Do's/Don'ts.
   - **Tab 2 (AI Campaign Studio)**: Select a cluster and campaign goal (e.g., "VIP Early Access Drop"), then click **"Generate Campaign"** to demonstrate multi-channel email, SMS, and ad copy generation with 1-click clipboard copying.
   - **Tab 3 (Synthetic Customer Simulator)**: Explain how Generative AI augments tabular data by generating realistic test personas to simulate buying behavior.
   - **Tab 4 (C-Suite Briefing)**: Generate a board-level memorandum synthesizing the cluster economics into a 90-day strategic roadmap.
4. **Trigger SegInsight AI Copilot**:
   - Click the floating **"Ask AI Copilot"** button in the bottom right corner.
   - Click one of the quick chips (e.g., *"Which cluster has highest revenue upside?"* or *"Analyze churn risk across clusters"*) to showcase real-time conversational intelligence grounded in the dataset.
5. **Showcase Provider Flexibility**:
   - Click the **"✨ GenAI"** badge in the navbar to open the Engine settings modal.
   - Demonstrate that it can run live via **Google Gemini** or **OpenAI**, or seamlessly in **Smart Offline Mode** with zero external dependencies.

---

## 📄 License
MIT License. Built for data-driven analytics and Generative AI applications.
