import os
import json
import re
import logging
from typing import Dict, Any, List, Optional
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# Try to import SDKs if available
try:
    from google import genai
    from google.genai import types
    GEMINI_SDK_AVAILABLE = True
except Exception as e:
    logger.warning(f"Google GenAI SDK not initialized: {e}")
    GEMINI_SDK_AVAILABLE = False

try:
    from openai import OpenAI
    OPENAI_SDK_AVAILABLE = True
except Exception as e:
    logger.warning(f"OpenAI SDK not initialized: {e}")
    OPENAI_SDK_AVAILABLE = False


def extract_json_from_text(text: str) -> Optional[Any]:
    """Robustly extract JSON object or array from LLM response text."""
    if not text:
        return None
    text = text.strip()
    
    # Check if text is wrapped in ```json ... ```
    match = re.search(r"```(?:json)?\s*([\s\S]*?)\s*```", text)
    if match:
        text = match.group(1).strip()
    
    try:
        return json.loads(text)
    except Exception:
        # Try finding first { and last } or first [ and last ]
        first_curly = text.find('{')
        last_curly = text.rfind('}')
        if first_curly != -1 and last_curly != -1 and last_curly > first_curly:
            try:
                return json.loads(text[first_curly:last_curly + 1])
            except Exception:
                pass
        
        first_sq = text.find('[')
        last_sq = text.rfind(']')
        if first_sq != -1 and last_sq != -1 and last_sq > first_sq:
            try:
                return json.loads(text[first_sq:last_sq + 1])
            except Exception:
                pass
    return None


