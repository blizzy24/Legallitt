import NoticeChatScreen from '../../components/NoticeChatScreen';
import { NOTICE_CHAT_CLIENT as d } from '../../data/noticeChat';

// Chat with Advocate — design/33, the client's chat with Adv. Arjun Sharma, built
// as drawn (client instruction, 17 Oct; the earlier hold over its style is
// reversed). Opened from Legal Notice tracking's Chat with Advocate, and from the
// case and hearing screens' Contact Advocate / Message.
// ⚠ Those case and hearing screens name other advocates; this thread is the one
// design/33 draws, with Adv. Arjun Sharma.
export default function AdvocateChatScreen() {
  return <NoticeChatScreen variant="client" name={d.name} messages={d.messages} placeholder={d.placeholder} />;
}
