import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

import { font } from '../constants/theme';

// The Export Client PDF glyph on design/180: a framed "PDF" page with a second
// page's corner behind it. No stock icon draws it, so it is redrawn here on a
// 14pt grid from design/180 at 2.000 px/pt (ink 13.5 × 13.5).
export default function PdfStackIcon({ size = 14, color }: { size?: number; color: string }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 14 14">
      <Path d="M1 3.5 V13 H11" stroke={color} strokeWidth={1.1} fill="none" />
      <Rect x={3.6} y={1.1} width={9.8} height={10.3} rx={0.8} stroke={color} strokeWidth={1.25} fill="none" />
      <SvgText
        x={8.5}
        y={8.1}
        fontSize={4.2}
        fontFamily={font.appHeading}
        fontWeight="700"
        fill={color}
        textAnchor="middle"
      >
        PDF
      </SvgText>
    </Svg>
  );
}