class GenAIService:
    def __init__(self):
        self.default_gemini_key = os.getenv("GEMINI_API_KEY", "")
        self.default_openai_key = os.getenv("OPENAI_API_KEY", "")
    
    def resolve_key_and_provider(self, client_key: Optional[str] = None, provider: str = "auto") -> tuple[str, str]:
        """Resolves active API key and provider."""
        key = client_key.strip() if client_key and client_key.strip() else ""
        
        if not key:
            if self.default_gemini_key:
                return self.default_gemini_key, "gemini"
            if self.default_openai_key:
                return self.default_openai_key, "openai"
            return "", "smart_engine"
        
        # Check key prefix if provider is auto
        if provider == "auto":
            if key.startswith("AIza"):
                return key, "gemini"
            elif key.startswith("sk-"):
                return key, "openai"
            else:
                return key, "gemini"
        
        return key, provider

    def call_gemini(self, prompt: str, system_prompt: str, api_key: str, model_name: str = "gemini-2.0-flash") -> str:
        """Call Gemini API via official google-genai SDK."""
        if not GEMINI_SDK_AVAILABLE:
            raise RuntimeError("Google GenAI SDK is not installed.")
        
        client = genai.Client(api_key=api_key)
        response = client.models.generate_content(
            model=model_name,
            contents=prompt,
            config=types.GenerateContentConfig(
                system_instruction=system_prompt,
                temperature=0.7,
            )
        )
        return response.text

    def call_openai(self, prompt: str, system_prompt: str, api_key: str, model_name: str = "gpt-4o-mini") -> str:
        """Call OpenAI API via official openai SDK."""
        if not OPENAI_SDK_AVAILABLE:
            raise RuntimeError("OpenAI SDK is not installed.")
        
        client = OpenAI(api_key=api_key)
        response = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": prompt}
            ],
            temperature=0.7
        )
        return response.choices[0].message.content

    def execute_prompt(
        self,
        prompt: str,
        system_prompt: str,
        api_key: Optional[str] = None,
        provider: str = "auto",
        fallback_generator=None
    ) -> tuple[str, Dict[str, Any]]:
        """Executes prompt against Gemini, OpenAI, or falls back to Smart Engine."""
        resolved_key, active_provider = self.resolve_key_and_provider(api_key, provider)
        
        if active_provider == "gemini" and resolved_key:
            try:
                # Try gemini-2.0-flash first, fallback to 1.5-flash if needed
                try:
                    text = self.call_gemini(prompt, system_prompt, resolved_key, "gemini-2.0-flash")
                    return text, {"provider": "Google Gemini", "model": "gemini-2.0-flash", "status": "live"}
                except Exception as g2_err:
                    logger.warning(f"Gemini 2.0 error, trying 1.5-flash: {g2_err}")
                    text = self.call_gemini(prompt, system_prompt, resolved_key, "gemini-1.5-flash")
                    return text, {"provider": "Google Gemini", "model": "gemini-1.5-flash", "status": "live"}
            except Exception as e:
                logger.error(f"Gemini execution failed: {e}. Falling back to Smart AI Engine.")
        
        elif active_provider == "openai" and resolved_key:
            try:
                text = self.call_openai(prompt, system_prompt, resolved_key, "gpt-4o-mini")
                return text, {"provider": "OpenAI", "model": "gpt-4o-mini", "status": "live"}
            except Exception as e:
                logger.error(f"OpenAI execution failed: {e}. Falling back to Smart AI Engine.")
        
        # Smart Engine Fallback
        if fallback_generator:
            simulated_text = fallback_generator()
            return simulated_text, {
                "provider": "SegInsight Smart GenAI Engine",
                "model": "rule-guided-heuristic-llm",
                "status": "simulated",
                "note": "Connect Gemini or OpenAI API key in settings for live external LLM generation."
            }
        
        return "No generation available.", {"provider": "none", "model": "none", "status": "error"}

    # -------------------------------------------------------------
    # 1. AI PERSONA GENERATION
    # -------------------------------------------------------------
    def generate_personas(
        self,
        clusters_summary: Dict[str, Dict[str, float]],
        total_records: int,
        counts_by_cluster: Dict[int, int],
        api_key: Optional[str] = None,
        provider: str = "auto"
    ) -> Dict[str, Any]:
        """Generates deep, humanized psychographic customer personas for every cluster."""
        system_prompt = (
            "You are an expert Generative AI Consumer Psychologist and Chief Marketing Officer. "
            "Your job is to analyze K-Means customer cluster statistical centroids (Income in k$, Spending Score 1-100) "
            "and synthesize rich, realistic, humanized customer personas. "
            "Return ONLY valid JSON with no markdown wrapping or explanation."
        )

        cluster_details = []
        for cid, stats in clusters_summary.items():
            cid_int = int(cid)
            count = counts_by_cluster.get(cid_int, 0)
            pct = round((count / total_records * 100), 1) if total_records > 0 else 0
            income = round(stats.get("Annual Income (k$)", 0), 1)
            score = round(stats.get("Spending Score (1-100)", 0), 1)
            cluster_details.append({
                "cluster_id": cid_int,
                "count": count,
                "percentage": pct,
                "avg_income_k": income,
                "avg_spending_score": score
            })

        prompt = f"""
Analyze the following {len(cluster_details)} customer clusters derived from K-Means clustering:
{json.dumps(cluster_details, indent=2)}

For EACH cluster, generate a JSON object with this exact structure:
{{
  "personas": [
    {{
      "cluster_id": 0,
      "archetype": "Catchy title (e.g. 'Affluent Trendsetters' or 'Pragmatic Savers')",
      "tagline": "A punchy 1-sentence behavioral summary",
      "demographic_profile": "e.g. Young professionals / Established families / Students",
      "core_desire": "What they crave most when shopping",
      "biggest_friction": "What prevents them from converting",
      "price_sensitivity": "High | Moderate | Low | Luxury-Insensitive",
      "churn_risk": "Low | Moderate | High",
      "optimal_channels": ["Channel 1", "Channel 2", "Channel 3"],
      "brand_tone": "e.g. Sophisticated & Exclusive | Friendly & Transparent | Energetic & Hype",
      "hook_offer": "Concrete irresistible offer or campaign hook",
      "tactical_dos": ["Actionable marketing tip 1", "Actionable marketing tip 2"],
      "tactical_donts": ["What NEVER to do with this group"],
      "traits": [
        {{"metric": "Income", "value": 75}},
        {{"metric": "Spending", "value": 85}},
        {{"metric": "Brand Loyalty", "value": 60}},
        {{"metric": "Price Elasticity", "value": 40}},
        {{"metric": "Digital Affinity", "value": 90}}
      ]
    }}
  ]
}}
Ensure the persona traits reflect realistic psychological traits grounded in their actual income and spending score. Return ONLY JSON.
"""

        def smart_fallback():
            personas = []
            for item in cluster_details:
                cid = item["cluster_id"]
                inc = item["avg_income_k"]
                score = item["avg_spending_score"]

                if inc >= 70 and score >= 70:
                    archetype = "The High-Rolling Connoisseur"
                    tagline = "Affluent patrons who prioritize exclusivity, prestige, and seamless VIP luxury."
                    demo = "Established executives, successful entrepreneurs (Ages 32-52)"
                    desire = "Status elevation, curated luxury, effortless priority service"
                    friction = "Generic mass-market promotions and slow customer service"
                    price_sens = "Luxury-Insensitive"
                    churn = "Low"
                    channels = ["Private Concierge Email", "Exclusive VIP Events", "Instagram Direct"]
                    tone = "Sophisticated, bespoke, discreetly prestigious"
                    hook = "Invitation-only VIP Club with complimentary personal styling"
                    dos = ["Highlight bespoke quality and provenance", "Offer early access before public release"]
                    donts = ["Never blast them with discount coupons or cheap sale alerts"]
                    loyalty, elast, digital = 85, 25, 80

                elif inc <= 40 and score >= 70:
                    archetype = "The Impulsive Trendsetter"
                    tagline = "Young, highly engaged shoppers spending heavily on the newest viral trends."
                    demo = "Gen-Z & Young Millennials, students and early-career creatives (Ages 18-28)"
                    desire = "Social validation, viral aesthetics, instant gratification"
                    friction = "High upfront prices without flexible installments (Klarna/Afterpay)"
                    price_sens = "Moderate (Values trendiness over savings)"
                    churn = "High"
                    channels = ["TikTok Ads", "Instagram Stories", "WhatsApp Flash Drops"]
                    tone = "Energetic, punchy, trend-savvy, culturally attuned"
                    hook = "Limited 48-Hour Drop + Buy Now, Pay Later zero interest"
                    dos = ["Use countdown timers and micro-influencer content", "Integrate instant 1-click checkout"]
                    donts = ["Avoid lengthy corporate emails with plain text"]
                    loyalty, elast, digital = 45, 70, 95

                elif inc >= 70 and score <= 40:
                    archetype = "The Calculated Wealth Builder"
                    tagline = "High-earning individuals with deliberate, ROI-focused spending criteria."
                    demo = "Finance professionals, tech engineers, cautious investors (Ages 35-58)"
                    desire = "Long-term utility, measurable quality, indisputable value propositions"
                    friction = "Unproven claims, flashy hype, poor warranties or lack of technical specs"
                    price_sens = "High on principle (Values substance over flash)"
                    churn = "Moderate"
                    channels = ["In-depth Email Whitepapers", "LinkedIn", "Editorial Reviews"]
                    tone = "Analytical, authoritative, transparent, merit-driven"
                    hook = "Lifetime Durability Guarantee + Tiered Volume Savings"
                    dos = ["Provide comparison charts and objective third-party proof", "Emphasize warranties and cost-per-use"]
                    donts = ["Do not use artificial urgency or countdown gimmicks"]
                    loyalty, elast, digital = 75, 40, 65

                elif inc <= 45 and score <= 45:
                    archetype = "The Pragmatic Budget Optimizer"
                    tagline = "Cost-conscious shoppers looking for reliable everyday essentials at maximum value."
                    demo = "Students, gig workers, and budget-managing households (Ages 22-60)"
                    desire = "Predictable pricing, clear bargains, no hidden fees"
                    friction = "Shipping costs, surge pricing, high barrier to free returns"
                    price_sens = "High"
                    churn = "High (Brand loyalty switches to lowest bidder)"
                    channels = ["SMS Text Deals", "App Push Notifications", "Email Weekly Deals"]
                    tone = "Warm, helpful, transparent, highly value-driven"
                    hook = "Double Loyalty Points + Guaranteed Lowest Price Match"
                    dos = ["Highlight total savings and free delivery thresholds", "Offer rewards on small repeat transactions"]
                    donts = ["Never introduce surprise checkout fees or complex promo terms"]
                    loyalty, elast, digital = 50, 90, 70

                else:
                    archetype = "The Balanced Everyday Mainstream"
                    tagline = "Moderate income shoppers with steady, thoughtful purchasing habits."
                    demo = "Suburban families and middle-tier salaried professionals (Ages 28-48)"
                    desire = "Convenience, trusted family reliability, seasonal variety"
                    friction = "Complicated loyalty tiers or lack of bundled options"
                    price_sens = "Moderate"
                    churn = "Low"
                    channels = ["Weekly Newsletter", "Facebook / Meta Ads", "Push Alerts"]
                    tone = "Approachable, family-friendly, optimistic"
                    hook = "Family Bundle 20% Off + Free Seasonal Gift"
                    dos = ["Bundle complimentary items together", "Reward consistent quarterly purchases"]
                    donts = ["Avoid alienating them with ultra-luxury or ultra-budget extremes"]
                    loyalty, elast, digital = 65, 60, 75

                personas.append({
                    "cluster_id": cid,
                    "archetype": archetype,
                    "tagline": tagline,
                    "demographic_profile": demo,
                    "core_desire": desire,
                    "biggest_friction": friction,
                    "price_sensitivity": price_sens,
                    "churn_risk": churn,
                    "optimal_channels": channels,
                    "brand_tone": tone,
                    "hook_offer": hook,
                    "tactical_dos": dos,
                    "tactical_donts": donts,
                    "traits": [
                        {"metric": "Income", "value": inc},
                        {"metric": "Spending", "value": score},
                        {"metric": "Loyalty", "value": loyalty},
                        {"metric": "Elasticity", "value": elast},
                        {"metric": "Digital", "value": digital}
                    ]
                })
            return json.dumps({"personas": personas})

        raw_text, meta = self.execute_prompt(prompt, system_prompt, api_key, provider, smart_fallback)
        parsed = extract_json_from_text(raw_text)
        
        if not parsed or "personas" not in parsed:
            parsed = json.loads(smart_fallback())
            meta["note"] = "Used fallback generator due to output parsing error"
        
        return {"data": parsed.get("personas", []), "metadata": meta}

    # -------------------------------------------------------------
    # 2. AI CAMPAIGN STUDIO GENERATION
    # -------------------------------------------------------------
    def generate_campaign(
        self,
        cluster_id: int,
        persona: Dict[str, Any],
        campaign_goal: str = "Weekend Flash Sale",
        brand_name: str = "SegInsight Retail",
        api_key: Optional[str] = None,
        provider: str = "auto"
    ) -> Dict[str, Any]:
        """Generates comprehensive omnichannel marketing copy for a specific segment."""
        system_prompt = (
            "You are an award-winning Creative Director and Direct-Response Copywriter. "
            "You generate conversion-optimized, audience-tailored marketing campaigns. "
            "Return ONLY valid JSON with no markdown formatting."
        )

        archetype = persona.get("archetype", f"Cluster {cluster_id}")
        tagline = persona.get("tagline", "")
        tone = persona.get("brand_tone", "Persuasive and engaging")
        friction = persona.get("biggest_friction", "Price hesitation")
        hook = persona.get("hook_offer", "Special Promotion")

        prompt = f"""
Generate a targeted multi-channel campaign for:
- Brand: {brand_name}
- Target Audience: {archetype} (Cluster {cluster_id})
- Profile: {tagline}
- Key Friction: {friction}
- Persona Hook: {hook}
- Campaign Objective: {campaign_goal}
- Brand Voice Tone: {tone}

Generate a JSON object matching this schema:
{{
  "campaign_name": "Clever campaign title",
  "strategic_rationale": "2-3 sentences explaining why this campaign converts this specific cluster",
  "email": {{
    "subject_line": "Catchy subject line with emoji",
    "preheader": "Compelling preview text (under 90 chars)",
    "headline": "Bold hero header",
    "body_copy": "Engaging 2-3 paragraph marketing email tailored to this archetype's psychology",
    "cta_button": "Call to action button text",
    "personalization_token": "e.g. {{first_name}}"
  }},
  "sms": {{
    "message": "Punchy SMS/WhatsApp text under 150 characters with dynamic offer and short link",
    "char_count": 135
  }},
  "social_ad": {{
    "platform": "Instagram / Meta / LinkedIn",
    "hook": "First 3-second visual or text hook",
    "caption": "High-converting social caption with hashtags",
    "creative_brief": "Visual instruction for graphic designer or video creator"
  }},
  "pricing_and_discount": {{
    "recommended_discount": "e.g. 15% off orders over $150 or Free VIP Gift",
    "pricing_mechanic": "Tiered Volume / Threshold Free Shipping / Straight %",
    "psychological_trigger": "Urgency / Exclusivity / Social Proof / Loss Aversion"
  }}
}}
Return ONLY JSON.
"""

        def smart_fallback():
            return json.dumps({
                "campaign_name": f"Operation Catalyst: {archetype}",
                "strategic_rationale": f"Designed specifically for {archetype} by addressing their friction ({friction}) and emphasizing their primary desire through {tone} storytelling.",
                "email": {
                    "subject_line": f"✨ Exclusively for you: Unlock your private access to {brand_name}",
                    "preheader": "Your curated invitation is ready — experience the collection first.",
                    "headline": f"Crafted for Those Who Appreciate the Exceptional",
                    "body_copy": (
                        f"Hello {{first_name}},\n\n"
                        f"We noticed your discerning eye for quality. At {brand_name}, we believe in creating experiences that respect your time and elevate your everyday lifestyle.\n\n"
                        f"This season, we've set aside a strictly private preview of our newest arrivals tailored to your tastes. "
                        f"No noise, no crowd — just our highest rated selections with your preferred complimentary concierge delivery.\n\n"
                        f"Use your private code VIP-ACCESS at checkout before Sunday midnight."
                    ),
                    "cta_button": "Explore Your Curated Selection →",
                    "personalization_token": "{{first_name}}"
                },
                "sms": {
                    "message": f"Hey {{first_name}}! VIP early access is LIVE for {brand_name}. Use VIP-ACCESS for complimentary express shipping: seg.in/vip-now",
                    "char_count": 128
                },
                "social_ad": {
                    "platform": "Instagram Reels / Stories",
                    "hook": "Stop settling for ordinary essentials. Here is what actual luxury looks like.",
                    "caption": f"Engineered for true distinction. Discover the {brand_name} difference today. Limited batch release. Tap to claim early access. #CuratedStyle #SmartLiving",
                    "creative_brief": "High-contrast minimalist video showing tactile product textures, elegant typography overlays, and zero clutter."
                },
                "pricing_and_discount": {
                    "recommended_discount": "Complimentary Premium Gift with Orders > $120",
                    "pricing_mechanic": "Value-Add rather than margin dilution",
                    "psychological_trigger": "Exclusivity and Reciprocity"
                }
            })

        raw_text, meta = self.execute_prompt(prompt, system_prompt, api_key, provider, smart_fallback)
        parsed = extract_json_from_text(raw_text)
        if not parsed or "email" not in parsed:
            parsed = json.loads(smart_fallback())
            meta["note"] = "Used fallback generator due to output parsing error"
        
        return {"campaign": parsed, "metadata": meta}

    # -------------------------------------------------------------
    # 3. INTERACTIVE AI COPILOT CHAT
    # -------------------------------------------------------------
    def copilot_chat(
        self,
        messages: List[Dict[str, str]],
        cluster_context: Dict[str, Any],
        api_key: Optional[str] = None,
        provider: str = "auto"
    ) -> Dict[str, Any]:
        """Multi-turn conversational AI Copilot grounded in customer segmentation data."""
        system_prompt = (
            "You are 'SegInsight AI Copilot', an elite enterprise Generative AI analytics consultant. "
            "You have direct access to the user's customer segmentation dataset, K-Means clustering metrics, "
            "and behavioral centroids. Your goal is to provide deeply insightful, actionable, concise, "
            "and numbers-backed marketing and business intelligence advice. "
            "Use Markdown formatting with bold metrics, bullet points, and clear strategy when answering."
        )

        context_str = json.dumps(cluster_context, indent=2)
        history_str = "\n".join([f"{m.get('role', 'user').upper()}: {m.get('content', '')}" for m in messages[-6:]])

        prompt = f"""
CURRENT ACTIVE SEGMENTATION CONTEXT:
{context_str}

CONVERSATION HISTORY:
{history_str}

Respond to the latest message as the SegInsight AI Copilot. Be insightful, concise, data-grounded, and strategically sharp.
"""

        def smart_fallback():
            last_msg = messages[-1].get("content", "").lower() if messages else ""
            if "churn" in last_msg or "retention" in last_msg:
                return (
                    "### 🛡️ Churn Risk & Retention Strategy\n\n"
                    "Based on our centroid data:\n"
                    "- **Highest Churn Vulnerability**: Groups with lower brand loyalty and high price sensitivity (typically low-income/high-spending impulsives or budget optimizers) tend to churn the fastest when promotions cease.\n"
                    "- **Recommended Intervention**:\n"
                    "  1. **Automated Trigger**: Deploy an engagement re-activation email at Day 21 of inactivity.\n"
                    "  2. **Incentive Structure**: Offer a micro-milestone credit ($5 off their next order) instead of a percentage discount to preserve margin.\n"
                    "  3. **Preferred Channel**: SMS/WhatsApp converts 3.4x higher than standard email for this cohort."
                )
            elif "revenue" in last_msg or "roi" in last_msg or "upside" in last_msg:
                return (
                    "### 💰 Revenue Optimization Analysis\n\n"
                    "Analyzing your cluster economics:\n"
                    "- **Immediate Revenue Driver**: The affluent high-spending cluster represents the highest Lifetime Value (LTV). A **5% increase in retention** in this segment yields up to a **28% increase in net profits**.\n"
                    "- **Untapped Potential**: High-income but low-spending customers have deep purchasing power but lack conviction. Targeting them with quality guarantees, transparent reviews, and bundle trials can unlock substantial incremental spend.\n"
                    "- **Action**: Introduce a tiered VIP loyalty status that gamifies spend milestones."
                )
            elif "campaign" in last_msg or "email" in last_msg or "sequence" in last_msg:
                return (
                    "### ✉️ 3-Step Omnichannel Activation Sequence\n\n"
                    "Here is a recommended sequence to test across your segments:\n\n"
                    "1. **Day 1: The Curiosity Hook**\n"
                    "   - *Channel*: Personalized Email\n"
                    "   - *Theme*: Tailored product recommendation matching their cluster's spending appetite.\n"
                    "2. **Day 3: The Social Proof Pillar**\n"
                    "   - *Channel*: Instagram/Facebook Retargeting\n"
                    "   - *Theme*: Real customer reviews and unboxing clips addressing their cluster's main hesitation.\n"
                    "3. **Day 5: The Urgency Closer**\n"
                    "   - *Channel*: SMS / Push Notification\n"
                    "   - *Theme*: 24-Hour exclusive bonus incentive."
                )
            else:
                return (
                    f"### 📊 SegInsight Intelligence Synthesis\n\n"
                    f"I've analyzed your customer distribution across active clusters:\n\n"
                    f"- **Data Grounding**: Your segmentation clearly identifies distinct consumer archetypes separated by discretionary income and spending velocity.\n"
                    f"- **Strategic Recommendation**: Avoid 'one-size-fits-all' discounts. High-scoring segments respond best to **exclusivity and speed**, whereas low-scoring clusters convert on **clear price transparency and bundles**.\n\n"
                    f"💡 *Tip: Ask me to write an email campaign for a specific cluster, compare cluster lifetime values, or simulate price sensitivity.*"
                )

        text, meta = self.execute_prompt(prompt, system_prompt, api_key, provider, smart_fallback)
        return {"reply": text, "metadata": meta}

    # -------------------------------------------------------------
    # 4. SYNTHETIC CUSTOMER PROFILES (DATA AUGMENTATION)
    # -------------------------------------------------------------
    def generate_synthetic_profiles(
        self,
        cluster_id: int,
        persona: Dict[str, Any],
        api_key: Optional[str] = None,
        provider: str = "auto"
    ) -> Dict[str, Any]:
        """Generates realistic synthetic customer profiles for testing and simulation."""
        system_prompt = (
            "You are a Generative AI synthetic data specialist. "
            "Generate 3 realistic individual customer profiles that mathematically and psychologically "
            "belong to the specified cluster. Return ONLY valid JSON."
        )

        archetype = persona.get("archetype", f"Cluster {cluster_id}")
        prompt = f"""
Generate 3 realistic synthetic individual customer profiles belonging to archetype: '{archetype}' (Cluster {cluster_id}).
JSON format:
{{
  "profiles": [
    {{
      "name": "Full Name",
      "age": 34,
      "occupation": "Job Title",
      "location": "City, State",
      "annual_income_k": 78,
      "spending_score": 82,
      "favorite_brands": ["Brand 1", "Brand 2"],
      "customer_quote": "A quote expressing how they think about shopping",
      "recent_purchases": ["Item 1", "Item 2"],
      "likely_reaction_to_discount": "How they respond to 20% off",
      "avatar_emoji": "👔"
    }}
  ]
}}
Return ONLY JSON.
"""

        def smart_fallback():
            return json.dumps({
                "profiles": [
                    {
                        "name": "Marcus Vance",
                        "age": 38,
                        "occupation": "Senior Tech Product Director",
                        "location": "Austin, TX",
                        "annual_income_k": 92,
                        "spending_score": 88,
                        "favorite_brands": ["Apple", "Aesop", "Nordstrom", "Lululemon"],
                        "customer_quote": "I don't look at price tags if the product saves me time and looks effortless.",
                        "recent_purchases": ["Wireless noise-canceling headphones", "Artisan leather travel bag"],
                        "likely_reaction_to_discount": "Ignores small coupons; motivated only by VIP invitations or scarce editions.",
                        "avatar_emoji": "💼"
                    },
                    {
                        "name": "Elena Rostova",
                        "age": 29,
                        "occupation": "Creative Strategy Consultant",
                        "location": "Chicago, IL",
                        "annual_income_k": 84,
                        "spending_score": 79,
                        "favorite_brands": ["Reformation", "Zara Home", "Nespresso"],
                        "customer_quote": "Aesthetic quality and brand ethics matter to me just as much as functionality.",
                        "recent_purchases": ["Ergonomic minimalist desk lamp", "Organic linen bedding set"],
                        "likely_reaction_to_discount": "Appreciates bundled gifts or free upgrades over slash-price sales.",
                        "avatar_emoji": "🎨"
                    },
                    {
                        "name": "David Chen",
                        "age": 44,
                        "occupation": "Venture Operations Partner",
                        "location": "San Francisco, CA",
                        "annual_income_k": 115,
                        "spending_score": 86,
                        "favorite_brands": ["Porsche Design", "Rimowa", "Allbirds"],
                        "customer_quote": "I want friction-free ordering. One tap, seamless delivery, zero hassle.",
                        "recent_purchases": ["Smart home ecosystem hub", "Ultralight carbon briefcase"],
                        "likely_reaction_to_discount": "Does not wait for sales; buys immediately when need arises.",
                        "avatar_emoji": "⚡"
                    }
                ]
            })

        raw_text, meta = self.execute_prompt(prompt, system_prompt, api_key, provider, smart_fallback)
        parsed = extract_json_from_text(raw_text)
        if not parsed or "profiles" not in parsed:
            parsed = json.loads(smart_fallback())
            meta["note"] = "Used fallback generator due to output parsing error"
            
        return {"profiles": parsed.get("profiles", []), "metadata": meta}

    # -------------------------------------------------------------
    # 5. C-SUITE EXECUTIVE MEMO GENERATOR
    # -------------------------------------------------------------
    def generate_executive_memo(
        self,
        cluster_summary: Dict[str, Any],
        total_customers: int,
        api_key: Optional[str] = None,
        provider: str = "auto"
    ) -> Dict[str, Any]:
        """Generates an executive memo summarizing cluster economics and strategic roadmap."""
        system_prompt = (
            "You are a McKinsey/Bain Senior Strategy Partner and Chief AI Strategist. "
            "Synthesize raw customer segmentation data into a high-stakes, board-level Executive Memorandum in clean Markdown."
        )

        prompt = f"""
Dataset Summary ({total_customers} Total Customer Records):
{json.dumps(cluster_summary, indent=2)}

Create an Executive Briefing Memorandum containing:
# Executive Briefing: Data-Driven Customer Segmentation & GenAI Activation
## 1. Executive Summary & Macro Takeaways
## 2. Cluster Economics & Revenue Distribution
## 3. High-Priority Growth Vectors & Quick Wins
## 4. Key Risk Factors & Churn Exposure
## 5. 90-Day Tactical Execution Roadmap (Phases 1-3)
## 6. Projected ROI Impact

Make it executive-ready, insightful, and strategic.
"""

        def smart_fallback():
            return f"""# Executive Briefing: Data-Driven Customer Segmentation & GenAI Activation

**Prepared for**: Chief Executive Officer & Chief Marketing Officer  
**Platform**: SegInsight AI Analytics Engine  
**Dataset Scope**: {total_customers} Validated Customer Records across {len(cluster_summary)} Distinct Clusters  

---

### 1. Executive Summary & Macro Takeaways
Unsupervised K-Means clustering has segregated our customer base into {len(cluster_summary)} distinct behavioral cohorts. The statistical variance in customer annual income and spending score reveals significant polarization:
- Top-tier spenders drive the majority of margin velocity, but represent an under-serviced opportunity for high-touch loyalty lock-in.
- High-income / conservative-spending cohorts represent our largest latent revenue reservoir—requiring authority-based marketing rather than generic discounting.
- Generative AI activation allows automated 1-to-1 personalization across all cohorts without increasing operational marketing headcount.

---

### 2. Cluster Economics & Behavioral Matrix
| Cluster | Profile Archetype | Avg Income ($k) | Spending Velocity | Strategic Focus |
| :--- | :--- | :--- | :--- | :--- |
| **Cluster 0** | Core Mainstream Cohort | Balanced | Moderate | Loyalty points & bundle upsells |
| **Cluster 1** | VIP High-Yield Cohort | Top Quartile | High | White-glove concierge & exclusivity |
| **Cluster 2** | Price-Sensitive Explorers | Lower Tier | Variable | Low-friction financing & flash drops |
| **Cluster 3** | Cautious Capital Preservers | Top Quartile | Conservative | Warranties, case studies & proof |

---

### 3. High-Priority Growth Vectors (Quick Wins)
1. **Automated LLM Campaign Triggers**: Implement dynamic email and SMS generation tailored to each cluster's psychological hook, lifting email click-to-open rates by an estimated 35-45%.
2. **Margin Protection in Promotions**: Eliminate blanket sitewide sales. Restrict percentage discounts solely to price-sensitive clusters, shifting high-earning cohorts to value-add bonuses.
3. **VIP Friction Elimination**: Expedited checkout and dedicated priority support for top spending tiers.

---

### 4. 90-Day Tactical Execution Roadmap
- **Days 1 - 30 (Foundation)**: Deploy SegInsight GenAI personas into CRM; launch automated cluster-specific welcome sequences.
- **Days 31 - 60 (Activation)**: A/B test dynamic LLM subject lines and SMS promotions across cohorts; measure conversion lift against legacy benchmarks.
- **Days 61 - 90 (Scale & Optimize)**: Integrate synthetic customer simulation into weekly campaign sign-offs before public launch.

---
*Report synthesized automatically by SegInsight Generative AI Engine.*
"""

        memo_text, meta = self.execute_prompt(prompt, system_prompt, api_key, provider, smart_fallback)
        return {"memo": memo_text, "metadata": meta}


genai_service = GenAIService()
