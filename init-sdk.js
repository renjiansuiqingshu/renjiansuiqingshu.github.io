// 新版腾讯云开发 SDK 初始化（ESM 模块）
import cloudbase from 'https://esm.sh/@cloudbase/app@2.27.5';
import 'https://esm.sh/@cloudbase/auth@2.27.5';
import 'https://esm.sh/@cloudbase/database@2.27.5';

const ENV_ID = 'renjiansuiqingshu-d0d8b11638ca9a';

try {
  const app = cloudbase.init({ env: ENV_ID });
  const auth = app.auth();
  const db = app.database();
  const _ = db.command;

  // 暴露给全局，让 app.js 能用
  window.__tcb = { app, auth, db, _ };
  window.__tcbReady = true;
  window.dispatchEvent(new Event('tcb-ready'));
  console.log('✅ 新版云开发 SDK 初始化成功');
} catch (e) {
  console.error('❌ SDK 初始化失败:', e);
  window.__tcbError = e.message;
  window.dispatchEvent(new Event('tcb-error'));
  // 在页面上显示错误
  document.addEventListener('DOMContentLoaded', () => {
    const el = document.createElement('div');
    el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f44336;color:white;padding:12px;z-index:9999;font-size:14px;text-align:center';
    el.textContent = 'SDK 初始化失败: ' + e.message;
    document.body.prepend(el);
  });
}

// 全局错误捕获
window.addEventListener('error', (e) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:0;left:0;right:0;background:#ff9800;color:white;padding:12px;z-index:9999;font-size:13px';
  el.textContent = 'JS 错误: ' + (e.message || e.error) + ' @ ' + (e.filename || '').split('/').pop();
  document.body.appendChild(el);
});

window.addEventListener('unhandledrejection', (e) => {
  const el = document.createElement('div');
  el.style.cssText = 'position:fixed;bottom:40px;left:0;right:0;background:#e91e63;color:white;padding:12px;z-index:9999;font-size:13px';
  el.textContent = 'Promise 错误: ' + (e.reason?.message || e.reason || '未知');
  document.body.appendChild(el);
});
