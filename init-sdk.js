// 腾讯云开发 SDK 初始化（ESM 加载）
import cloudbase from './cloudbase-sdk.mjs';

const ENV_ID = 'renjiansuiqingshu-d0d8b11638ca9a';
const ACCESS_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3JlbmppYW5zdWlxaW5nc2h1LWQwZDhiMTE2MzhjYTlhLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsImV4cCI6NDA4MDY0NzYwNywiaWF0IjoxNzc2OTY0NDA3LCJub25jZSI6IjMxYTVIbUVoU1FDdGkzeHpxb2dRNEEiLCJhdF9oYXNoIjoiMzFhNUhtRWhTUUN0aTN4enFvZ1E0QSIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.fdgKvadnR3PQty2LBDYK_nu5RyBk43-2cEgV_yblPMydKGjvwMp1JL4IXmVp3Q_WzPlh7k2eiQd1V5jSHzYvFBbZXY2DMTVWft0mAxwV8bzwEv2-bHRkAPMnK2lHK96JHSRofFhh4Ra_eue5w1xvCAdOmNb9H664Gr4rEt1y9P_TOAYKQg74ojuYX45DUXSzIq9IJ0uv_s2YyXUPldJFa-0__vnQUToxfSppCqsBkRBke4oDRqcEmYaVIi2TL--zn1wNK3J41YbfMGkbyY63kLCcHyBBVjZ0_ZUrBeBSp9Tz0bTqb2OQshF2xBh02oG6LvZPBwxo0OxokTTc4PkbJg';

// 显示加载提示
document.addEventListener('DOMContentLoaded', () => {
  if (!window.__tcbReady && !window.__tcbError) {
    const el = document.createElement('div');
    el.id = 'sdkLoading';
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#2196F3;color:white;padding:12px;z-index:9999;font-size:14px;text-align:center';
    el.textContent = '⏳ 正在加载，请稍候...（首次加载可能需要几分钟）';
    document.body.prepend(el);
  }
});

try {
  const app = cloudbase.init({ env: ENV_ID, accessKey: ACCESS_KEY });
  const auth = app.auth();
  const db = app.database();
  const _ = db.command;

  window.__tcb = { app, auth, db, _ };
  window.__tcbReady = true;
  window.dispatchEvent(new Event('tcb-ready'));
  console.log('✅ 云开发 SDK 初始化成功');

  // 移除加载提示
  const loading = document.getElementById('sdkLoading');
  if (loading) loading.remove();
} catch (e) {
  console.error('❌ SDK 初始化失败:', e);
  window.__tcbError = e.message;
  window.dispatchEvent(new Event('tcb-error'));
  document.addEventListener('DOMContentLoaded', () => {
    const loading = document.getElementById('sdkLoading');
    if (loading) loading.remove();
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f44336;color:white;padding:12px;z-index:9999;font-size:14px;text-align:center';
    el.textContent = 'SDK 初始化失败: ' + e.message;
    document.body.prepend(el);
  });
}
