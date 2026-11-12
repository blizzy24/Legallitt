import { StyleSheet, Text, View } from 'react-native';

import { font, wizardBubble as b } from '../constants/theme';

type Props = {
  /** Omit for the bare timestamp used on step 3 (design/26 has no bubble there). */
  title?: string;
  time?: string;
};

// The wizard's chat-style prompt (design/24, 25, 27): a fixed-width beige bubble with
// a bold prompt and a right-aligned timestamp.
export default function ChatBubble({ title, time }: Props) {
  return (
    <View style={[styles.bubble, !title && styles.bare]}>
      {title && <Text style={styles.title}>{title}</Text>}
      {!!time && <Text style={styles.time}>{time}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  bubble: {
    width: b.width,
    borderRadius: b.radius,
    backgroundColor: b.bg,
    paddingLeft: b.padX,
    paddingRight: b.timeInset,
    paddingTop: b.padTop,
    paddingBottom: b.padBottom,
  },
  bare: {
    backgroundColor: 'transparent',
    paddingTop: 0,
    paddingBottom: 0,
  },
  title: {
    fontFamily: font.appSemi,
    fontSize: b.titleSize,
    lineHeight: b.lineHeight,
    color: b.text,
    marginRight: b.padX - b.timeInset,
  },
  time: {
    marginTop: b.timeGap,
    alignSelf: 'flex-end',
    fontFamily: font.appBody,
    fontSize: b.timeSize,
    lineHeight: b.timeLineHeight,
    color: b.time,
  },
});
