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
    readonly details?: unknown,
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
  saveFirIntake(id: string, intake: import('./fir').FirIntake, expected_updated_at?:string) {return this.request<ApiCase>(`/fir/${id}/intake`,{...intake,...(expected_updated_at?{expected_updated_at}:{})},'PATCH');}
  firDraftContext(id:string){return this.request<import('./fir-draft').FirDraftContext>(`/fir/${id}/draft-context`);}
  saveFirDraft(id: string, input: import('./fir-draft').FirDraftSave) {return this.request<{id:string;version:number;content:import('./fir-draft').FirDraftContent}>(`/fir/${id}/drafts`,input);}
  previewFirDraft(id:string,draft:string){return this.request<{filename:string;pdf_base64:string}>(`/fir/${id}/drafts/${draft}/pdf`,{},'POST',undefined,{},60000);}
  sendFirDraft(id: string, draft: string) {return this.request(`/fir/${id}/drafts/${draft}/send`,{},'POST',undefined,{},60000);}
  firLifecycle(id:string){return this.request<import('./fir-lifecycle').FirLifecycleView>(`/fir/${id}/lifecycle`);}
  approveFirDraft(id: string, draft: string,token:import('./fir-lifecycle').FirLifecycleToken) {return this.request(`/fir/${id}/drafts/${draft}/approve`,token);}
  // docs/flows/FIR-DRAFT-FLOW.md: role-shaped view and the client / advocate / admin actions.
  firFlow(id:string){return this.request<import('./fir-flow').FirFlowView>(`/fir/${id}/flow`);}
  /** Read-only: the promised turnaround (no police setting, Q119, Q120). */
  firSettings(){return this.request<import('./fir-flow').FirSettings>('/fir/settings');}
  firClientApprove(id:string,draft_id:string){return this.request<import('./fir-flow').FirFlowView>(`/fir/${id}/client-approve`,{draft_id});}
  firClientChanges(id:string,input:{draft_id:string;sections:string[];comment:string;attachment_document_id?:string|null}){return this.request<import('./fir-flow').FirFlowView>(`/fir/${id}/client-changes`,input);}
  firReject(id:string,reason:string){return this.request<{rejected:true}>(`/fir/${id}/reject`,{reason});}
  firRemindClient(id:string){return this.request<import('./fir-flow').FirFlowView>(`/fir/${id}/remind-client`,{});}
  reassignFir(id:string,input:import('./fir-lifecycle').FirLifecycleToken&{advocate_id:string;reason:string}){return this.request<import('./fir-lifecycle').FirLifecycleView>(`/fir/${id}/reassign`,input);}
  // D-12/D-13 cancellations and simulated refunds.
  caseCancellation(id: string) {return this.request<import('./cancellations').CaseCancellation>(`/cases/${encodeURIComponent(id)}/cancellation`);}
  cancelCase(id: string, input: {reason?: import('./cancellations').CancellationReasonCode | null; note?: string; confirm: true}) {return this.request<import('./cancellations').CaseCancellation>(`/cases/${encodeURIComponent(id)}/cancellation`, input);}
  adminCancellations(status: 'pending' | 'decided' = 'pending') {return this.request<{items: import('./cancellations').AdminCancellationRow[]; status: string}>(`/admin/cancellations?status=${status}`);}
  decideCancellation(id: string, input: {decision: 'approve' | 'decline'; refund_amount_paise?: string; reason: string; advocate_entitlement_paise?: string | null}) {return this.request<import('./cancellations').CaseCancellation>(`/admin/cancellations/${encodeURIComponent(id)}/decide`, input);}
  // D-35 advocate verification and the admin approvals queue (D-42).
  verification() {return this.request<import('./advocate-verification').VerificationState>('/advocate/verification');}
  saveVerification(details: import('./advocate-verification').VerificationDetails) {return this.request<import('./advocate-verification').VerificationState>('/advocate/verification', {details}, 'PATCH');}
  presignVerificationDocument(input: {kind: string; filename: string; mime: string}) {return this.request<import('./notice-api').UploadTicket>('/advocate/verification/documents/presign', input);}
  completeVerificationDocument(id: string) {return this.request<import('./advocate-verification').VerificationDocument>(`/advocate/verification/documents/${encodeURIComponent(id)}/complete`, {});}
  removeVerificationDocument(id: string) {return this.request<{deleted: true}>(`/advocate/verification/documents/${encodeURIComponent(id)}`, undefined, 'DELETE');}
  verificationDocumentUrl(id: string) {return this.request<{url: string; expires_in: number}>(`/advocate/verification/documents/${encodeURIComponent(id)}/url`);}
  submitVerification() {return this.request<import('./advocate-verification').VerificationState>('/advocate/verification/submit', {});}
  adminAdvocateApprovals(status: 'waiting' | 'decided' = 'waiting') {return this.request<{items: import('./advocate-verification').AdvocateApprovalRow[]}>(`/admin/advocate-approvals?status=${status}`);}
  adminAdvocateApproval(id: string) {return this.request<import('./advocate-verification').AdvocateApprovalDetail>(`/admin/advocate-approvals/${encodeURIComponent(id)}`);}
  adminVerificationDocumentUrl(id: string) {return this.request<{url: string; expires_in: number}>(`/admin/advocate-approvals/documents/${encodeURIComponent(id)}/url`);}
  decideAdvocateApproval(id: string, input: {decision: 'approved' | 'needs_update' | 'rejected'; reason?: string}) {return this.request<import('./advocate-verification').AdvocateApprovalDetail>(`/admin/advocate-approvals/${encodeURIComponent(id)}/decide`, input);}
  // Report services: Property Search, Document Forensic, Court Marriage.
  reportPricing(code: import('./service-reports').ReportServiceCode) {return this.request<import('./service-reports').ReportPricing>(`/service-reports/pricing/${code}`);}
  saveReportIntake(id: string, input: {tier?: 'ordinary'|'urgent'|null; details: Record<string, unknown>; expected_updated_at?: string}) {return this.request<ApiCase>(`/service-reports/${id}/intake`,input,'PATCH');}
  startReport(id: string) {return this.request<ApiCase>(`/service-reports/${id}/start`,{});}
  saveReport(id: string, input: Record<string, unknown>) {return this.request<{id:string;version:number}>(`/service-reports/${id}/drafts`,input);}
  previewReport(id: string, draft: string) {return this.request<{files:{filename:string;pdf_base64:string}[]}>(`/service-reports/${id}/drafts/${draft}/preview`,{},'POST',undefined,{},60000);}
  submitReport(id: string, draft: string) {return this.request<ApiCase>(`/service-reports/${id}/drafts/${draft}/submit`,{},'POST',undefined,{},60000);}
  approveReport(id: string, draft: string) {return this.request<ApiCase>(`/service-reports/${id}/drafts/${draft}/approve`,{});}
  requestReportChanges(id: string, draft: string, items: import('./service-reports').ChangeItem[]) {return this.request<ApiCase>(`/service-reports/${id}/drafts/${draft}/request-changes`,{items});}
  // Account area (D-20–D-24, D-27). All act on the signed-in user only.
  accountPreferences() {return this.request<import('./account').AccountPreferences>('/account/preferences');}
  updateAccountPreferences(input: {language?: string; notifications?: Partial<Record<import('./account').NotificationCategory, boolean>>}) {return this.request<import('./account').AccountPreferences>('/account/preferences', input, 'PATCH');}
  accountSecurity() {return this.request<import('./account').AccountSecurity>('/account/security');}
  changePassword(current_password: string, new_password: string, access_token: string) {return this.request<{changed: true}>('/account/password', {current_password, new_password, access_token});}
  signOutEverywhere(access_token: string) {return this.request<{signed_out: true}>('/account/sign-out-everywhere', {access_token});}
  exportAccount() {return this.request<Record<string, unknown>>('/account/export');}
  accountDeletion() {return this.request<import('./account').DeletionState>('/account/deletion');}
  requestAccountDeletion(input: {reason?: string; access_token?: string}) {return this.request<{id: string; status: string; created_at: string}>('/account/deletion', input);}
  savedAdvocates() {return this.request<{items: import('./account').SavedAdvocate[]}>('/account/saved-advocates');}
  saveAdvocate(id: string) {return this.request<{saved: boolean}>(`/account/saved-advocates/${encodeURIComponent(id)}`, {}, 'PUT');}
  unsaveAdvocate(id: string) {return this.request<{saved: boolean}>(`/account/saved-advocates/${encodeURIComponent(id)}`, undefined, 'DELETE');}
  // Client account area (D-15, D-17, D-18, D-19).
  accountProfile() {return this.request<import('./account-data').AccountProfile>('/account/profile');}
  updateAccountProfile(input: import('./account-data').AccountProfileUpdate) {return this.request<import('./account-data').AccountProfile>('/account/profile',input,'PATCH');}
  accountDocuments(caseId?: string) {return this.request<{items: import('./account-data').AccountDocument[]}>(`/account/documents${caseId?`?case_id=${encodeURIComponent(caseId)}`:''}`);}
  accountPayments() {return this.request<{items: import('./account-data').AccountPayment[]; totals: {captured_paise: string; captured_count: number}}>('/account/payments');}
  accountPayment(id: string) {return this.request<import('./account-data').AccountPayment>(`/account/payments/${encodeURIComponent(id)}`);}
  accountReceipt(id: string) {return this.request<{filename: string; pdf_base64: string}>(`/account/payments/${encodeURIComponent(id)}/receipt`,undefined,'GET',undefined,{},60000);}
  // D-07 advocate completion view; D-24/D-42 admin account deletion queue.
  advocateCompletion(id: string) {return this.request<import('./completion').AdvocateCompletion>(`/advocate/cases/${encodeURIComponent(id)}/completion`);}
  adminAccountDeletions(status: 'open' | 'decided' = 'open') {return this.request<{items: import('./completion').AdminDeletionRow[]}>(`/admin/account-deletions?status=${status}`);}
  decideAccountDeletion(id: string, input: {decision: 'review' | 'complete' | 'reactivate'; note: string}) {return this.request<{id: string; status: string}>(`/admin/account-deletions/${encodeURIComponent(id)}/decide`, input);}
  // Advocate wallet and manual payouts (D-36, D-42).
  wallet(period: import('./wallet').WalletPeriod = 'month') {return this.request<import('./wallet').Wallet>(`/advocate/wallet?period=${period}`);}
  bankAccount() {return this.request<{bank: import('./wallet').MaskedBankAccount | null}>('/advocate/bank-account');}
  saveBankAccount(input: import('./wallet').BankAccountInput) {return this.request<{bank: import('./wallet').MaskedBankAccount}>('/advocate/bank-account', input, 'PUT');}
  requestPayout(amount_paise: string) {return this.request<import('./wallet').PayoutRequestView>('/advocate/payout-requests', {amount_paise});}
  payoutRequest(id: string) {return this.request<import('./wallet').PayoutRequestView>(`/advocate/payout-requests/${encodeURIComponent(id)}`);}
  adminPayouts(status: 'pending' | 'paid' = 'pending') {return this.request<{items: import('./wallet').AdminPayoutRow[]; counts: {pending: number; paid: number}}>(`/admin/payouts?status=${status}`);}
  markPayoutPaid(id: string, utr: string, paid_on?: string) {return this.request<import('./wallet').PayoutRequestView>(`/admin/payouts/${encodeURIComponent(id)}/paid`, {utr, ...(paid_on ? {paid_on} : {})});}
  private refreshing?: Promise<ApiTokens>;
  constructor(private readonly options: Options) {}
  private async transport(
    path: string,
    method: string,
    body: unknown,
    token?: string,
    headers: Record<string, string> = {},
    timeoutMs?: number,
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
      timeoutMs ?? this.options.timeoutMs ?? 15_000,
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
        'http', data,
      );
    return data as T;
  }
  async request<T>(
    path: string,
    body?: unknown,
    method = body === undefined ? "GET" : "POST",
    explicitToken?: string,
    headers: Record<string, string> = {},
    timeoutMs?: number,
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
      timeoutMs,
    );
    if (response.status === 401 && authenticated && tokens?.refreshToken) {
      tokens = await this.refresh(tokens);
      response = await this.transport(path, method, body, tokens.idToken, headers, timeoutMs);
    }
    return this.decode<T>(response);
  }
  adminDocumentPreview(id: string) { return this.request<{url: string; expires_in: number}>(`/admin/cases/documents/${encodeURIComponent(id)}/preview`); }
  adminCase(id: string) { return this.request<import('./admin-api').AdminCaseDetail>(`/admin/cases/${encodeURIComponent(id)}`); }
  adminAdvocates(service?: import('./services').ServiceCode) {
    return this.request<{items: import('./admin-api').AdminAdvocate[]}>('/admin/advocates' + (service ? `?service=${service}` : ''));
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
      pricing_mode?: 'fixed' | 'consultation_then_quote' | 'unconfirmed';
      pricing: {
        id: string;
        tier: string | null;
        variant: string | null;
        base_amount_paise: string;
        gst_bps: number;
        confirmed: boolean;
        duration_minutes?: number | null;
      }[];
    }>(`/services/${encodeURIComponent(code)}`);
  }
  createCase(input: import('./case-input').CreateCaseInput) {
    return this.request<ApiCase>("/cases", input);
  }
  case(id: string) {
    return this.request<ApiCase>(`/cases/${encodeURIComponent(id)}`);
  }
  cases(cursor?: string, serviceCode?: import('./services').ServiceCode) {
    return this.request<ApiPage<ApiCase>>(
      "/cases?limit=100" +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : "") +
        (serviceCode ? "&service_code=" + encodeURIComponent(serviceCode) : ""),
    );
  }
  requests() {
    return this.request<ApiPage<ApiCase>>("/advocate/requests");
  }
  saveIntake(
    id: string,
    input: import('./legal-notice').NoticeIntakeFields & { details?: LegalNoticeIntake; tier?: "ordinary" | "urgent"; matter_type?: import("./legal-notice").LegalNoticeMatterType | null },
  ) {
    return this.request<ApiCase>(`/cases/${id}`, input, "PATCH");
  }
  generateNoticeSubject(id: string) {
    // AI adapters have a 60s bound. Keep their actionable response within the
    // client deadline without lengthening ordinary case/auth requests.
    return this.request<{text: string; simulated: boolean}>(`/cases/${id}/subject`, {}, 'POST', undefined, {}, 65_000);
  }
  generateNoticeDemands(id: string) {
    return this.request<{options: string[]; simulated: boolean}>(`/cases/${id}/demand-options`, {}, 'POST', undefined, {}, 65_000);
  }
  submit(id: string) {
    return this.request<ApiCase>(`/cases/${id}/submit`, {});
  }
  paymentQuote(id: string) {
    return this.request<import('./pricing').PaymentQuote>('/payments/quotes', {case_id: id}, 'POST');
  }
  pay(id: string, purpose: 'service_fee' | 'courier' = 'service_fee', key = `${purpose}:${id}`, quoteId?: string) {
    return this.request<{id: string; case_id: string; payer_id: string; purpose: string; total_paise: string; simulated: boolean; status: string}>(
      '/payments/intents', {case_id: id, purpose, ...(quoteId ? {quote_id: quoteId} : {})}, 'POST', undefined, {'Idempotency-Key': key});
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
  saveDraft(id: string, content: NoticeDraftContent, compliance_period_days?: number) {
    return this.request<ApiDraft>(`/cases/${id}/drafts`, {
      kind: "legal_notice",
      content,
      generated_by: "manual",
      ...(compliance_period_days !== undefined ? {compliance_period_days} : {}),
    });
  }
  drafts(id: string) {
    return this.request<ApiDraft[]>(`/cases/${id}/drafts`);
  }
  renderDraft(id: string, draftId: string) {
    return this.request<{filename: string; pdf_base64: string}>(`/cases/${id}/drafts/${draftId}/pdf`, {}, 'POST', undefined, {}, 60_000);
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
  // D-28 messages inbox and D-26 support.
  messagesInbox(q?:string){return this.request<{items:import('./support').MessagesInboxItem[]}>(`/messages/inbox${q?'?q='+encodeURIComponent(q):''}`);}
  threadMessages(id:string){return this.request<ApiPage<import('./support').ThreadMessage>>(`/threads/${id}/messages`);}
  createSupportTicket(input:{subject:string;related_to:string;description:string;contact_method:string;case_id?:string|null}){return this.request<import('./support').SupportTicketView>('/support/tickets',input);}
  supportTickets(){return this.request<import('./support').SupportTicketView[]>('/support/tickets');}
  supportTicket(id:string){return this.request<import('./support').SupportTicketView>(`/support/tickets/${id}`);}
  replySupport(id:string,body:string){return this.request<import('./support').SupportTicketView>(`/support/tickets/${id}/messages`,{body});}
  readSupport(id:string){return this.request<{read:true}>(`/support/tickets/${id}/read`,{});}
  requestCallback(input:{name:string;phone:string;note?:string;service_code?:import('./services').ServiceCode}){return this.request<import('./support').SupportTicketView>('/support/callbacks',input);}
  supportChat(){return this.request<{chat:import('./support').SupportTicketView|null}>('/support/chat');}
  sendSupportChat(body:string,service_code?:import('./services').ServiceCode){return this.request<import('./support').SupportTicketView>('/support/chat',{body,...(service_code?{service_code}:{})});}
  adminSupport(status:'open'|'closed'='open'){return this.request<{items:import('./support').SupportInboxRow[];counts:{open:number;closed:number}}>(`/admin/support?status=${status}`);}
  adminSupportTicket(id:string){return this.request<import('./support').SupportAdminTicket>(`/admin/support/${id}`);}
  adminSupportReply(id:string,body:string){return this.request<{replied:true}>(`/admin/support/${id}/messages`,{body});}
  adminSupportClose(id:string){return this.request<{closed:true}>(`/admin/support/${id}/close`,{});}
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
  deliver(id: string, pod_document_id: string, details: Omit<import('./shipments').DeliveryConfirmation, 'pod_document_id'> = {}) {
    return this.request<ApiCase>(`/admin/cases/${id}/deliver`, {
      pod_document_id, ...details,
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
