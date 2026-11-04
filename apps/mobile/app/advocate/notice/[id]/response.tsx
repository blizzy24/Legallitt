import NoticeScreenFeedback from '../../../../components/NoticeScreenFeedback';
import {useAdvocateNoticeModel} from '../../../../features/legal-notice/useAdvocateNoticeModel';
import NoticeResponseScreen from '../../../../components/NoticeResponseScreen';

// Design 189: one designed view, with controller data and save-before-share navigation.
export default function AdvocateNoticeResponseScreen() {
  const model=useAdvocateNoticeModel('response');
  return <NoticeScreenFeedback state={model.screenState}><NoticeResponseScreen feedback={model.feedback} variant="share" caseId={model.controller.id??'ln-2026-1048'}
    data={model.data.ADV_NOTICE_RESPONSE} fields={model.documentFields} navigate={model.navigate} onSave={model.onSaveDraft} /></NoticeScreenFeedback>;
}
