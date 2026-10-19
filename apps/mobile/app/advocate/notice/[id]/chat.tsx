import NoticeChatScreen from '../../../../components/NoticeChatScreen';
import { NOTICE_CHAT_ADVOCATE as d } from '../../../../data/noticeChat';

// Advocate — chat with the client (design/183), built as drawn. Opened from the
// notice review's Message Client. ⚠ design/183 names the client Ananya
// Deshmukh; the notice's client is Rahul Sharma everywhere else.
export default function AdvocateNoticeChatScreen() {
  return (
    <NoticeChatScreen variant="advocate" name={d.name} messages={d.messages} placeholder={d.placeholder} valid={d.valid} validTime={d.validTime} />
  );
}
