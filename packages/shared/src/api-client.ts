import type {
  ApiAuthResult,
  ApiCase,
  ApiDocument,
  ApiDraft,
  ApiEvent,
  ApiPage,
  ApiTokens,
  NoticeDraftContent,
  PresignInput,
  UploadTicket,
} from "./notice-api";
import type { LegalNoticeIntake } from "./legal-notice";
export class ApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code: "http" | "offline" | "timeout" | "configuration" = "http",
  ) {
    super(message);
    this.name = "ApiError";
  }
}
type Options = {
  baseUrl: string;
  getTokens?: () => Promise<ApiTokens | null>;
  setTokens?: (tokens: ApiTokens | null) => Promise<void>;
  fetch?: typeof fetch;
  timeoutMs?: number;
};
export class ApiClient {
  private refreshing?: Promise<ApiTokens>;
  constructor(private readonly options: Options) {}
  private async transport(
    path: string,
    method: string,
    body: unknown,
    token?: string,
    headers: Record<string, string> = {},
  ): Promise<Response> {
    if (!this.options.baseUrl)
      throw new ApiError(
        "Sign-in service is not configured",
        0,
        "configuration",
      );
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      this.options.timeoutMs ?? 15_000,
    );
    try {
      // Consume the response body before clearing the timeout, including slow bodies.
      const response = await (this.options.fetch ?? fetch)(
        `${this.options.baseUrl.replace(/\/$/, "")}/api/v1${path}`,
        {
          method,
          signal: controller.signal,
          headers: {
            "Content-Type": "application/json",
            ...headers,
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          ...(body === undefined ? {} : { body: JSON.stringify(body) }),
        },
      );
      const text = await response.text();
      return new Response(text, {
        status: response.status,
        headers: response.headers,
      });
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        controller.signal.aborted
          ? "Request timed out. Check the case before retrying."
          : "Unable to connect. Check your connection and try again.",
        0,
        controller.signal.aborted ? "timeout" : "offline",
      );
    } finally {
      clearTimeout(timer);
    }
  }
  private async refresh(tokens: ApiTokens): Promise<ApiTokens> {
    if (!tokens.refreshToken) throw new ApiError("Please sign in again", 401);
    if (!this.refreshing)
      this.refreshing = (async () => {
        const response = await this.transport("/auth/refresh", "POST", {
          refreshToken: tokens.refreshToken,
        });
        const result = await this.decode<ApiAuthResult>(response);
        const next = {
          ...result.tokens,
          refreshToken: result.tokens.refreshToken ?? tokens.refreshToken,
          expiresAt: Date.now() + result.tokens.expiresIn * 1000,
        };
        const current = await this.options.getTokens?.();
        if (
          this.options.getTokens &&
          current?.refreshToken !== tokens.refreshToken
        )
          throw new ApiError("Session changed. Please sign in again.", 401);
        await this.options.setTokens?.(next);
        return next;
      })()
        .catch(async (error) => {
          if (
            error instanceof ApiError &&
            [400, 401, 403].includes(error.status) &&
            (await this.options.getTokens?.())?.refreshToken ===
              tokens.refreshToken
          )
            await this.options.setTokens?.(null);
          throw error;
        })
        .finally(() => {
          this.refreshing = undefined;
        });
    return this.refreshing;
  }
  private async decode<T>(response: Response): Promise<T> {
    let data: any;
    try {
      data = await response.json();
    } catch {
      throw new ApiError(
        "The service returned an unreadable response",
        response.status,
      );
    }
    if (!response.ok)
      throw new ApiError(
        typeof data.message === "string"
          ? data.message
          : Array.isArray(data.message)
            ? data.message.join("; ")
            : "Request failed",
        response.status,
      );
    return data as T;
  }
  async request<T>(
    path: string,
    body?: unknown,
    method = body === undefined ? "GET" : "POST",
    explicitToken?: string,
    headers: Record<string, string> = {},
  ): Promise<T> {
    const authenticated = !path.startsWith("/auth/");
    let tokens = authenticated ? await this.options.getTokens?.() : null;
    if (tokens?.expiresAt && tokens.expiresAt <= Date.now() + 30_000)
      tokens = await this.refresh(tokens);
    let response = await this.transport(
      path,
      method,
      body,
      explicitToken ?? tokens?.idToken,
      headers,
    );
    if (response.status === 401 && authenticated && tokens?.refreshToken) {
      tokens = await this.refresh(tokens);
      response = await this.transport(path, method, body, tokens.idToken, headers);
    }
    return this.decode<T>(response);
  }
  adminCases(input: import('./admin-api').AdminCaseQuery = {}) {
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(input)) if (value !== undefined) query.set(key, String(value));
    return this.request<import('./admin-api').AdminCasePage>(`/admin/cases?${query}`);
  }
  service(code: string) {
    return this.request<{
      code: string;
      name: string;
      pricing: {
        id: string;
        tier: string | null;
        variant: string | null;
        base_amount_paise: string;
        gst_bps: number;
        confirmed: boolean;
      }[];
    }>(`/services/${encodeURIComponent(code)}`);
  }
  createCase(input: {
    service_code: "legal_notice";
    tier?: "ordinary" | "urgent";
    details?: LegalNoticeIntake;
    matter_type?: import("./legal-notice").LegalNoticeMatterType | null;
  }) {
    return this.request<ApiCase>("/cases", input);
  }
  case(id: string) {
    return this.request<ApiCase>(`/cases/${encodeURIComponent(id)}`);
  }
  cases(cursor?: string) {
    return this.request<ApiPage<ApiCase>>(
      "/cases?limit=100" +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
    );
  }
  requests() {
    return this.request<ApiPage<ApiCase>>("/advocate/requests");
  }
  saveIntake(
    id: string,
    input: { details?: LegalNoticeIntake; tier?: "ordinary" | "urgent"; matter_type?: import("./legal-notice").LegalNoticeMatterType | null },
  ) {
    return this.request<ApiCase>(`/cases/${id}`, input, "PATCH");
  }
  submit(id: string) {
    return this.request<ApiCase>(`/cases/${id}/submit`, {});
  }
  pay(id: string, purpose: 'service_fee' | 'courier' = 'service_fee', key = `${purpose}:${id}`) {
    return this.request<{id: string; case_id: string; payer_id: string; purpose: string; total_paise: string; simulated: boolean; status: string}>(
      '/payments/intents', {case_id: id, purpose}, 'POST', undefined, {'Idempotency-Key': key});
  }
  assign(id: string, advocate_id: string) {
    return this.request<ApiCase>(`/admin/cases/${id}/assign`, { advocate_id });
  }
  accept(id: string) {
    return this.request<ApiCase>(`/cases/${id}/accept`, {});
  }
  start(id: string) {
    return this.request<ApiCase>(`/cases/${id}/start`, {});
  }
  decline(id: string, reason?: string | null) {
    return this.request<ApiCase>(`/cases/${id}/decline`, { reason });
  }
  saveDraft(id: string, content: NoticeDraftContent) {
    return this.request<ApiDraft>(`/cases/${id}/drafts`, {
      kind: "legal_notice",
      content,
      generated_by: "manual",
    });
  }
  drafts(id: string) {
    return this.request<ApiDraft[]>(`/cases/${id}/drafts`);
  }
  sendDraft(id: string, draftId: string) {
    return this.request<ApiCase>(`/cases/${id}/drafts/${draftId}/send`, {});
  }
  approve(id: string, draftId: string) {
    return this.request<ApiCase>(`/cases/${id}/drafts/${draftId}/approve`, {});
  }
  requestChanges(id: string, draftId: string, comment: string) {
    return this.request<ApiCase>(
      `/cases/${id}/drafts/${draftId}/request-changes`,
      { comment },
    );
  }
  events(id: string) {
    return this.request<ApiPage<ApiEvent>>(`/cases/${id}/events?limit=100`);
  }
  caseThread(id:string){return this.request<{id:string;case_id:string}>(`/cases/${id}/thread`);}
  messages(id:string,after?:string){return this.request<ApiPage<import('./notice-api').ApiMessage>>(`/threads/${id}/messages${after?'?after='+encodeURIComponent(after):''}`);}
  sendMessage(id:string,input:{body?:string;document_id?:string}){return this.request<import('./notice-api').ApiMessage>(`/threads/${id}/messages`,input);}
  readMessages(id:string){return this.request<{read:true}>(`/threads/${id}/read`,{});}
  receiveShipment(id: string) {
    return this.request<import('./shipments').ApiShipment>(`/cases/${id}/shipment/received`, {});
  }
  saveShipment(id: string, details: import('./shipments').ShipmentDetails) {
    return this.request<import('./shipments').ApiShipment>(`/cases/${id}/shipment`, details);
  }
  bookShipment(id: string, details: import('./shipments').ShipmentDetails) {
    return this.request<import('./shipments').ApiShipment>(`/cases/${id}/shipment/book`, details);
  }
  dispatch(id: string) {
    return this.request<ApiCase>(`/cases/${id}/dispatch`, {});
  }
  deliver(id: string, pod_document_id: string) {
    return this.request<ApiCase>(`/admin/cases/${id}/deliver`, {
      pod_document_id,
    });
  }
  shipmentStatus(id: string, status: import('./shipments').ShipmentStatus) {
    return this.request<import('./shipments').ApiShipment>(`/admin/cases/${id}/shipment/status`, { status });
  }
  cancel(id: string) {
    return this.request<ApiCase>(`/cases/${id}/cancel`, {});
  }
  presign(input: PresignInput) {
    return this.request<UploadTicket>("/documents/presign", input);
  }
  completeDocument(id: string) {
    return this.request<ApiDocument>(`/documents/${id}/complete`, {});
  }
  documentUrl(id: string) {
    return this.request<{ url: string; expires_in: number }>(
      `/documents/${id}/url`,
    );
  }
  deleteDocument(id: string) {
    return this.request<{ deleted: true }>(
      `/documents/${id}`,
      undefined,
      "DELETE",
    );
  }
  async upload(
    ticket: UploadTicket,
    file: Blob | { uri: string; name: string; type: string },
  ) {
    const form = new FormData();
    for (const [key, value] of Object.entries(ticket.upload.fields))
      form.append(key, value);
    if (typeof Blob !== "undefined" && file instanceof Blob)
      form.append("file", file, ticket.document.filename);
    else form.append("file", file as unknown as Blob);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 120_000);
    try {
      const response = await (this.options.fetch ?? fetch)(ticket.upload.url, {
        method: "POST",
        body: form,
        signal: controller.signal,
      });
      if (!response.ok)
        throw new ApiError(
          "Document upload failed. Please retry.",
          response.status,
        );
    } catch (error) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(
        controller.signal.aborted
          ? "Document upload timed out. Please retry."
          : "Document upload failed. Check your connection.",
        0,
        controller.signal.aborted ? "timeout" : "offline",
      );
    } finally {
      clearTimeout(timer);
    }
    return this.completeDocument(ticket.document.id);
  }
}
