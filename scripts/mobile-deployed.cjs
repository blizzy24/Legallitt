// One command owns both processes. Ctrl+C stops Metro and the loopback proxy.
const path = require('node:path');
const net = require('node:net');
const {spawn, spawnSync} = require('node:child_process');
const {createProxy, DEPLOYED_API, LOCAL_PROXY} = require('./local-api-proxy.cjs');
const mobile = path.resolve(__dirname, '../apps/mobile');
let proxy, expo, stopping = false;

function stop(code = 0) {
  if (stopping) return;
  stopping = true;
  if (expo?.pid && expo.exitCode === null) {
    if (process.platform === 'win32') spawnSync('taskkill.exe', ['/pid', String(expo.pid), '/t', '/f'], {stdio: 'ignore', windowsHide: true});
    else expo.kill('SIGTERM');
  }
  proxy?.closeAllConnections();
  proxy?.close();
  process.exitCode = code;
}

(async () => {
  if (process.versions.node.split('.')[0] !== '22') throw new Error('Use fnm use to select Node 22 first.');
  try { process.loadEnvFile(path.join(mobile, '.env.local')); }
  catch { throw new Error('Copy apps/mobile/.env.example to apps/mobile/.env.local before running pnpm mobile:deployed.'); }
  if (process.env.EXPO_PUBLIC_DATA_SOURCE !== 'api' || process.env.EXPO_PUBLIC_API_URL !== LOCAL_PROXY || process.env.EXPO_PUBLIC_LOCAL_API_PROXY !== '1')
    throw new Error(`Local proxy setup requires EXPO_PUBLIC_DATA_SOURCE=api, EXPO_PUBLIC_API_URL=${LOCAL_PROXY} and EXPO_PUBLIC_LOCAL_API_PROXY=1 in apps/mobile/.env.local. Restart after changing them.`);
  const target = process.env.LOCAL_API_PROXY_TARGET || DEPLOYED_API;
  if (new URL(target).protocol !== 'https:') throw new Error('LOCAL_API_PROXY_TARGET must use HTTPS.');
  // Do not let Expo silently choose a port that the proxy does not allow.
  await new Promise((resolve, reject) => {
    const probe = net.createServer();
    probe.once('error', () => reject(new Error('Port 8081 is already in use. Stop the other web server, then run pnpm mobile:deployed again.')));
    probe.listen(8081, () => probe.close(resolve));
  });
  const expoCli = path.join(path.dirname(require.resolve('expo/package.json', {paths: [mobile]})), 'bin/cli');
  proxy = createProxy(target);
  await new Promise((resolve, reject) => {
    proxy.once('error', reject);
    proxy.listen(3002, '127.0.0.1', resolve);
  });
  console.log(`Local API proxy: ${LOCAL_PROXY} -> ${target}`);
  console.log('Mobile web: http://localhost:8081 | API data enabled | Ctrl+C stops both.');
  expo = spawn(process.execPath, [expoCli, 'start', '--web', '--localhost', '--port', '8081'], {
    cwd: mobile, env: process.env, stdio: 'inherit', windowsHide: true,
  });
  expo.once('error', () => { console.error('Expo could not start. Check the dependency installation.'); stop(1); });
  expo.once('exit', code => stop(code ?? 0));
})().catch(error => { console.error(`Local web setup: ${error.message}`); stop(1); });
process.on('SIGINT', () => stop());
process.on('SIGTERM', () => stop());
