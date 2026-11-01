import NoticeScreenFeedback from '../../components/NoticeScreenFeedback';
import { useDeliveryModel } from "../../features/legal-notice/useDeliveryModel";
import { Image, ScrollView, StyleSheet, type ImageSourcePropType } from "react-native";
import { NoticeHeader } from "../../components/NoticeDeliveryScreen";
import { noticeDelivery as t } from "../../constants/tokens/noticeDelivery";
// Only the supplied proof image is available; do not fabricate a document body.
export function DeliveryProofView({source, onBack}: {source:ImageSourcePropType|null; onBack?: () => void}) {
  return (
    <>
      <NoticeHeader onBack={onBack} title="Signed Proof of Delivery (POD)" />
      <ScrollView contentContainerStyle={s.content}>
        <Image
          source={source ?? undefined}
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
  const model = useDeliveryModel();
  return <NoticeScreenFeedback error={model.error}><DeliveryProofView onBack={model.onBack} source={model.proofSource} /></NoticeScreenFeedback>;
}
