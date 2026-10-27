import { useCallback, useRef, useState } from "react";
import { router, useFocusEffect, useLocalSearchParams, type Href } from "expo-router";
import * as DocumentPicker from "expo-document-picker";
import { noticeMatterType, noticeIssueType, ApiError, DOCUMENT_MAX_BYTES, DocumentMimeSchema, type ApiCase, type LegalNoticeIntake, type NoticeDraftContent } from "@legalitt/shared";
import { apiNoticeRepository, type NoticeRepository } from "./repository";
import { useSession } from "../../context/session";

export type NoticeStage =
  | "list"
  | "detail"
  | "step1"
  | "step2"
  | "step3"
  | "upload"
  | "summary"
  | "payment"
  | "tracking"
  | "changes"
  | "request"
  | "draft"
  | "send"
  | "final"
  | "dispatch"
  | "delivery"
  | "decision"
  | "delivered";
const emptyDraft: NoticeDraftContent = {
  sender: "",
  recipient: "",
  subject: "",
  facts: "",
  demand: "",
  closing: "",
};

/** Data and actions extracted from the legacy renderer; no screen markup lives here. */
export function useNoticeController(stage: NoticeStage, backend: NoticeRepository = apiNoticeRepository, enabled = true) {
  const params = useLocalSearchParams<{ caseId?: string; id?: string }>();
  const id = params.caseId ?? params.id;
  const { user, signOut } = useSession();
  const advocate = user?.role === "advocate";
  const [record, setRecord] = useState<ApiCase | null>(null),
    [items, setItems] = useState<ApiCase[]>([]);
  const [details, setDetails] = useState<LegalNoticeIntake>({}),
    [tier, setTier] = useState<"ordinary" | "urgent">("urgent");
  const [content, setContent] = useState<NoticeDraftContent>(emptyDraft),
    [comment, setComment] = useState("");
  const [carrier, setCarrier] = useState(""),
    [waybill, setWaybill] = useState("");
  const [authRequired, setAuthRequired] = useState(false);
  const [busy, setBusy] = useState(false),
    [error, setError] = useState(""),
    [loading, setLoading] = useState(true);
  const [pricing, setPricing] = useState<
    Awaited<ReturnType<typeof backend.service>>["pricing"]
  >([]);
  const dirty = useRef(false),
    working = useRef(false);
  const latest = record?.drafts?.at(-1);
  const href = (path: string, caseId = id): Href => {
    const [pathname, search = ''] = path.split('?');
    const query = new URLSearchParams(search);
    if (caseId) query.set('caseId', caseId);
    return (pathname + (query.size ? '?' + query.toString() : '')) as Href;
  };
  const go = (path: string, caseId = id) => router.push(href(path, caseId));
  const advocatePath = (suffix: string) => `/advocate/notice/${id}/${suffix}`;
  const load = useCallback(async () => {
    if (!enabled) return;
    if (stage === "detail") {
      setPricing((await backend.service("legal_notice")).pricing);
      return;
    }
    if (stage === "list") {
      let cursor: string | undefined;
      const rows: ApiCase[] = [];
      do {
        const page = await backend.cases(cursor);
        rows.push(...page.items);
        cursor = page.next_cursor ?? undefined;
      } while (cursor);
      setItems(rows);
      return;
    }
    if (!id) throw new Error("Select a request from My Cases.");
    const value = await backend.case(id);
    setRecord(value);
    if (!dirty.current) {
      setDetails({...value.details, issueType: noticeIssueType(value.matter_type)});
      setTier(value.tier ?? "urgent");
      setContent(value.drafts?.at(-1)?.content ?? emptyDraft);
    }
  }, [id, stage, enabled, backend]);
  useFocusEffect(
    useCallback(() => {
      if (!enabled) return;
      let alive = true;
      setLoading(true);
      setError("");
      const refresh = async () => {
        try {
          await load();
          if (alive) setError("");
        } catch (e) {
          if (alive) {
            setError(e instanceof Error ? e.message : "Request failed");
            if (e instanceof ApiError && e.status === 401)
              setAuthRequired(true);
          }
        } finally {
          if (alive) setLoading(false);
        }
      };
      void refresh();
      const timer = setInterval(() => {
        if (alive && !working.current && !dirty.current) void refresh();
      }, 5000);
      return () => {
        alive = false;
        clearInterval(timer);
      };
    }, [load, enabled]),
  );
  const run = async (action: () => Promise<unknown>) => {
    if (working.current) return;
    working.current = true;
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Request failed");
      if (e instanceof ApiError && e.status === 401) setAuthRequired(true);
    } finally {
      working.current = false;
      setBusy(false);
    }
  };
  const save = async (next: string) => {
    if (!id) return;
    await backend.saveIntake(id, { details, tier, matter_type: noticeMatterType(details.issueType) });
    dirty.current = false;
    go(next);
  };
  const upload = async (kind: string) => {
    if (!id) return;
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/jpeg", "image/png"],
      copyToCacheDirectory: true,
      base64: false,
    });
    if (result.canceled) return false;
    const asset = result.assets[0];
    if (asset.size !== undefined && asset.size > DOCUMENT_MAX_BYTES)
      throw new Error("File must be 25 MB or smaller.");
    const mime = DocumentMimeSchema.safeParse(asset.mimeType);
    if (!mime.success) throw new Error("Choose a PDF, JPEG or PNG document.");
    const ticket = await backend.presign({
      case_id: id,
      kind,
      filename: asset.name,
      mime: mime.data,
    });
    await backend.upload(
      ticket,
      asset.file ?? { uri: asset.uri, name: asset.name, type: mime.data },
    );
    await load();
    return true;
  };
  return { repository: backend, id, advocate, signOut, record, items, details, setDetails, tier, setTier,
    content, setContent, comment, setComment, carrier, setCarrier, waybill, setWaybill,
    authRequired, busy, error, loading, pricing, dirty, latest, href, go, advocatePath, load, run, save, upload };
}
