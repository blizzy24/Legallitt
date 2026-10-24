import { router, type Href } from "expo-router";
import {
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Check,
  Clock,
  Copy,
  Download,
  Eye,
  FileText,
  FolderOpen,
  MapPin,
  Phone,
  ShieldCheck,
  Truck,
  UserRound,
} from "lucide-react-native";
import {
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { ReactNode } from "react";
import { font } from "../constants/theme";
import { noticeDelivery as t } from "../constants/tokens/noticeDelivery";
import { NOTICE_DELIVERY as d } from "../data/noticeDelivery";
import { clientDocHref } from "../data/docLinks";
import { useDemoWait } from "../hooks/useDemoAdvance";
function CopyWaybill({ waybill }: { waybill: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Copy waybill"
      onPress={() => {
        if (typeof navigator !== "undefined")
          void navigator.clipboard?.writeText(waybill);
      }}
      style={s.tile}
    >
      <Copy size={t.discIcon} color={t.brand} />
    </Pressable>
  );
}
export function NoticeHeader({ title }: { title: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={() =>
          router.canGoBack()
            ? router.back()
            : router.replace("/legal-notice/tracking")
        }
      >
        <ArrowLeft color={t.ink} size={t.headerIcon} />
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
      <Bell size={t.headerIcon} color={t.brand} />
      <View
        style={[s.tile, { backgroundColor: t.brand, borderRadius: t.disc }]}
      >
        <UserRound color="white" size={t.discIcon} />
      </View>
    </View>
  );
}
export function NoticeButton({
  children,
  onPress,
  secondary = false,
}: {
  children: ReactNode;
  onPress: () => void;
  secondary?: boolean;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={[s.button, secondary && s.secondary]}
    >
      <Text style={[s.buttonText, secondary && { color: t.ink }]}>
        {children}
      </Text>
    </Pressable>
  );
}
function Card({ children }: { children: ReactNode }) {
  return <View style={s.card}>{children}</View>;
}
function Label({ children }: { children: ReactNode }) {
  return <Text style={s.label}>{children}</Text>;
}
function Title({
  children,
  small = false,
}: {
  children: ReactNode;
  small?: boolean;
}) {
  return (
    <Text style={[s.title, small && { fontSize: t.deliveredCardTitle }]}>
      {children}
    </Text>
  );
}
function Body({
  children,
  large = false,
}: {
  children: ReactNode;
  large?: boolean;
}) {
  return (
    <Text style={[s.body, large && { fontSize: t.deliveredBody }]}>
      {children}
    </Text>
  );
}
function Pill({
  children,
  green = false,
}: {
  children: ReactNode;
  green?: boolean;
}) {
  return (
    <Text
      style={[s.pill, green && { backgroundColor: t.mint, color: t.green }]}
    >
      {children}
    </Text>
  );
}
export default function NoticeDeliveryScreen({
  delivered = false,
  data = d,
  allowDemoAdvance = true,
  onViewNotice,
  onViewProof,
}: {
  delivered?: boolean;
  data?: typeof d;
  allowDemoAdvance?: boolean;
  onViewNotice?: () => void;
  onViewProof?: () => void;
}) {
  const d = data;
  const viewNotice = onViewNotice ?? (() => router.push(clientDocHref(d.file) as Href));
  const viewProof = onViewProof ?? (() => router.push('/legal-notice/delivery-proof'));
  const insets = useSafeAreaInsets();
  useDemoWait(allowDemoAdvance && !delivered);
  return (
    <View style={s.screen}>
      <NoticeHeader
        title={delivered ? "Notice Delivered" : "Notice Delivery"}
      />
      <ScrollView
        contentContainerStyle={[
          s.content,
          { paddingBottom: insets.bottom + t.pad },
        ]}
      >
        {delivered ? (
          <>
            <View style={s.hero}>
              <View style={s.halo}>
                <View style={s.check}>
                  <Check color="white" size={t.discIcon} />
                </View>
              </View>
              <Pill>BLUE DART CONFIRMED</Pill>
              <Text style={s.heroTitle}>Notice Delivered</Text>
              <Text
                style={[
                  s.body,
                  s.center,
                  {
                    fontSize: t.deliveredBody,
                    marginTop: t.deliveredBodyAdjust,
                  },
                ]}
              >
                The legal notice was delivered to the noticee's address.
              </Text>
            </View>
            <Card>
              <View style={s.row}>
                <Label>DELIVERY DETAILS</Label>
                <Pill green>● Handover Complete</Pill>
              </View>
              <View style={s.row}>
                <Truck color={t.brand} />
                <View style={s.flex}>
                  <Title small>{d.courier}</Title>
                  <Body large>Waybill: {d.waybill}</Body>
                </View>
                <CopyWaybill waybill={d.waybill} />
              </View>
              <View style={[s.panel, s.row]}>
                <View style={s.flex}>
                  <Body large>Delivered On</Body>
                  <Title small>26 Oct 2024</Title>
                </View>
                <View style={s.flex}>
                  <Body large>Delivered At</Body>
                  <Title small>02:45 PM</Title>
                </View>
              </View>
              <Body large>Received By</Body>
              <View style={s.row}>
                <Text style={[s.strong, s.flex, { fontSize: t.deliveredBody }]}>
                  {d.recipient}
                </Text>
                <Pill>Signature On File</Pill>
              </View>
              <Body large>Delivery Address</Body>
              <Text style={[s.body, { fontSize: t.deliveredBody }]}>
                {d.address}
              </Text>
            </Card>
            <Card>
              <View style={s.row}>
                <Label>DELIVERY PROOF</Label>
                <Pill green>Available</Pill>
              </View>
              <View style={s.row}>
                <Image
                  source={require("../assets/notice-delivery-proof.png")}
                  style={s.proof}
                />
                <View style={s.flex}>
                  <Title small>Signed Proof of Delivery (POD)</Title>
                  <Body large>
                    Physical slip signed by recipient at the time of delivery.
                  </Body>
                </View>
              </View>
              <View style={s.row}>
                <View style={s.flex}>
                  <NoticeButton secondary onPress={viewProof}>
                    View Proof
                  </NoticeButton>
                </View>
                <View style={s.flex}>
                  <NoticeButton secondary onPress={viewProof}>
                    Download
                  </NoticeButton>
                </View>
              </View>
            </Card>
            <Card>
              <Label>YOUR LEGAL NOTICE</Label>
              <View style={[s.panel, s.row]}>
                <FileText color={t.pdf} />
                <View style={s.flex}>
                  <Text style={s.strong}>{d.file}</Text>
                  <Body large>Signed Copy · 4 Pages</Body>
                </View>
                <Pressable accessibilityRole="button" onPress={viewNotice}>
                  <Text style={s.pill}>View Notice</Text>
                </Pressable>
              </View>
            </Card>
            <Card>
              <View style={s.row}>
                <Title small>Case Status</Title>
                <Pill>{d.case}</Pill>
              </View>
              <View style={[s.panel, s.row]}>
                <Text style={[s.strong, s.flex, { fontSize: t.deliveredBody }]}>
                  Notice Delivery
                </Text>
                <Text style={[s.strong, { color: t.green }]}>✓ Completed</Text>
              </View>
              <View style={[s.panel, { backgroundColor: t.peach }]}>
                <Body large>
                  ⓘ Important Note: Courier delivery confirms physical delivery
                  of the envelope. Final legal standing depends on court rules
                  and statutory procedures.
                </Body>
              </View>
            </Card>
            <NoticeButton onPress={() => router.push("/(tabs)/cases")}>
              View Case →
            </NoticeButton>
          </>
        ) : (
          <>
            <Card>
              <View style={s.row}>
                <Text style={[s.label, { color: t.green }]}>● IN TRANSIT</Text>
                <Pill>◷ In 1–2 days</Pill>
              </View>
              <Title>Physical Notice on the Way</Title>
              <Body>
                Your official recovery notice is dispatched via priority legal
                courier.
              </Body>
              <View style={[s.panel, s.row]}>
                <Truck color={t.brand} />
                <View style={s.flex}>
                  <Text style={s.strong}>{d.courier}</Text>
                  <Body>{d.waybill}</Body>
                </View>
                <CopyWaybill waybill={d.waybill} />
              </View>
            </Card>
            <Card>
              <View style={s.row}>
                <Label>NOTICE RECIPIENT</Label>
                <Pill>{d.case}</Pill>
              </View>
              <Title>Legal Notice for Recovery</Title>
              <Text style={s.strong}>{d.recipient}</Text>
              <View style={s.panel}>
                <View style={s.row}>
                  <MapPin size={t.discIcon} color={t.brand} />
                  <Text style={[s.body, s.flex]}>{d.address}</Text>
                </View>
                <View style={s.row}>
                  <Phone size={t.discIcon} color={t.brand} />
                  <Body>{d.phone}</Body>
                </View>
              </View>
            </Card>
            <Card>
              <Label>● LATEST COURIER UPDATE</Label>
              <Text style={s.strong}>
                Package processed at Sorting Hub. Moving towards Rohini delivery
                center.
              </Text>
              <View style={s.row}>
                <Body>⌖ Delhi Central Hub</Body>
                <Body>Today, 26 Oct · 04:15 PM</Body>
              </View>
            </Card>
            <View style={s.envelopeCard}>
              <Image
                source={require("../assets/notice-envelope.png")}
                style={s.envelope}
              />
              <View style={[s.panel, s.row]}>
                <FileText color={t.pdf} />
                <View style={s.flex}>
                  <Text style={s.strong}>{d.file}</Text>
                  <Body>Signed copy · 4 Pages</Body>
                </View>
                <Pressable accessibilityRole="button" onPress={viewNotice}>
                  <Text style={s.pill}>Preview</Text>
                </Pressable>
              </View>
            </View>
            <Card>
              <View style={s.row}>
                <Title>Delivery Progress</Title>
                <Pill green>● Live Updates</Pill>
              </View>
              <View>
                {d.progress.map(([title, sub], i) => (
                  <View key={title} style={s.timeline}>
                    <View style={s.rail}>
                      {i < 7 && (
                        <View
                          style={[
                            s.line,
                            { backgroundColor: i < 5 ? t.green : t.border },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          s.dot,
                          {
                            backgroundColor:
                              i < 5 ? t.green : i === 5 ? t.brand : t.border,
                          },
                        ]}
                      >
                        {i < 5 ? (
                          <Check color="white" size={t.checkIcon} />
                        ) : (
                          <Text style={{ color: "white" }}>●</Text>
                        )}
                      </View>
                    </View>
                    <View style={[s.step, i === 5 && s.active]}>
                      <Text style={[s.strong, i > 5 && { opacity: 0.5 }]}>
                        {title}
                        {i === 5 ? "  ACTIVE" : ""}
                      </Text>
                      <Body>{sub}</Body>
                    </View>
                  </View>
                ))}
              </View>
            </Card>
            <View style={s.panel}>
              <Title>Statutory Evidence Guarantee</Title>
              <Body>
                Once delivered, a digitally stamped certificate of service with
                physical recipient sign-off will automatically appear in your
                case file.
              </Body>
            </View>
            <NoticeButton onPress={viewNotice}>
              View Notice Document →
            </NoticeButton>
            <NoticeButton
              secondary
              onPress={() => router.push("/(tabs)/cases")}
            >
              View Case Details
            </NoticeButton>
          </>
        )}
      </ScrollView>
    </View>
  );
}
const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: t.bg },
  header: {
    minHeight: t.headerH,
    paddingHorizontal: t.pad,
    flexDirection: "row",
    alignItems: "center",
    gap: t.gap,
  },
  headerTitle: {
    flex: 1,
    fontFamily: font.appHeading,
    fontSize: t.title,
    color: t.ink,
  },
  content: { padding: t.pad, gap: t.gap },
  card: {
    backgroundColor: t.card,
    borderRadius: t.radius,
    padding: t.cardPad,
    gap: t.gap,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: t.rowGap,
  },
  flex: { flex: 1, minWidth: 0 },
  title: { fontFamily: font.appHeading, fontSize: t.cardTitle, color: t.ink },
  body: {
    fontFamily: font.appBody,
    fontSize: t.body,
    lineHeight: t.line,
    color: t.muted,
  },
  strong: {
    fontFamily: font.appSemi,
    fontSize: t.body,
    lineHeight: t.line,
    color: t.ink,
  },
  label: {
    fontFamily: font.appSemi,
    fontSize: t.label,
    color: t.muted,
    letterSpacing: t.labelSpacing,
  },
  panel: { padding: t.panelPad, backgroundColor: t.panel, borderRadius: t.panelRadius, gap: t.panelGap },
  pill: {
    fontFamily: font.appSemi,
    fontSize: t.small,
    color: t.brand,
    backgroundColor: t.peach,
    borderRadius: t.panelRadius,
    paddingHorizontal: t.pillPadX,
    paddingVertical: t.pillPadY,
    overflow: "hidden",
  },
  tile: {
    width: t.disc,
    height: t.disc,
    borderRadius: t.panelRadius,
    backgroundColor: t.panel,
    alignItems: "center",
    justifyContent: "center",
  },
  button: {
    minHeight: t.buttonH,
    borderRadius: t.buttonRadius,
    backgroundColor: t.brand,
    alignItems: "center",
    justifyContent: "center",
    padding: t.panelPad,
  },
  secondary: { backgroundColor: t.panel },
  buttonText: {
    fontFamily: font.appSemi,
    fontSize: t.buttonSize,
    color: "white",
    textAlign: "center",
  },
  envelopeCard: {
    overflow: "hidden",
    borderRadius: t.radius,
    backgroundColor: t.panel,
  },
  envelope: { width: "100%", height: t.envelopeH },
  timeline: { flexDirection: "row", minHeight: t.timelinePitch },
  rail: { width: t.timelineDot, alignItems: "center" },
  line: { position: "absolute", width: t.lineWidth, top: t.timelineDot / 2, bottom: -t.timelineDot / 2 },
  dot: {
    width: t.timelineDot,
    height: t.timelineDot,
    borderRadius: t.timelineDot / 2,
    alignItems: "center",
    justifyContent: "center",
  },
  step: { flex: 1, marginLeft: t.timelineGap, paddingBottom: t.gap },
  active: {
    backgroundColor: t.peach,
    borderRadius: t.panelRadius,
    padding: t.rowGap,
    marginTop: -t.panelGap,
    marginBottom: t.panelPad,
  },
  hero: {
    alignItems: "center",
    gap: t.gap,
    paddingTop: t.heroTop,
    paddingBottom: t.heroBottom,
  },
  halo: {
    width: t.heroDisc,
    height: t.heroDisc,
    borderRadius: t.heroDisc / 2,
    backgroundColor: t.mint,
    alignItems: "center",
    justifyContent: "center",
  },
  check: {
    width: t.checkDisc,
    height: t.checkDisc,
    borderRadius: t.checkDisc / 2,
    borderWidth: t.checkBorder,
    borderColor: "white",
    backgroundColor: t.checkGreen,
    alignItems: "center",
    justifyContent: "center",
  },
  heroTitle: {
    fontFamily: font.appHeading,
    fontSize: t.deliveredTitle,
    marginTop: t.deliveredHeadingAdjust,
    color: t.ink,
  },
  center: { textAlign: "center" },
  proof: { width: t.proofW, height: t.proofH, borderRadius: t.panelGap },
});
