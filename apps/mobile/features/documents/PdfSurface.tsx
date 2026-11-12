import {useMemo,useRef,useState,useEffect} from 'react';
import {Text, View} from 'react-native';
import {WebView} from 'react-native-webview';
import {nativePdfHtml} from './native-pdf-html';
import runtime from './pdf-runtime.generated.json';
export type PdfSurfaceProps = {bytes: Uint8Array; page: number; scale: number; width: number; onPages(n: number): void; onError(message: string): void};
export default function PdfSurface({bytes,page,scale,width,onPages,onError}: PdfSurfaceProps) {
  const web=useRef<WebView>(null),[height,setHeight]=useState(500),[loading,setLoading]=useState(true);
  const html=useMemo(()=>{
    return nativePdfHtml({bytes,page,width,scale,runtime});
  },[bytes]);
  useEffect(()=>{web.current?.injectJavaScript(`window.renderPage&&window.renderPage(${page},${width},${scale});true;`);},[page,width,scale]);
  return <View>{loading&&<Text>Loading page…</Text>}<WebView ref={web} originWhitelist={['*']} source={{html}} style={{width,height}} javaScriptEnabled domStorageEnabled={false} allowFileAccess={false} setSupportMultipleWindows={false} onShouldStartLoadWithRequest={request=>request.url==='about:blank'||request.url.startsWith('data:text/html')} onError={()=>{setLoading(false);onError('Couldn’t display this PDF. Retry or download the file.');}} onMessage={event=>{try{const value=JSON.parse(event.nativeEvent.data);if(value.pages){onPages(value.pages);web.current?.injectJavaScript(`window.renderPage&&window.renderPage(${page},${width},${scale});true;`);}if(value.height){setHeight(value.height);setLoading(false);}if(value.error){setLoading(false);onError('Couldn’t display this PDF. Retry or download the file.');}}catch{onError('Couldn’t display this PDF. Retry.');}}}/></View>;
}
