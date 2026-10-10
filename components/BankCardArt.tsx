import Svg, { Circle, G, Path, Rect, Text as SvgText } from 'react-native-svg';

/**
 * The bank-and-card mark designs 256 and 257 draw in their hero: a courthouse
 * outline behind a payout card carrying the masked account tail, with a green
 * verified tick. Vector, measured off the 2× exports.
 */
export default function BankCardArt({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 190 110">
      <Circle cx={95} cy={55} r={48} fill="#F8F1E8" />
      {[32, 40, 150, 158].map((x) => (
        <Path key={x} d={`M${x} 20 V90`} stroke="#E4DCCE" strokeWidth={1.1} />
      ))}
      <Path d="M22 36 V42 M19 39 H25" stroke="#DCD0BD" strokeWidth={1} />
      <Path d="M168 36 V42 M165 39 H171" stroke="#DCD0BD" strokeWidth={1} />
      <Circle cx={24} cy={66} r={1.8} fill="#DCD0BD" />
      <Circle cx={166} cy={66} r={1.8} fill="#DCD0BD" />

      <G>
        <Path d="M48 38 L66 26 L84 38 M48 38 H84 M52 40 V72 M62 40 V72 M72 40 V72 M80 40 V72 M45 74 H87" stroke="#9A8B74" strokeWidth={1.3} fill="none" />
      </G>
      <Path d="M86 30 q16 -8 28 6" fill="none" stroke="#C9BBA8" strokeWidth={1.2} />
      <Path d="M110 32 l5 4 l-6 3 z" fill="#C9BBA8" />

      <Rect x={74} y={38} width={74} height={46} rx={7} fill="#FFFFFF" stroke="#C9BBA8" strokeWidth={1.3} />
      <Rect x={82} y={46} width={14} height={11} rx={2} fill="none" stroke="#9A8B74" strokeWidth={1.1} />
      <Path d="M82 51 H96 M89 46 V57" stroke="#9A8B74" strokeWidth={1} />
      <Circle cx={136} cy={51} r={5} fill="#EDE5D9" />
      <SvgText x={82} y={68} fontSize={9} fontWeight="700" fill="#4D463D">
        •••• 4821
      </SvgText>
      <SvgText x={82} y={78} fontSize={6.5} fontWeight="700" fill="#9A8B74">
        SBI • SAVINGS
      </SvgText>

      <Circle cx={138} cy={74} r={12} fill="#22B573" />
      <Path d="M132 74 l4 4 l7.5 -8" fill="none" stroke="#FFFFFF" strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" />
    </Svg>
  );
}
