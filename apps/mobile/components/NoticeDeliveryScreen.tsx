import NotificationBell from './NotificationBell';
import type { LegalNoticeMatterType } from "@legalitt/shared";
import { noticeMatter } from "../data/legalNoticeMatter";
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
  type ImageSourcePropType,
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
import { instructedCopy } from "../copy/instructed";
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
export function NoticeHeader({ title, onBack }: { title: string; onBack?: () => void }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[s.header, { paddingTop: insets.top }]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Back"
        onPress={onBack ?? (() =>
          router.canGoBack()
            ? router.back()
            : router.replace("/legal-notice/tracking"))
        }
      >
        <ArrowLeft color={t.ink} size={t.headerIcon} />
      </Pressable>
      <Text style={s.headerTitle}>{title}</Text>
      <NotificationBell size={t.headerIcon} color={t.brand}/>
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
  // An absent fact takes its pill with it.
  if (children === '' || children === null || children === undefined) return null;
  return (
    <Text
      style={[s.pill, green && { backgroundColor: t.mint, color: t.green }]}
    >
      {children}
    </Text>
  );
}
export type NoticeDeliveryFacts = {
  confirmation: string; deliveredOn: string; deliveredAt: string; receivedBy: string;
  proof: ImageSourcePropType | null; proofStatus: string; signatureStatus: string;
  fileMeta: string; estimate: string; latestUpdate: string; latestPlace: string; latestTime: string;
  progressStep: number; completedSteps: number[];
  /** The notice has left the advocate and is not yet delivered. */
  inTransit: boolean;
};
const fixtureFacts: NoticeDeliveryFacts = {
  confirmation:'BLUE DART CONFIRMED', deliveredOn:'26 Oct 2024', deliveredAt:'02:45 PM', receivedBy:d.recipient,
  proof:require('../assets/notice-delivery-proof.png'), proofStatus:'Available', signatureStatus:'Signature On File',
  fileMeta:'Signed Copy · 4 Pages', estimate:'◷ In 1–2 days',
  latestUpdate:'Package processed at Sorting Hub. Moving towards Rohini delivery center.',
  latestPlace:'⌖ Delhi Central Hub', latestTime:'Today, 26 Oct · 04:15 PM',
  progressStep:5, completedSteps:[0,1,2,3,4], inTransit:true,
};
export default function NoticeDeliveryScreen({
  matterType = null,
  delivered = false,
  data = d,
  facts = fixtureFacts,
  allowDemoAdvance = true,
  onViewNotice,
  onViewProof,
  onBack,
  onDeliveryConfirmation,
  onViewCase,
}: {
  matterType?: LegalNoticeMatterType | null;
  delivered?: boolean;
  data?: typeof d;
  facts?: NoticeDeliveryFacts;
  allowDemoAdvance?: boolean;
  onViewNotice?: () => void;
  onViewProof?: () => void;
  onBack?: () => void;
  /** Set once the shipment is delivered: the route to design 441 replaces the guarantee block (instructed, §9.2). */
  onDeliveryConfirmation?: () => void;
  /** View Case (441) and View Case Details (440): this case's tracking screen. */
  onViewCase?: () => void;
}) {
  const viewCase = onViewCase ?? (() => router.push("/(tabs)/cases"));
  const d = data;
  const matter = noticeMatter(matterType);
  const viewNotice = onViewNotice ?? (() => router.push(clientDocHref(d.file) as Href));
  const viewProof = onViewProof ?? (() => router.push('/legal-notice/delivery-proof'));
  const insets = useSafeAreaInsets();
  useDemoWait(allowDemoAdvance && !delivered);
  return (
    <View style={s.screen}>
      <NoticeHeader
        onBack={onBack}
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
              <Pill>{facts.confirmation}</Pill>
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
              {Boolean(d.courier || d.waybill) && (
                <View style={s.row}>
                  <Truck color={t.brand} />
                  <View style={s.flex}>
                    {Boolean(d.courier) && <Title small>{d.courier}</Title>}
                    {Boolean(d.waybill) && <Body large>Waybill: {d.waybill}</Body>}
                  </View>
                  {Boolean(d.waybill) && <CopyWaybill waybill={d.waybill} />}
                </View>
              )}
              {Boolean(facts.deliveredOn || facts.deliveredAt) && (
                <View style={[s.panel, s.row]}>
                  {Boolean(facts.deliveredOn) && (
                    <View style={s.flex}>
                      <Body large>Delivered On</Body>
                      <Title small>{facts.deliveredOn}</Title>
                    </View>
                  )}
                  {Boolean(facts.deliveredAt) && (
                    <View style={s.flex}>
                      <Body large>Delivered At</Body>
                      <Title small>{facts.deliveredAt}</Title>
                    </View>
                  )}
                </View>
              )}
              {Boolean(facts.receivedBy) && (
                <>
                  <Body large>Received By</Body>
                  <View style={s.row}>
                    <Text style={[s.strong, s.flex, { fontSize: t.deliveredBody }]}>
                      {facts.receivedBy}
                    </Text>
                    <Pill>{facts.signatureStatus}</Pill>
                  </View>
                </>
              )}
              {Boolean(d.address) && (
                <>
                  <Body large>Delivery Address</Body>
                  <Text style={[s.body, { fontSize: t.deliveredBody }]}>
                    {d.address}
                  </Text>
                </>
              )}
            </Card>
            <Card>
              <View style={s.row}>
                <Label>DELIVERY PROOF</Label>
                <Pill green>{facts.proofStatus}</Pill>
              </View>
              <View style={s.row}>
                {facts.proof !== null && <Image source={facts.proof} style={s.proof} />}
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
            {Boolean(d.file) && (
              <Card>
                <Label>YOUR LEGAL NOTICE</Label>
                <View style={[s.panel, s.row]}>
                  <FileText color={t.pdf} />
                  <View style={s.flex}>
                    <Text style={s.strong}>{d.file}</Text>
                    {Boolean(facts.fileMeta) && <Body large>{facts.fileMeta}</Body>}
                  </View>
                  <Pressable accessibilityRole="button" onPress={viewNotice}>
                    <Text style={s.pill}>View Notice</Text>
                  </Pressable>
                </View>
              </Card>
            )}
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
            <NoticeButton onPress={viewCase}>
              View Case →
            </NoticeButton>
          </>
        ) : (
          <>
            <Card>
              {(facts.inTransit || Boolean(facts.estimate)) && (
                <View style={s.row}>
                  {facts.inTransit && <Text style={[s.label, { color: t.green }]}>● IN TRANSIT</Text>}
                  <Pill>{facts.estimate}</Pill>
                </View>
              )}
              <Title>Physical Notice on the Way</Title>
              <Body>
                {matter.dispatch}
              </Body>
              {Boolean(d.courier || d.waybill) && (
                <View style={[s.panel, s.row]}>
                  <Truck color={t.brand} />
                  <View style={s.flex}>
                    {Boolean(d.courier) && <Text style={s.strong}>{d.courier}</Text>}
                    {Boolean(d.waybill) && <Body>{d.waybill}</Body>}
                  </View>
                  {Boolean(d.waybill) && <CopyWaybill waybill={d.waybill} />}
                </View>
              )}
            </Card>
            <Card>
              <View style={s.row}>
                <Label>NOTICE RECIPIENT</Label>
                <Pill>{d.case}</Pill>
              </View>
              <Title>{matter.title}</Title>
              {Boolean(d.recipient) && <Text style={s.strong}>{d.recipient}</Text>}
              {Boolean(d.address || d.phone) && (
                <View style={s.panel}>
                  {Boolean(d.address) && (
                    <View style={s.row}>
                      <MapPin size={t.discIcon} color={t.brand} />
                      <Text style={[s.body, s.flex]}>{d.address}</Text>
                    </View>
                  )}
                  {Boolean(d.phone) && (
                    <View style={s.row}>
                      <Phone size={t.discIcon} color={t.brand} />
                      <Body>{d.phone}</Body>
                    </View>
                  )}
                </View>
              )}
            </Card>
            {Boolean(facts.latestUpdate) && (
              <Card>
                <Label>● LATEST COURIER UPDATE</Label>
                <Text style={s.strong}>
                  {facts.latestUpdate}
                </Text>
                {Boolean(facts.latestPlace || facts.latestTime) && (
                  <View style={s.row}>
                    <Body>{facts.latestPlace}</Body>
                    <Body>{facts.latestTime}</Body>
                  </View>
                )}
              </Card>
            )}
            <View style={s.envelopeCard}>
              <Image
                source={require("../assets/notice-envelope.png")}
                style={s.envelope}
              />
              {Boolean(d.file) && (
                <View style={[s.panel, s.row]}>
                  <FileText color={t.pdf} />
                  <View style={s.flex}>
                    <Text style={s.strong}>{d.file}</Text>
                    {facts === fixtureFacts ? <Body>Signed copy · 4 Pages</Body> : Boolean(facts.fileMeta) && <Body>{facts.fileMeta}</Body>}
                  </View>
                  <Pressable accessibilityRole="button" onPress={viewNotice}>
                    <Text style={s.pill}>Preview</Text>
                  </Pressable>
                </View>
              )}
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
                            { backgroundColor: facts.completedSteps.includes(i) ? t.green : t.border },
                          ]}
                        />
                      )}
                      <View
                        style={[
                          s.dot,
                          {
                            backgroundColor:
                              facts.completedSteps.includes(i) ? t.green : i === facts.progressStep ? t.brand : t.border,
                          },
                        ]}
                      >
                        {facts.completedSteps.includes(i) ? (
                          <Check color="white" size={t.checkIcon} />
                        ) : (
                          <Text style={{ color: "white" }}>●</Text>
                        )}
                      </View>
                    </View>
                    <View style={[s.step, i === facts.progressStep && s.active]}>
                      <Text style={[s.strong, !facts.completedSteps.includes(i) && i !== facts.progressStep && { opacity: 0.5 }]}>
                        {title}
                        {i === facts.progressStep ? "  ACTIVE" : ""}
                      </Text>
                      {Boolean(sub) && <Body>{sub}</Body>}
                    </View>
                  </View>
                ))}
              </View>
            </Card>
            {onDeliveryConfirmation ? (
              <NoticeButton onPress={onDeliveryConfirmation}>{instructedCopy[440].deliveryConfirmation}</NoticeButton>
            ) : (
              <View style={s.panel}>
                <Title>Statutory Evidence Guarantee</Title>
                <Body>
                  Once delivered, a digitally stamped certificate of service with
                  physical recipient sign-off will automatically appear in your
                  case file.
                </Body>
              </View>
            )}
            <NoticeButton onPress={viewNotice}>
              View Notice Document →
            </NoticeButton>
            <NoticeButton
              secondary
              onPress={viewCase}
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
