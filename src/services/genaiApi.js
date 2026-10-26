// API Client for SegInsight GenAI Backend

const API_BASE = "http://127.0.0.1:8000";

export const getStoredAISettings = () => {
  const apiKey = localStorage.getItem("seginsight_api_key") || "";
  const provider = localStorage.getItem("seginsight_provider") || "auto";
  const model = localStorage.getItem("seginsight_model") || "gemini-2.0-flash";
  return { apiKey, provider, model };
};

export const saveStoredAISettings = (settings) => {
  if (settings.apiKey !== undefined) localStorage.setItem("seginsight_api_key", settings.apiKey);
  if (settings.provider !== undefined) localStorage.setItem("seginsight_provider", settings.provider);
  if (settings.model !== undefined) localStorage.setItem("seginsight_model", settings.model);
};

export async function fetchAIPersonas(clustersSummary, totalRecords, countsByCluster) {
  const { apiKey, provider } = getStoredAISettings();
  const res = await fetch(`${API_BASE}/genai/personas`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      clusters_summary: clustersSummary,
      total_records: totalRecords,
      counts_by_cluster: countsByCluster,
      api_key: apiKey,
      provider: provider,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate AI personas");
  }
  return await res.json();
}

export async function generateAICampaign(clusterId, persona, campaignGoal, brandName = "SegInsight Retail") {
  const { apiKey, provider } = getStoredAISettings();
  const res = await fetch(`${API_BASE}/genai/campaign`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cluster_id: clusterId,
      persona: persona,
      campaign_goal: campaignGoal,
      brand_name: brandName,
      api_key: apiKey,
      provider: provider,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate campaign");
  }
  return await res.json();
}

export async function sendCopilotChat(messages, clusterContext) {
  const { apiKey, provider } = getStoredAISettings();
  const res = await fetch(`${API_BASE}/genai/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      messages: messages,
      cluster_context: clusterContext,
      api_key: apiKey,
      provider: provider,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to get AI Copilot response");
  }
  return await res.json();
}

export async function fetchSyntheticProfiles(clusterId, persona) {
  const { apiKey, provider } = getStoredAISettings();
  const res = await fetch(`${API_BASE}/genai/synthetic-profiles`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cluster_id: clusterId,
      persona: persona,
      api_key: apiKey,
      provider: provider,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate synthetic profiles");
  }
  return await res.json();
}

export async function fetchExecutiveMemo(clusterSummary, totalCustomers) {
  const { apiKey, provider } = getStoredAISettings();
  const res = await fetch(`${API_BASE}/genai/executive-memo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      cluster_summary: clusterSummary,
      total_customers: totalCustomers,
      api_key: apiKey,
      provider: provider,
    }),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to generate executive memo");
  }
  return await res.json();
}

export async function loadSampleDemoDataset() {
  const res = await fetch(`${API_BASE}/sample-demo`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || "Failed to load demo dataset");
  }
  return await res.json();
}
