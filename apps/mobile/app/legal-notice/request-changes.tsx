import { useTrackingModel } from "../../features/legal-notice/useTrackingModel";
import type { NoticeTrackingData } from "./tracking";
import { router } from "expo-router";
import { useState } from "react";
import { ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import {
  NoticeHeader,
  NoticeButton,
} from "../../components/NoticeDeliveryScreen";
import { noticeDelivery as t } from "../../constants/tokens/noticeDelivery";
import { font } from "../../constants/theme";
import { INVOICE, TRACKING, tierFor } from "../../data/legalNotice";
import { formatDate } from "../../data/cases";
import { useLegalNotice } from "../../context/legalNotice";
// design/438 — request changes, not a second approval step.
export function RequestChangesView({ form, invoice, tracking, onSubmit }: {
  form: ReturnType<typeof useLegalNotice>['form']; invoice: typeof INVOICE;
  tracking: NoticeTrackingData["tracking"]; onSubmit: (comment: string) => void;
}) {
  const INVOICE = invoice, TRACKING = tracking;
  const [message, setMessage] = useState("");
  const tier = tierFor(form.tier);
  return (
    <View style={s.screen}>
      <NoticeHeader title="Legal Notice Tracking" />
      <ScrollView
        contentContainerStyle={s.content}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={s.id}>REQUEST ID #{INVOICE.requestId}</Text>
        <View style={s.summary}>
          <Text style={s.label}>● Awaiting Your Approval {tier.tierLabel}</Text>
          <Text style={s.title}>Your Legal Notice Draft is Ready</Text>
          <Text style={s.body}>
            Your advocate has prepared the legal notice. Please review the draft
            carefully before approving it for dispatch.
          </Text>
        </View>
        <View style={s.row}>
          <Text style={s.label}>NOTICE DETAILS</Text>
          {Boolean(TRACKING.ref) && <Text style={s.label}>Ref: {TRACKING.ref}</Text>}
        </View>
        <View style={s.card}>
          {[
            ["Notice Type", TRACKING.noticeType],
            ["Service", `${tier.label}  ${tier.trackingSpeed}`],
            ["Submitted On", TRACKING.submittedOn ? formatDate(TRACKING.submittedOn) : ''],
            ["Current Status", "● Awaiting Your Approval"],
          ].map(([a, b]) => (
            <View key={a} style={s.detail}>
              <Text style={s.body}>{a}</Text>
              <Text style={s.value}>{b}</Text>
            </View>
          ))}
        </View>
        <Text style={s.title}>Your Decision</Text>
        <TextInput
          value={message}
          onChangeText={setMessage}
          multiline
          accessibilityLabel="Describe what you would like to change"
          placeholder="Describe what you would like to change"
          style={s.input}
        />
        <NoticeButton
          onPress={() => {
            if (message.trim())
              onSubmit(message.trim());
          }}
        >
          Request Changes
        </NoticeButton>
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  content: { padding: t.pad, gap: t.decisionGap },
  id: {
    alignSelf: "flex-start",
    fontFamily: font.appSemi,
    fontSize: t.small,
    padding: t.rowGap,
    borderRadius: t.idRadius,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.card,
  },
  summary: {
    padding: t.summaryPad,
    gap: t.summaryGap,
    borderRadius: t.radius,
    borderWidth: 1,
    borderColor: t.border,
    backgroundColor: t.summaryBg,
  },
  title: {
    fontFamily: font.appHeading,
    fontSize: t.decisionTitle,
    color: t.ink,
  },
  body: {
    fontFamily: font.appBody,
    fontSize: t.body,
    lineHeight: t.line,
    color: t.muted,
  },
  label: { fontFamily: font.appSemi, fontSize: t.label, color: t.brand },
  row: { flexDirection: "row", justifyContent: "space-between" },
  card: {
    padding: t.panelPad,
    borderRadius: t.radius,
    backgroundColor: t.card,
    gap: t.panelGap,
  },
  detail: {
    minHeight: t.detailRowH,
    padding: t.rowGap,
    backgroundColor: t.bg,
    borderRadius: t.detailRadius,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.detailGap,
  },
  value: {
    fontFamily: font.appSemi,
    fontSize: t.small,
    color: t.ink,
    flexShrink: 1,
  },
  input: {
    height: t.decisionAreaH,
    borderWidth: 1,
    borderColor: t.action,
    borderRadius: t.pad,
    padding: t.panelPad,
    fontFamily: font.appBody,
    fontSize: t.body,
    textAlignVertical: "top",
    color: t.ink,
  },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function RequestChanges() {
  const model = useTrackingModel();
  return <RequestChangesView form={model.form} invoice={model.data.invoice} tracking={model.data.tracking} onSubmit={model.requestChanges} />;
}
