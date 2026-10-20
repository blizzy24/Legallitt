const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),ts=require('typescript');
test('mobile data source defaults to fixtures, including unknown flag values; API must be explicit',()=>{
 const source=fs.readFileSync('../mobile/lib/data-source.ts','utf8');const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS}}).outputText;
 for(const [value,expected] of [[undefined,'fixtures'],['fixtures','fixtures'],['api','api'],['API','fixtures'],['','fixtures']]){
  const context={exports:{},process:{env:value===undefined?{}:{EXPO_PUBLIC_DATA_SOURCE:value}}};vm.runInNewContext(compiled,context);assert.equal(context.exports.DATA_SOURCE,expected);
 }
});
