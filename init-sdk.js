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
}
