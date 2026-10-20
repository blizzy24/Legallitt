import ApiLegalNotice from "../../components/api/LegalNotice";
import { DATA_SOURCE } from "../../lib/data-source";
import { Image, ScrollView, StyleSheet } from "react-native";
import { NoticeHeader } from "../../components/NoticeDeliveryScreen";
import { noticeDelivery as t } from "../../constants/tokens/noticeDelivery";
// Only the supplied proof image is available; do not fabricate a document body.
function FixtureDeliveryProof() {
  return (
    <>
      <NoticeHeader title="Signed Proof of Delivery (POD)" />
      <ScrollView contentContainerStyle={s.content}>
        <Image
          source={require("../../assets/notice-delivery-proof.png")}
          style={s.image}
          resizeMode="contain"
        />
      </ScrollView>
    </>
  );
}
const s = StyleSheet.create({
  content: { padding: t.pad, backgroundColor: t.bg, flexGrow: 1 },
  image: { width: "100%", height: t.proofPreviewH },
});

// The deployed fixture path remains unchanged; API mode is explicit.
export default function DeliveryProof() {
  return DATA_SOURCE === "api" ? <ApiLegalNotice stage="delivery" /> : <FixtureDeliveryProof />;
}
