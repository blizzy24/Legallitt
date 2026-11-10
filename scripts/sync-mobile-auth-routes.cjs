// Keep the protected navigator registry in sync when adding Expo routes.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../apps/mobile'),groups={public:[],advocate:[],clientTabs:[],authenticated:[]};
function add(name){const group=name==='index'||name.startsWith('(auth)/')||name.startsWith('onboarding/')?'public':name.startsWith('advocate/')||name==='(advocate)'?'advocate':name==='(tabs)'?'clientTabs':'authenticated';groups[group].push(name);}
function walk(folder,prefix=''){for(const name of fs.readdirSync(folder).sort()){const file=path.join(folder,name);if(fs.statSync(file).isDirectory()){if(fs.existsSync(path.join(file,'_layout.tsx')))add(prefix+name);else walk(file,prefix+name+'/');}else if(name.endsWith('.tsx')&&!name.startsWith('_'))add(prefix+name.slice(0,-4));}}
walk(path.join(root,'app'));fs.writeFileSync(path.join(root,'lib/auth-routes.json'),JSON.stringify(groups,null,2)+'\n');
function paths(dir,base=''){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?paths(path.join(dir,e.name),base+'/'+e.name):e.name.endsWith('.tsx')&&!e.name.startsWith('_')?[(e.name==='index.tsx'?base:base+'/'+e.name.slice(0,-4)).replace(/\/\([^)]+\)/g,'')||'/']:[]);}
console.log('Protected navigator registry updated; unique app paths:',new Set(paths(path.join(root,'app'))).size);
// Expo 57 generates these in dev-server mode, not during export. Regenerate from
// the app root so stale Metro watcher entries cannot masquerade as routes.
process.env.EXPO_ROUTER_APP_ROOT=path.join(root,'app');
const store=path.resolve(root,'../../node_modules/.pnpm'),server=fs.readdirSync(store).find(n=>n.startsWith('@expo+router-server@57.'));
if(!server)throw new Error('Install the pinned Expo 57 dependencies first.');
const output=path.join(root,'.expo/types');fs.mkdirSync(output,{recursive:true});
require(path.join(store,server,'node_modules/@expo/router-server/build/typed-routes')).regenerateDeclarations(output);
