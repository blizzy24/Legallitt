import { useCallback, useRef, useState } from "react";
import {
  router,
  useFocusEffect,
  useLocalSearchParams,
  type Href,
} from "expo-router";
import {
  ActivityIndicator,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { Mail, MapPin, User, Users } from "lucide-react-native";
import {
  ApiError,
  bucketFor,
  DOCUMENT_MAX_BYTES,
  DocumentMimeSchema,
  ID_PROOF_NOTICE,
  type ApiCase,
  type LegalNoticeIntake,
  type NoticeDraftContent,
} from "@legalitt/shared";
import { backend } from "../../lib/auth";
import { useSession } from "../../context/session";
import {
  colors,
  font,
  advNoticeDraft as draftTokens,
  wizardField,
} from "../../constants/theme";
import { ADV_NOTICE_DRAFT } from "../../data/advocateSide";
import WizardShell from "../WizardShell";
import FlatField from "../FlatField";
import ServiceHeader from "../ServiceHeader";

type Stage =
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
const fields: (keyof NoticeDraftContent)[] = [
  "sender",
  "recipient",
  "subject",
  "facts",
  "demand",
  "closing",
];
const emptyDraft: NoticeDraftContent = {
  sender: "",
  recipient: "",
  subject: "",
  facts: "",
  demand: "",
  closing: "",
};
const issues = [
  ["property-dispute", "Property Dispute"],
  ["money-recovery", "Money Recovery"],
  ["tenant-issue", "Tenant Issue"],
  ["family-dispute", "Family Dispute"],
  ["cheque-bounce", "Cheque Bounce"],
  ["consumer-complaint", "Consumer Complaint"],
  ["other", "Any other"],
] as const;
const labels: Record<string, string> = {
  draft: "Draft",
  submitted: "Request Submitted",
  payment_pending: "Payment Pending",
  paid: "Payment Confirmed",
  assigning: "Advocate Assignment",
  assigned: "Advocate Assigned",
  advocate_accepted: "Accepted",
  advocate_declined: "Declined",
  in_progress: "Drafting in Progress",
  client_review: "Awaiting Your Approval",
  changes_requested: "Changes Requested",
  approved: "Approved",
  dispatching: "Dispatch",
  dispatched: "Notice Dispatched",
  completed: "Delivery Confirmed",
  cancelled: "Cancelled",
  refunded: "Refunded",
};
const stepFor: Partial<Record<Stage, number>> = {
  step1: 1,
  step2: 2,
  step3: 3,
  upload: 4,
  summary: 5,
  payment: 6,
};
export default function ApiLegalNotice({ stage }: { stage: Stage }) {
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
  const go = (path: string, caseId = id) =>
    router.push(
      (path + (caseId ? "?caseId=" + encodeURIComponent(caseId) : "")) as Href,
    );
  const advocatePath = (suffix: string) => `/advocate/notice/${id}/${suffix}`;
  const load = useCallback(async () => {
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
      setDetails(value.details);
      setTier(value.tier ?? "urgent");
      setContent(value.drafts?.at(-1)?.content ?? emptyDraft);
    }
  }, [id, stage]);
  useFocusEffect(
    useCallback(() => {
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
    }, [load]),
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
  const button = (
    label: string,
    action: () => Promise<unknown> | void,
    secondary = false,
  ) => (
    <Pressable
      key={label}
      accessibilityRole="button"
      accessibilityLabel={label}
      disabled={busy || loading}
      onPress={() =>
        void run(async () => {
          await action();
        })
      }
      style={[
        s.button,
        secondary && s.secondary,
        (busy || loading) && s.disabled,
      ]}
    >
      <Text style={[s.buttonText, secondary && s.secondaryText]}>{label}</Text>
    </Pressable>
  );
  const save = async (next: string) => {
    if (!id) return;
    await backend.saveIntake(id, { details, tier });
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
    if (result.canceled) return;
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
  };
  const documents = (
    <View style={s.card}>
      <Text style={s.title}>Uploaded Documents</Text>
      {!record?.documents?.length && (
        <Text style={s.text}>0 Documents Uploaded</Text>
      )}
      {record?.documents?.map((d) => (
        <View key={d.id} style={s.row}>
          <Text style={s.text}>
            {d.filename} · {d.page_count} page(s)
          </Text>
          {button(
            "View " + d.filename,
            async () => {
              await Linking.openURL((await backend.documentUrl(d.id)).url);
            },
            true,
          )}
          {record.status === "draft" &&
            button(
              "Remove " + d.filename,
              async () => {
                await backend.deleteDocument(d.id);
                await load();
              },
              true,
            )}
        </View>
      ))}
    </View>
  );
  const draftView = (
    <View>
      {latest &&
        fields.map((key, i) => (
          <View style={s.card} key={key}>
            <Text style={s.title}>
              {i + 1}. {ADV_NOTICE_DRAFT.sections[i].title}
            </Text>
            <Text selectable style={s.text}>
              {latest.content[key]}
            </Text>
          </View>
        ))}
    </View>
  );
  let body: React.ReactNode;
  if (stage === "detail")
    body = (
      <>
        <Text style={s.title}>Send a Legal Notice</Text>
        {(["ordinary", "urgent"] as const).map((t) => {
          const price = pricing.find((p) => p.tier === t && p.variant === null);
          return (
            <Pressable
              key={t}
              accessibilityRole="radio"
              accessibilityLabel={t === "urgent" ? "Urgent" : "Ordinary"}
              accessibilityState={{ selected: tier === t }}
              onPress={() => setTier(t)}
              style={[s.card, tier === t && s.selected]}
            >
              <Text style={s.title}>
                {t === "urgent" ? "Urgent" : "Ordinary"}
              </Text>
              {price && (
                <Text style={s.text}>
                  ₹
                  {(
                    (BigInt(price.base_amount_paise) + 50n) /
                    100n
                  ).toLocaleString("en-IN")}
                </Text>
              )}
            </Pressable>
          );
        })}
        {button("Send a Legal Notice", async () => {
          const c = await backend.createCase({
            service_code: "legal_notice",
            tier,
          });
          go("/legal-notice/step1", c.id);
        })}
        {button("My Cases", () => router.push("/(tabs)/cases"), true)}
      </>
    );
  else if (stage === "list")
    body = (
      <>
        <Text style={s.title}>{advocate ? "My Matters" : "My Cases"}</Text>
        {items.map((c) => (
          <Pressable
            key={c.id}
            accessibilityRole="button"
            accessibilityLabel={c.reference}
            style={s.card}
            onPress={() => {
              const path = advocate
                ? `/advocate/notice/${c.id}/${c.status === "assigned" ? "documents" : "review"}`
                : c.status === "draft"
                  ? "/legal-notice/step1"
                  : c.status === "payment_pending"
                    ? "/legal-notice/step6"
                    : "/legal-notice/tracking";
              go(path, c.id);
            }}
          >
            <Text style={s.title}>{c.reference}</Text>
            <Text style={s.text}>
              {c.details.client?.fullName} · {c.details.noticee?.fullName}
            </Text>
            <Text style={s.text}>
              {labels[c.status]} · {bucketFor(c.status)}
            </Text>
          </Pressable>
        ))}
        {!items.length && !loading && <Text style={s.text}>No cases</Text>}
        {!advocate &&
          button("Send a Legal Notice", () => go("/legal-notice/detail"))}
      </>
    );
  else if (stage === "step1" || stage === "step2") {
    const who = stage === "step1" ? "client" : "noticee";
    const value = details[who] ?? {};
    body = (
      <>
        <Text style={s.title}>
          {who === "client"
            ? "Please Provide your details!"
            : "Please Provide Noticee Details"}
        </Text>
        {(
          [
            { key: "fullName", label: "Full Name", icon: User },
            { key: "mobile", label: "Mobile Number", icon: Users },
            { key: "email", label: "Email Address", icon: Mail },
            { key: "address", label: "Full Address", icon: MapPin },
          ] as const
        ).map((f) => (
          <FlatField
            key={f.key}
            icon={f.icon}
            label={f.label}
            required={f.key !== "email" || who === "noticee"}
            value={value[f.key] ?? ""}
            editable={!busy && record?.status === "draft"}
            multiline={f.key === "address"}
            keyboardType={
              f.key === "mobile"
                ? "phone-pad"
                : f.key === "email"
                  ? "email-address"
                  : "default"
            }
            autoCapitalize={f.key === "email" ? "none" : "sentences"}
            onChangeText={(text) => {
              dirty.current = true;
              setDetails((d) => ({
                ...d,
                [who]: { ...d[who], [f.key]: text },
              }));
            }}
          />
        ))}
        {who === "noticee" && (
          <FlatField
            icon={Users}
            label="Relationship"
            value={details.noticee?.relationship ?? ""}
            onChangeText={(text) => {
              dirty.current = true;
              setDetails((d) => ({
                ...d,
                noticee: { ...d.noticee, relationship: text },
              }));
            }}
          />
        )}
        {button("Continue", () =>
          save(
            who === "client" ? "/legal-notice/step2" : "/legal-notice/step3",
          ),
        )}
      </>
    );
  } else if (stage === "step3")
    body = (
      <>
        <Text style={s.title}>Quick Actions</Text>
        {issues.map(([key, label]) => (
          <Pressable
            accessibilityRole="radio"
            accessibilityState={{ selected: details.issueType === key }}
            key={key}
            onPress={() => {
              dirty.current = true;
              setDetails((d) => ({ ...d, issueType: key }));
            }}
            style={[s.card, details.issueType === key && s.selected]}
          >
            <Text style={s.text}>{label}</Text>
          </Pressable>
        ))}
        {button("Continue", () => save("/legal-notice/step4"))}
      </>
    );
  else if (stage === "upload")
    body = (
      <>
        <Text style={s.title}>Upload Supporting Documents</Text>
        {button("Property Papers", () => upload("property_papers"))}
        {button("Agreement", () => upload("agreement"))}
        {button("Screenshots", () => upload("screenshot"))}
        <Text style={s.text}>{ID_PROOF_NOTICE}</Text>
        {button("ID Proof", () => upload("id_proof"))}
        {button("Add More Documents", () => upload("evidence"))}
        {documents}
        {button("Continue", () => go("/legal-notice/step5"))}
      </>
    );
  else if (stage === "summary")
    body = (
      <>
        <Text style={s.title}>Preview Your Case Summary</Text>
        <View style={s.card}>
          <Text style={s.text}>{details.client?.fullName}</Text>
          <Text style={s.text}>{details.noticee?.fullName}</Text>
          <Text style={s.text}>{details.noticee?.address}</Text>
          <Text style={s.text}>
            {issues.find((i) => i[0] === details.issueType)?.[1]}
          </Text>
        </View>
        {documents}
        {button("Submit & Proceed to Pay", async () => {
          if (id) {
            await backend.submit(id);
            go("/legal-notice/step6");
          }
        })}
      </>
    );
  else if (stage === "payment")
    body = (
      <>
        <Text style={s.title}>Complete Payment</Text>
        <Text style={s.text}>
          {labels[record?.status ?? "payment_pending"]}
        </Text>
        <Text style={s.text}>Development only — no money is charged.</Text>
        {record?.status === "payment_pending"
          ? button("Pay", async () => {
              await backend.devPay(id!);
              go("/legal-notice/tracking");
            })
          : button("Continue", () => go("/legal-notice/tracking"))}
      </>
    );
  else if (stage === "draft")
    body = (
      <>
        <Text style={s.title}>{ADV_NOTICE_DRAFT.title}</Text>
        {record?.status === "in_progress" ||
        record?.status === "advocate_accepted" ||
        record?.status === "changes_requested" ? (
          <>
            {record.reviews
              ?.filter((r) => r.decision === "changes_requested")
              .map((r) => (
                <Text key={r.id} style={s.text}>
                  {r.comment}
                </Text>
              ))}
            {fields.map((key, i) => (
              <View key={key} style={s.card}>
                <Text style={s.title}>
                  {i + 1}. {ADV_NOTICE_DRAFT.sections[i].title}
                </Text>
                <TextInput
                  accessibilityLabel={ADV_NOTICE_DRAFT.sections[i].title}
                  multiline
                  value={content[key]}
                  editable={!busy}
                  onChangeText={(v) => {
                    dirty.current = true;
                    setContent((c) => ({ ...c, [key]: v }));
                  }}
                  style={s.editor}
                />
              </View>
            ))}
            {button("Save Draft", async () => {
              await backend.saveDraft(id!, content);
              dirty.current = false;
              go(advocatePath("send"));
            })}
          </>
        ) : (
          draftView
        )}
      </>
    );
  else
    body = (
      <>
        <Text style={s.title}>{labels[record?.status ?? "draft"]}</Text>
        <View style={s.card}>
          <Text style={s.text}>{record?.details.client?.fullName}</Text>
          <Text style={s.text}>{record?.details.noticee?.fullName}</Text>
        </View>
        {advocate && record?.status === "assigned" && (
          <>
            {button("Accept", async () => {
              await backend.accept(id!);
              go(advocatePath("draft"));
            })}
            <TextInput
              accessibilityLabel="Reason"
              value={comment}
              onChangeText={setComment}
              style={s.editor}
            />
            {button(
              "Decline",
              async () => {
                await backend.decline(id!, comment);
                await load();
              },
              true,
            )}
          </>
        )}
        {advocate &&
          ["advocate_accepted", "in_progress", "changes_requested"].includes(
            record?.status ?? "",
          ) &&
          button("Draft Legal Notice", () => go(advocatePath("draft")))}
        {record?.reviews?.map((r) => (
          <View key={r.id} style={s.card}>
            <Text style={s.title}>
              {r.decision === "changes_requested"
                ? "Changes Requested"
                : "Approved"}
            </Text>
            {r.comment && <Text style={s.text}>{r.comment}</Text>}
          </View>
        ))}
        {!advocate && stage === "tracking" ? null : draftView}
        {advocate &&
          record?.status === "in_progress" &&
          latest &&
          button("Send to Client for Review", async () => {
            await backend.sendDraft(id!, latest.id);
            go(advocatePath("review"));
          })}
        {!advocate &&
          record?.status === "client_review" &&
          stage === "tracking" &&
          button("Review & Approve Draft", () =>
            go("/legal-notice/request-submitted"),
          )}
        {!advocate &&
          record?.status === "client_review" &&
          stage !== "tracking" &&
          latest && (
            <>
              {button("Approve Draft", async () => {
                await backend.approve(id!, latest.id);
                go("/legal-notice/delivery");
              })}
              {stage === "changes" ? (
                <>
                  <TextInput
                    accessibilityLabel="Requested changes"
                    multiline
                    value={comment}
                    onChangeText={setComment}
                    style={s.editor}
                  />
                  {button("Submit Changes", async () => {
                    await backend.requestChanges(id!, latest.id, comment);
                    go("/legal-notice/tracking");
                  })}
                </>
              ) : (
                button(
                  "Request Changes",
                  () => go("/legal-notice/request-changes"),
                  true,
                )
              )}
            </>
          )}
        {advocate && record?.status === "approved" && (
          <>
            {stage === "dispatch" ? (
              <>
                <TextInput
                  accessibilityLabel="Carrier"
                  placeholder="Carrier"
                  value={carrier}
                  onChangeText={setCarrier}
                  style={s.editor}
                />
                <TextInput
                  accessibilityLabel="Waybill"
                  placeholder="Waybill"
                  value={waybill}
                  onChangeText={setWaybill}
                  style={s.editor}
                />
                {button("Mark Dispatched", async () => {
                  await backend.dispatch(id!, carrier, waybill);
                  go(advocatePath("tracking"));
                })}
              </>
            ) : stage === "final" ? (
              button("Dispatch", () => go(advocatePath("dispatch")))
            ) : (
              button("View Final Notice", () => go(advocatePath("final")))
            )}
          </>
        )}
        {record?.shipments?.map((shipment, i) => (
          <View key={i} style={s.card}>
            <Text style={s.title}>{shipment.carrier}</Text>
            <Text style={s.text}>{shipment.waybill}</Text>
            <Text style={s.text}>{shipment.status}</Text>
          </View>
        ))}
        {!advocate &&
          record?.status === "dispatched" &&
          stage !== "delivery" &&
          button("Track Delivery", () => go("/legal-notice/delivery"))}
        {!advocate &&
          record?.status === "completed" &&
          stage !== "delivered" &&
          button("Delivery Confirmed", () => go("/legal-notice/delivered"))}
        {documents}
        <View style={s.card}>
          <Text style={s.title}>Timeline</Text>
          {record?.events?.map((e) => (
            <View key={e.id} style={s.row}>
              <Text style={s.text}>
                {e.type === "draft_saved"
                  ? "Draft saved"
                  : e.to_status
                    ? labels[e.to_status]
                    : e.type}
              </Text>
              <Text style={s.text}>
                {new Date(e.created_at).toLocaleString()} · {e.actor_role}
              </Text>
            </View>
          ))}
        </View>
        {button(
          advocate ? "My Matters" : "My Cases",
          () => router.push((advocate ? "/matters" : "/(tabs)/cases") as Href),
          true,
        )}
      </>
    );
  const children = (
    <View style={s.content}>
      {record && (
        <Text selectable style={s.reference}>
          {record.reference}
        </Text>
      )}
      {loading && (
        <ActivityIndicator accessibilityLabel="Loading" color={colors.brand} />
      )}
      {!!error && (
        <View accessibilityRole="alert" style={s.error}>
          <Text style={s.text}>{error}</Text>
          <Pressable
            accessibilityRole="button"
            onPress={() => (authRequired ? signOut() : void run(load))}
          >
            <Text style={s.title}>{authRequired ? "Sign in" : "Retry"}</Text>
          </Pressable>
        </View>
      )}
      {busy && (
        <ActivityIndicator accessibilityLabel="Saving" color={colors.brand} />
      )}
      {body}
    </View>
  );
  const step = stepFor[stage];
  if (step)
    return (
      <WizardShell
        step={step}
        align="top"
        hideButton
        buttonLabel=""
        onContinue={() => {}}
      >
        {children}
      </WizardShell>
    );
  return (
    <View style={s.screen}>
      <ServiceHeader title="Legal Notice" />
      <ScrollView
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={s.scroll}
      >
        {children}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.appBg },
  scroll: { paddingBottom: 40 },
  content: { padding: 16, gap: 16 },
  card: {
    padding: draftTokens.cardPad,
    borderRadius: draftTokens.cardRadius,
    backgroundColor: colors.card,
    gap: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { borderColor: colors.brand, borderWidth: 2 },
  title: {
    fontFamily: font.appHeading,
    fontSize: 18,
    color: colors.textPrimary,
  },
  text: {
    fontFamily: font.appBody,
    fontSize: 14,
    lineHeight: 21,
    color: colors.textBody,
  },
  reference: {
    fontFamily: font.appHeading,
    fontSize: 16,
    color: colors.brandDark,
  },
  editor: {
    fontFamily: font.appBody,
    fontSize: 14,
    lineHeight: 21,
    minHeight: 80,
    borderWidth: 1,
    borderColor: draftTokens.bodyBorder,
    borderRadius: draftTokens.bodyRadius,
    padding: draftTokens.bodyPad,
    backgroundColor: wizardField.bg,
    textAlignVertical: "top",
  },
  row: { gap: 8, paddingVertical: 8 },
  button: {
    backgroundColor: colors.brand,
    borderRadius: 12,
    padding: 16,
    alignItems: "center",
  },
  buttonText: { fontFamily: font.appHeading, fontSize: 16, color: "#fff" },
  secondary: {
    backgroundColor: colors.card,
    borderColor: colors.border,
    borderWidth: 1,
  },
  secondaryText: { color: colors.brandDark },
  disabled: { opacity: 0.5 },
  error: {
    padding: 14,
    gap: 12,
    borderWidth: 1,
    borderColor: "#b42318",
    borderRadius: 12,
  },
});
