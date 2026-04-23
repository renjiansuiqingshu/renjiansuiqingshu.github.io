// 新版腾讯云开发 SDK 初始化（本地加载，无需外部 CDN）
import cloudbase from './cloudbase-sdk.mjs';

const ENV_ID = 'renjiansuiqingshu-d0d8b11638ca9a';

try {
  const app = cloudbase.init({ env: ENV_ID });
  const auth = app.auth();
  const db = app.database();
  const _ = db.command;

  window.__tcb = { app, auth, db, _ };
  window.__tcbReady = true;
  window.dispatchEvent(new Event('tcb-ready'));
  console.log('✅ 云开发 SDK 初始化成功');
} catch (e) {
  console.error('❌ SDK 初始化失败:', e);
  window.__tcbError = e.message;
  window.dispatchEvent(new Event('tcb-error'));
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f44336;color:white;padding:12px;z-index:9999;font-size:14px;text-align:center';
    el.textContent = 'SDK 初始化失败: ' + e.message;
    document.body.prepend(el);
  });
}
