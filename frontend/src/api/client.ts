import type {
  DashboardSummary,
  Enquiry,
  EnquiryInput,
  EnquiryPage,
  FollowUp,
  FollowUpInput,
  HealthResponse,
  ModelInfo,
  PredictInput,
  PredictResult,
  Status,
} from "./types";

/**
 * The backend address comes from the VITE_API_BASE_URL environment variable.
 * Locally it falls back to http://localhost:8000.
 */
export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || "http://localhost:8000").replace(/\/+$/, "");

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

function describeError(body: unknown, fallback: string): string {
  if (body && typeof body === "object" && "detail" in body) {
    const detail = (body as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) {
      return detail
        .map((d: { loc?: (string | number)[]; msg?: string }) => {
          const field = d.loc?.filter((p) => p !== "body").join(".");
          return field ? `${field}: ${d.msg}` : (d.msg ?? "Invalid value");
        })
        .join("; ");
    }
  }
  return fallback;
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}/api${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...(init?.headers ?? {}) },
    });
  } catch {
    throw new ApiError(`Cannot reach the API at ${API_BASE_URL}. Check that the backend is running.`, 0);
  }
  if (response.status === 204) return undefined as T;
  const body: unknown = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(describeError(body, `Request failed (${response.status})`), response.status);
  return body as T;
}

const json = (method: string, data?: unknown): RequestInit => ({
  method,
  body: data === undefined ? undefined : JSON.stringify(data),
});

export interface ListParams {
  q?: string;
  status?: string;
  source?: string;
  priority?: string;
  sort?: string;
  page?: number;
  page_size?: number;
}

export const api = {
  health: () => request<HealthResponse>("/health"),
  summary: () => request<DashboardSummary>("/dashboard/summary"),
  priorityQueue: (limit = 8) => request<Enquiry[]>(`/followups/priority?limit=${limit}`),
  listEnquiries: (params: ListParams) => {
    const qs = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (v !== undefined && v !== "") qs.set(k, String(v));
    });
    return request<EnquiryPage>(`/enquiries?${qs.toString()}`);
  },
  getEnquiry: (id: number) => request<Enquiry>(`/enquiries/${id}`),
  createEnquiry: (data: EnquiryInput) => request<Enquiry>("/enquiries", json("POST", data)),
  updateEnquiry: (id: number, data: EnquiryInput) => request<Enquiry>(`/enquiries/${id}`, json("PUT", data)),
  updateStatus: (id: number, status: Status) =>
    request<Enquiry>(`/enquiries/${id}/status`, json("PATCH", { status })),
  deleteEnquiry: (id: number) => request<void>(`/enquiries/${id}`, json("DELETE")),
  listFollowUps: (id: number) => request<FollowUp[]>(`/enquiries/${id}/followups`),
  addFollowUp: (id: number, data: FollowUpInput) =>
    request<FollowUp>(`/enquiries/${id}/followups`, json("POST", data)),
  predict: (data: PredictInput) => request<PredictResult>("/predict", json("POST", data)),
  modelInfo: () => request<ModelInfo>("/ml/model-info"),
  retrain: () => request<{ model: ModelInfo; enquiries_rescored: number }>("/ml/retrain", json("POST")),
  seedDemo: (reset = false) => request<{ created: number }>(`/demo/seed?reset=${reset}`, json("POST")),
};
