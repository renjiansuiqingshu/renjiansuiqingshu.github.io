// ===== 腾讯云开发配置 =====
// 使用 v2 SDK (cloudbase.full.js 2.28.6)
let app, auth, db, _;

const ENV_ID = 'renjiansuiqingshu-d0d8b11638ca9a';
const REGION = 'ap-shanghai';
const ACCESS_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3JlbmppYW5zdWlxaW5nc2h1LWQwZDhiMTE2MzhjYTlhLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsImV4cCI6NDA4MDY0NzYwNywiaWF0IjoxNzc2OTY0NDA3LCJub25jZSI6IjMxYTVIbUVoU1FDdGkzeHpxb2dRNEEiLCJhdF9oYXNoIjoiMzFhNUhtRWhTUUN0aTN4enFvZ1E0QSIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.fdgKvadnR3PQty2LBDYK_nu5RyBk43-2cEgV_yblPMydKGjvwMp1JL4IXmVp3Q_WzPlh7k2eiQd1V5jSHzYvFBbZXY2DMTVWft0mAxwV8bzwEv2-bHRkAPMnK2lHK96JHSRofFhh4Ra_eue5w1xvCAdOmNb9H664Gr4rEt1y9P_TOAYKQg74ojuYX45DUXSzIq9IJ0uv_s2YyXUPldJFa-0__vnQUToxfSppCqsBkRBke4oDRqcEmYaVIi2TL--zn1wNK3J41YbfMGkbyY63kLCcHyBBVjZ0_ZUrBeBSp9Tz0bTqb2OQshF2xBh02oG6LvZPBwxo0OxokTTc4PkbJg';

// ===== 全局状态 =====
const state = {
  currentUser: null,
  currentCategory: '全部',
  currentSort: 'latest',
  posts: [],
  lastDoc: null,
  pageSize: 10,
  hasMore: true,
  selectedEmoji: '☁️',
  selectedImage: null,
  isAdmin: false,
  likedPosts: new Set(JSON.parse(localStorage.getItem('likedPosts') || '[]')),
  theme: localStorage.getItem('theme') || 'dark',
  loginType: 'anonymous'
};

// ===== 工具函数 =====
function $(sel) { return document.querySelector(sel); }
function $$(sel) { return document.querySelectorAll(sel); }

function timeAgo(date) {
  const now = Date.now();
  const diff = now - date.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return '刚刚';
  if (mins < 60) return `${mins}分钟前`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}小时前`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}天前`;
  return date.toLocaleDateString('zh-CN');
}

function toast(msg, type = 'info') {
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = msg;
  $('#toastContainer').appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function generateAnonName() {
  const adjectives = ['温柔的', '沉默的', '勇敢的', '孤独的', '自由的', '神秘的', '浪漫的', '清醒的'];
  const nouns = ['月光', '星辰', '海风', '云朵', '萤火', '落叶', '微风', '彩虹'];
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
  const noun = nouns[Math.floor(Math.random() * nouns.length)];
  return `${adj}${noun}`;
}

function getDeviceId() {
  let id = localStorage.getItem('deviceId');
  if (!id) {
    id = 'dev_' + Math.random().toString(36).substr(2, 16);
    localStorage.setItem('deviceId', id);
  }
  return id;
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML.replace(/\n/g, '<br>');
}

// ===== 主题切换 =====
function initTheme() {
  document.documentElement.setAttribute('data-theme', state.theme);
  const sunIcon = document.querySelector('#themeToggle .icon-sun');
  const moonIcon = document.querySelector('#themeToggle .icon-moon');
  if (state.theme === 'dark') {
    if (sunIcon) sunIcon.style.display = 'none';
    if (moonIcon) moonIcon.style.display = 'inline-block';
  } else {
    if (sunIcon) sunIcon.style.display = 'inline-block';
    if (moonIcon) moonIcon.style.display = 'none';
  }
}

$('#themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  initTheme();
});

// ===== 认证 =====
async function initAuth() {
  try {
    const result = await auth.signInAnonymously();
    if (result && result.error) {
      console.error('匿名登录失败:', result.error);
      toast('匿名登录失败: ' + (result.error.message || result.error.code || JSON.stringify(result.error)), 'error');
      return;
    }
    const loginState = await auth.getLoginState();
    state.currentUser = loginState;
    state.loginType = 'anonymous';
    updateUserUI();
    console.log('✅ 匿名登录成功');
  } catch (err) {
    console.error('匿名登录失败:', err);
    toast('匿名登录失败: ' + (err.message || err.code || JSON.stringify(err)), 'error');
  }
}

function updateUserUI() {
  if (state.currentUser && state.loginType !== 'anonymous') {
    $('#loginBtn').style.display = 'none';
    $('#userAvatar').style.display = 'flex';
  } else {
    $('#loginBtn').style.display = 'block';
    $('#userAvatar').style.display = 'none';
  }
}

$('#loginBtn').addEventListener('click', async () => {
  toast('匿名模式下无需登录', 'info');
});

$('#logoutBtn').addEventListener('click', async () => {
  try {
    await auth.signOut();
    await auth.signInAnonymously();
    state.currentUser = await auth.getLoginState();
    state.loginType = 'anonymous';
    state.isAdmin = false;
    $('#adminBtn').style.display = 'none';
    updateUserUI();
    toast('已退出登录');
  } catch(err) {
    toast('操作失败', 'error');
  }
});

async function checkAdmin(uid) {
  try {
    const res = await db.collection('admins').where({ uid }).get();
    if (res.data.length > 0) {
      state.isAdmin = true;
      $('#adminBtn').style.display = 'block';
    }
  } catch (e) {}
}

// ===== 表情选择 =====
$$('.emoji-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.emoji-btn').forEach(b => b.classList.remove('selected'));
    btn.classList.add('selected');
    state.selectedEmoji = btn.dataset.emoji;
  });
});

// ===== 图片上传 =====
$('#addImageBtn').addEventListener('click', () => $('#imageInput').click());

$('#imageInput').addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;
  if (file.size > 5 * 1024 * 1024) { toast('图片不能超过 5MB', 'error'); return; }
  state.selectedImage = file;
  const reader = new FileReader();
  reader.onload = (ev) => { $('#previewImg').src = ev.target.result; $('#imageUploadArea').style.display = 'block'; };
  reader.readAsDataURL(file);
});

$('#removeImg').addEventListener('click', () => {
  state.selectedImage = null;
  $('#imageUploadArea').style.display = 'none';
  $('#imageInput').value = '';
});

$('#secretInput').addEventListener('input', (e) => { $('#charCount').textContent = e.target.value.length; });

// ===== 上传图片到云存储 =====
async function uploadImage(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const cloudPath = `images/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;
  try {
    const result = await app.uploadFile({ cloudPath, filePath: file });
    const urlResult = await app.getTempFileURL({ fileList: [result.fileID] });
    return urlResult.fileList[0].tempFileURL || result.fileID;
  } catch (err) { console.error('图片上传失败:', err); throw err; }
}

// ===== 发布秘密 =====
$('#submitBtn').addEventListener('click', async () => {
  const content = $('#secretInput').value.trim();
  if (!content && !state.selectedImage) { toast('写点什么再投进树洞吧', 'error'); return; }
  const btn = $('#submitBtn');
  btn.disabled = true; btn.querySelector('span').textContent = '投递中...';
  try {
    let imageUrl = null;
    if (state.selectedImage) imageUrl = await uploadImage(state.selectedImage);
    const post = {
      content: content || '(图片)', emoji: state.selectedEmoji,
      category: $('#categorySelect').value, imageUrl: imageUrl || null,
      authorUid: null, authorName: generateAnonName(), authorAvatar: null,
      deviceId: getDeviceId(), likes: 0, commentCount: 0, reportCount: 0,
      createdAt: db.serverDate(), status: 'active'
    };
    await db.collection('posts').add(post);
    $('#secretInput').value = ''; $('#charCount').textContent = '0';
    state.selectedImage = null; $('#imageUploadArea').style.display = 'none'; $('#imageInput').value = '';
    toast('秘密已投进树洞 🌳', 'success');
    loadPosts(true);
  } catch (err) {
    console.error('投递失败:', err);
    toast('投递失败：' + (err.message || JSON.stringify(err)), 'error');
  } finally { btn.disabled = false; btn.querySelector('span').textContent = '投递'; }
});

// ===== 分类/排序 =====
$$('.filter-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.filter-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentCategory = btn.dataset.cat;
    loadPosts(true);
  });
});
$$('.sort-chip').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.sort-chip').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentSort = btn.dataset.sort;
    loadPosts(true);
  });
});

// ===== 加载帖子 =====
async function loadPosts(refresh) {
  const list = $('#postsList');
  const empty = $('#emptyState');
  if (refresh) {
    state.posts = [];
    state.lastDoc = null;
    state.hasMore = true;
    list.innerHTML = '';
    list.appendChild(empty);
    empty.style.display = 'none';
  }
  try {
    let query = db.collection('posts').where({ status: 'active' });
    if (state.currentCategory !== '全部') {
      query = db.collection('posts').where({ status: 'active', category: state.currentCategory });
    }
    if (state.currentSort === 'hot') {
      query = query.orderBy('likes', 'desc').orderBy('createdAt', 'desc');
    } else {
      query = query.orderBy('createdAt', 'desc');
    }
    query = query.limit(state.pageSize);
    if (state.lastDoc) query = query.skip(state.posts.length);
    const res = await query.get();
    if (refresh && !res.data.length) {
      empty.style.display = 'block';
      return;
    }
    res.data.forEach(post => {
      state.posts.push(post);
      renderPost(post);
    });
    state.hasMore = res.data.length >= state.pageSize;
    $('#loadMore').style.display = state.hasMore ? 'block' : 'none';
    if (!refresh && !res.data.length) toast('没有更多了', 'info');
  } catch (err) {
    console.error('加载失败:', err);
    toast('加载失败，请刷新重试', 'error');
  }
}

function renderPost(post) {
  const card = document.createElement('div');
  card.className = 'post-card'; card.dataset.id = post._id;
  const isLiked = state.likedPosts.has(post._id);
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
  card.innerHTML = `
    <div class="post-header"><div class="post-meta">
      <span class="post-emoji">${post.emoji||'☁️'}</span><span>${post.authorName||'匿名'}</span>
      <span class="post-category">${post.category||'随想'}</span><span class="post-time">${timeAgo(createdAt)}</span>
    </div></div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    ${post.imageUrl?`<div class="post-image"><img src="${post.imageUrl}" alt=""></div>`:''}
    <div class="post-actions">
      <button class="post-action ${isLiked?'liked':''}" data-action="like" data-id="${post._id}"><span class="icon">${isLiked?'❤️':'🤍'}</span><span>${post.likes||0}</span></button>
      <button class="post-action" data-action="comment" data-id="${post._id}"><span class="icon">💬</span><span>${post.commentCount||0}</span></button>
      <button class="post-action" data-action="report" data-id="${post._id}"><span class="icon">🚩</span></button>
    </div>`;
  card.querySelector('[data-action="like"]').addEventListener('click', e => { e.stopPropagation(); toggleLike(post._id); });
  card.querySelector('[data-action="comment"]').addEventListener('click', e => { e.stopPropagation(); showPostDetail(post._id); });
  card.querySelector('[data-action="report"]').addEventListener('click', async e => {
    e.stopPropagation();
    if (!confirm('确定举报？')) return;
    try {
      await db.collection('reports').add({ postId:post._id, deviceId:getDeviceId(), status:'pending', createdAt:db.serverDate() });
      await db.collection('posts').doc(post._id).update({ reportCount:_.inc(1) });
      toast('已举报','success');
    } catch(err) { toast('举报失败','error'); }
  });
  card.addEventListener('click', () => showPostDetail(post._id));
  $('#postsList').appendChild(card);
}

async function toggleLike(postId) {
  const isLiked = state.likedPosts.has(postId);
  try {
    if (isLiked) { await db.collection('posts').doc(postId).update({likes:_.inc(-1)}); state.likedPosts.delete(postId); }
    else { await db.collection('posts').doc(postId).update({likes:_.inc(1)}); state.likedPosts.add(postId); }
    localStorage.setItem('likedPosts', JSON.stringify([...state.likedPosts]));
    loadPosts(true);
  } catch(err) { toast('操作失败','error'); }
}

function showPostDetail(postId) {
  const post = state.posts.find(p=>p._id===postId);
  if (!post) return;
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
  const isLiked = state.likedPosts.has(postId);
  const modalBody = $('#modalBody');
  modalBody.innerHTML = `
    <div class="modal-post">
      <div class="post-header"><div class="post-meta">
        <span class="post-emoji">${post.emoji||'☁️'}</span><span>${post.authorName||'匿名'}</span>
        <span class="post-category">${post.category||'随想'}</span><span class="post-time">${timeAgo(createdAt)}</span>
      </div></div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.imageUrl?`<div class="post-image"><img src="${post.imageUrl}" alt=""></div>`:''}
      <div class="post-actions">
        <button class="post-action ${isLiked?'liked':''}" data-action="like" data-id="${postId}"><span class="icon">${isLiked?'❤️':'🤍'}</span><span>${post.likes||0}</span></button>
        <button class="post-action" data-action="comment"><span class="icon">💬</span><span>${post.commentCount||0}</span></button>
      </div>
    </div>
    <div class="comments-section">
      <div class="comments-title">💬 评论</div>
      <div class="comment-input-wrap">
        <input class="comment-input" id="commentInput" placeholder="说点什么..." maxlength="500">
        <button class="btn-comment" id="submitComment">发送</button>
      </div>
      <div class="comments-list" id="commentsList"><div style="text-align:center;color:var(--text-muted);padding:20px;">加载中...</div></div>
    </div>`;
  const likeBtn = modalBody.querySelector('[data-action="like"]');
  if (likeBtn) likeBtn.addEventListener('click', async () => {
    await toggleLike(postId);
    try { const r = await db.collection('posts').doc(postId).get(); const u = r.data[0]; likeBtn.classList.toggle('liked'); likeBtn.querySelector('.icon').textContent = state.likedPosts.has(postId)?'❤️':'🤍'; likeBtn.querySelector('span:last-child').textContent = u?.likes||0; } catch(e){}
  });
  const submitComment = $('#submitComment');
  submitComment.addEventListener('click', async () => {
    const text = $('#commentInput').value.trim(); if (!text) return;
    submitComment.disabled = true;
    try {
      await db.collection('comments').add({ postId, content:text, authorName:generateAnonName(), deviceId:getDeviceId(), createdAt:db.serverDate() });
      await db.collection('posts').doc(postId).update({commentCount:_.inc(1)});
      $('#commentInput').value=''; toast('评论成功','success'); loadComments(postId);
    } catch(err) { toast('评论失败','error'); } finally { submitComment.disabled=false; }
  });
  $('#commentInput').addEventListener('keydown', e => { if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();submitComment.click();} });
  $('#postModal').style.display = 'flex'; loadComments(postId);
}

async function loadComments(postId) {
  const list = $('#commentsList');
  try {
    const res = await db.collection('comments').where({postId}).orderBy('createdAt','desc').limit(50).get();
    if (!res.data.length) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">暂无评论</div>'; return; }
    list.innerHTML = '';
    res.data.forEach(c => {
      const time = c.createdAt ? timeAgo(new Date(c.createdAt)) : '';
      const isOwner = c.deviceId === getDeviceId();
      const item = document.createElement('div'); item.className = 'comment-item';
      item.innerHTML = `<div class="comment-avatar">👤</div><div class="comment-body"><div class="comment-author">${escapeHtml(c.authorName||'匿名')}</div><div class="comment-text">${escapeHtml(c.content)}</div><div class="comment-time">${time}</div>${isOwner||state.isAdmin?`<div class="comment-actions"><button class="comment-action-btn" data-cid="${c._id}" data-pid="${postId}">删除</button></div>`:''}</div>`;
      const delBtn = item.querySelector('.comment-action-btn');
      if (delBtn) delBtn.addEventListener('click', async () => { if(!confirm('删除？'))return; try{await db.collection('comments').doc(c._id).remove();await db.collection('posts').doc(postId).update({commentCount:_.inc(-1)});item.remove();toast('已删除','success');}catch(err){toast('删除失败','error');} });
      list.appendChild(item);
    });
  } catch(err) { list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">加载失败</div>'; }
}

// modalClose and adminModalClose not in new HTML - using overlay click instead
$('#postModal').addEventListener('click', e => { if(e.target===$('#postModal')) $('#postModal').style.display='none'; });

// ===== 管理后台 =====
$('#adminBtn').addEventListener('click', () => { $('#adminModal').style.display='flex'; loadAdminContent('reports'); });
$('#adminModal').addEventListener('click', e => { if(e.target===$('#adminModal')) $('#adminModal').style.display='none'; });
$$('.admin-tab').forEach(tab => { tab.addEventListener('click', () => { $$('.admin-tab').forEach(t=>t.classList.remove('active')); tab.classList.add('active'); loadAdminContent(tab.dataset.tab); }); });

async function loadAdminContent(tab) {
  const body = $('#adminBody'); body.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">加载中...</div>';
  try {
    if (tab === 'reports') {
      const res = await db.collection('reports').where({status:'pending'}).orderBy('createdAt','desc').limit(50).get();
      if (!res.data.length) { body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">🎉 暂无举报</div>'; return; }
      body.innerHTML = '';
      for (const report of res.data) {
        let postContent = '(已删除)';
        try { const r = await db.collection('posts').doc(report.postId).get(); if(r.data.length>0) postContent = r.data[0].content?.substring(0,100)||'(图片)'; } catch(e){}
        const item = document.createElement('div'); item.className = 'admin-item';
        item.innerHTML = `<div class="admin-item-header"><span style="color:var(--accent)">🚩 举报</span><span style="color:var(--text-muted);font-size:12px">${report.createdAt?timeAgo(new Date(report.createdAt)):''}</span></div><div class="admin-item-content"><strong>内容：</strong>${escapeHtml(postContent)}</div><div class="admin-item-actions"><button class="admin-btn admin-btn-dismiss" data-id="${report._id}">忽略</button><button class="admin-btn admin-btn-delete" data-pid="${report.postId}" data-rid="${report._id}">删除</button></div>`;
        item.querySelector('.admin-btn-dismiss').addEventListener('click', async () => { await db.collection('reports').doc(report._id).update({status:'dismissed'}); item.remove(); toast('已忽略','success'); });
        item.querySelector('.admin-btn-delete').addEventListener('click', async () => { if(!confirm('确定删除？'))return; await db.collection('posts').doc(report.postId).update({status:'deleted'}); await db.collection('reports').doc(report._id).update({status:'resolved'}); item.remove(); toast('已删除','success'); loadPosts(true); });
        body.appendChild(item);
      }
    } else if (tab === 'posts') {
      const res = await db.collection('posts').orderBy('createdAt','desc').limit(50).get();
      body.innerHTML = '';
      res.data.forEach(post => {
        if(post.status==='deleted') return;
        const item = document.createElement('div'); item.className = 'admin-item';
        item.innerHTML = `<div class="admin-item-header"><span>${post.emoji||'☁️'} ${post.authorName||'匿名'}</span><span style="color:var(--text-muted);font-size:12px">❤️${post.likes||0} 💬${post.commentCount||0}</span></div><div class="admin-item-content">${escapeHtml((post.content||'').substring(0,150))}</div><div class="admin-item-actions"><button class="admin-btn admin-btn-delete" data-pid="${post._id}">删除</button></div>`;
        item.querySelector('.admin-btn-delete').addEventListener('click', async () => { if(!confirm('确定删除？'))return; await db.collection('posts').doc(post._id).update({status:'deleted'}); item.remove(); toast('已删除','success'); loadPosts(true); });
        body.appendChild(item);
      });
    }
  } catch(err) { body.innerHTML = '<div style="text-align:center;padding:20px;color:#f44336">加载失败</div>'; }
}

$('#loadMoreBtn').addEventListener('click', () => loadPosts(false));

async function updateStats() {
  try {
    const totalRes = await db.collection('posts').where({status:'active'}).count();
    $('#totalCount').textContent = totalRes.total||0;
    const today = new Date(); today.setHours(0,0,0,0);
    const todayRes = await db.collection('posts').where({status:'active',createdAt:_.gte(today)}).count();
    $('#todayCount').textContent = todayRes.total||0;
    const weekAgo = new Date(); weekAgo.setDate(weekAgo.getDate()-7); weekAgo.setHours(0,0,0,0);
    const weekRes = await db.collection('posts').where({status:'active',createdAt:_.gte(weekAgo)}).count();
    $('#weekCount').textContent = weekRes.total||0;
  } catch(err){}
}
setInterval(updateStats, 30000);

document.addEventListener('keydown', e => { if(e.key==='Escape'){$('#postModal').style.display='none';$('#adminModal').style.display='none';} });

// ===== PWA Service Worker =====
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').then(() => {
    console.log('✅ Service Worker 注册成功');
  }).catch(err => {
    console.log('SW 注册失败:', err);
  });
}

// ===== 初始化 =====
document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  try {
    if (typeof cloudbase === 'undefined') {
      throw new Error('SDK未加载，请刷新页面重试');
    }
    // 使用 GATEWAY 模式 - 绕过安全域名限制
    app = cloudbase.init({
      env: ENV_ID,
      region: REGION,
      accessKey: ACCESS_KEY,
      endPointMode: 'GATEWAY'
    });
    auth = app.auth();
    db = app.database();
    _ = db.command;
    console.log('✅ SDK初始化成功(GATEWAY模式)');
    await initAuth();
    loadPosts(true);
    updateStats();
  } catch (err) {
    console.error('❌ 初始化失败:', err);
    toast('初始化失败: ' + err.message, 'error');
  }
});

// ===== 布偶猫虚拟宠物 =====
(function() {
  // 延迟初始化，确保DOM完全渲染
  setTimeout(function initCat() {
    const cat = document.getElementById('catPet');
    const sprite = document.getElementById('catSprite');
    const speech = document.getElementById('catSpeech');
    if (!cat || !sprite) { console.warn('🐱 猫元素未找到，500ms后重试'); setTimeout(initCat, 500); return; }

  // 布偶猫SVG - 坐姿/站立
  const catSVGs = {
    sit: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- 尾巴 -->
      <path d="M48 42 Q56 38 54 30" stroke="#C4A882" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- 身体 -->
      <ellipse cx="32" cy="44" rx="16" ry="13" fill="#F5E6D3"/>
      <ellipse cx="32" cy="44" rx="16" ry="13" fill="url(#bodyShade)" opacity="0.15"/>
      <!-- 前爪 -->
      <ellipse cx="24" cy="53" rx="5" ry="3.5" fill="#FAF0E6"/>
      <ellipse cx="40" cy="53" rx="5" ry="3.5" fill="#FAF0E6"/>
      <!-- 头 -->
      <ellipse cx="32" cy="26" rx="16" ry="14" fill="#FAF0E6"/>
      <!-- 面罩 -->
      <path d="M24 22 Q32 16 40 22 Q38 28 32 30 Q26 28 24 22" fill="#C4A882" opacity="0.45"/>
      <!-- 耳朵 -->
      <path d="M18 16 L14 4 L24 13 Z" fill="#C4A882"/>
      <path d="M46 16 L50 4 L40 13 Z" fill="#C4A882"/>
      <path d="M19 14 L16 7 L23 12 Z" fill="#F0C8C8" opacity="0.5"/>
      <path d="M45 14 L48 7 L41 12 Z" fill="#F0C8C8" opacity="0.5"/>
      <!-- 眼睛 -->
      <ellipse cx="26" cy="24" rx="3.5" ry="4" fill="#6B9FD4"/>
      <ellipse cx="38" cy="24" rx="3.5" ry="4" fill="#6B9FD4"/>
      <ellipse cx="26" cy="24" rx="1.8" ry="2.2" fill="#1A1A2E"/>
      <ellipse cx="38" cy="24" rx="1.8" ry="2.2" fill="#1A1A2E"/>
      <circle cx="25" cy="22.5" r="0.8" fill="white" opacity="0.7"/>
      <circle cx="37" cy="22.5" r="0.8" fill="white" opacity="0.7"/>
      <!-- 鼻子 -->
      <path d="M31 28.5 L32 29.5 L33 28.5" stroke="#E8A0A0" stroke-width="1" fill="none"/>
      <!-- 嘴 -->
      <path d="M29 30.5 Q32 32.5 35 30.5" stroke="#D4A0A0" stroke-width="0.8" fill="none"/>
      <!-- 胡须 -->
      <line x1="12" y1="26" x2="22" y2="28" stroke="#C0B0A0" stroke-width="0.5"/>
      <line x1="12" y1="29" x2="22" y2="29" stroke="#C0B0A0" stroke-width="0.5"/>
      <line x1="12" y1="32" x2="22" y2="30" stroke="#C0B0A0" stroke-width="0.5"/>
      <line x1="52" y1="26" x2="42" y2="28" stroke="#C0B0A0" stroke-width="0.5"/>
      <line x1="52" y1="29" x2="42" y2="29" stroke="#C0B0A0" stroke-width="0.5"/>
      <line x1="52" y1="32" x2="42" y2="30" stroke="#C0B0A0" stroke-width="0.5"/>
      <defs>
        <radialGradient id="bodyShade" cx="0.5" cy="0.3" r="0.7">
          <stop offset="0%" stop-color="transparent"/>
          <stop offset="100%" stop-color="#000"/>
        </radialGradient>
      </defs>
    </svg>`,
    sleep: `<svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
      <!-- 尾巴 -->
      <path d="M48 44 Q54 42 52 36" stroke="#C4A882" stroke-width="3.5" fill="none" stroke-linecap="round"/>
      <!-- 身体 - 趴着 -->
      <ellipse cx="32" cy="46" rx="18" ry="10" fill="#F5E6D3"/>
      <!-- 前爪 -->
      <ellipse cx="22" cy="52" rx="4.5" ry="3" fill="#FAF0E6"/>
      <ellipse cx="42" cy="52" rx="4.5" ry="3" fill="#FAF0E6"/>
      <!-- 头 -->
      <ellipse cx="32" cy="32" rx="15" ry="13" fill="#FAF0E6"/>
      <!-- 面罩 -->
      <path d="M24 28 Q32 22 40 28 Q38 34 32 36 Q26 34 24 28" fill="#C4A882" opacity="0.45"/>
      <!-- 耳朵 -->
      <path d="M19 22 L15 10 L25 19 Z" fill="#C4A882"/>
      <path d="M45 22 L49 10 L39 19 Z" fill="#C4A882"/>
      <path d="M20 20 L17 13 L24 18 Z" fill="#F0C8C8" opacity="0.5"/>
      <path d="M44 20 L47 13 L40 18 Z" fill="#F0C8C8" opacity="0.5"/>
      <!-- 闭眼 -->
      <path d="M22 30 Q26 27 30 30" stroke="#1A1A2E" stroke-width="1.2" fill="none"/>
      <path d="M34 30 Q38 27 42 30" stroke="#1A1A2E" stroke-width="1.2" fill="none"/>
      <!-- 鼻子 -->
      <path d="M31 33 L32 34 L33 33" stroke="#E8A0A0" stroke-width="1" fill="none"/>
    </svg>`
  };

  // 设置猫的SVG
  function setCatSVG(state) {
    if (state === 'sleep') {
      sprite.innerHTML = catSVGs.sleep;
    } else {
      sprite.innerHTML = catSVGs.sit;
    }
  }

  // 猫的状态
  const catState = {
    x: Math.min(window.innerWidth - 100, Math.floor(window.innerWidth * 0.6)),
    y: -1, // 用bottom定位，初始-1表示尚未设置
    targetX: 0,
    targetY: 0,
    state: 'sit',
    speed: 1.2,
    stateTimer: null,
    speechTimer: null,
    lastInteraction: Date.now()
  };

  // 初始位置 — 用安全的top值
  cat.style.left = catState.x + 'px';
  catState.y = Math.min(window.innerHeight - 100, Math.max(60, window.innerHeight * 0.75));
  cat.style.top = catState.y + 'px';
  cat.style.bottom = 'auto';
  cat.style.right = 'auto';
  setCatSVG('sit');
  console.log('🐱 布偶猫已就位 x=' + catState.x + ' y=' + catState.y + ' viewport=' + window.innerWidth + 'x' + window.innerHeight);

  // 猫的台词
  const catLines = [
    '喵~', '嗯？', '别摸我...', '今天也辛苦了',
    '想吃小鱼干', '呼噜噜~', '...', '别吵，在睡觉',
    '你好呀', '喵呜~', '困了...', '摸摸头',
    '哼，不理你', '要贴贴吗', '今天的月亮好看吗'
  ];

  function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function setCatState(newState) {
    catState.state = newState;
    cat.dataset.state = newState;
    setCatSVG(newState);
  }

  function say(text) {
    speech.textContent = text || pick(catLines);
    speech.style.display = 'block';
    clearTimeout(catState.speechTimer);
    catState.speechTimer = setTimeout(() => { speech.style.display = 'none'; }, 2500);
  }

  function moveCat() {
    const dx = catState.targetX - catState.x;
    const dy = catState.targetY - catState.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist < 5) {
      const idleStates = ['sit', 'sit', 'sit', 'groom', 'groom'];
      setCatState(pick(idleStates));
      scheduleNext();
      return;
    }

    const step = Math.min(catState.speed, dist);
    const angle = Math.atan2(dy, dx);

    catState.x += Math.cos(angle) * step;
    catState.y += Math.sin(angle) * step;

    catState.x = Math.max(10, Math.min(window.innerWidth - 70, catState.x));
    catState.y = Math.max(60, Math.min(window.innerHeight - 70, catState.y));

    cat.style.left = catState.x + 'px';
    cat.style.top = catState.y + 'px';

    if (dx > 0) {
      setCatState('walk-right');
    } else {
      setCatState('walk-left');
    }

    requestAnimationFrame(moveCat);
  }

  function scheduleNext() {
    clearTimeout(catState.stateTimer);
    const idleTime = Date.now() - catState.lastInteraction;
    let delay;

    if (idleTime > 120000 && catState.state !== 'sleep') {
      delay = randInt(3000, 8000);
      catState.stateTimer = setTimeout(() => {
        setCatState('sleep');
        scheduleNext();
      }, delay);
      return;
    }

    if (catState.state === 'sleep') {
      delay = randInt(10000, 25000);
      catState.stateTimer = setTimeout(() => {
        say('伸个懒腰~');
        setTimeout(() => { pickNewTarget(); }, 1500);
      }, delay);
      return;
    }

    delay = randInt(3000, 12000);
    catState.stateTimer = setTimeout(() => {
      const action = Math.random();
      if (action < 0.6) {
        pickNewTarget();
      } else if (action < 0.8) {
        setCatState('sit');
        scheduleNext();
      } else {
        setCatState('groom');
        scheduleNext();
      }
    }, delay);
  }

  function pickNewTarget() {
    catState.targetX = randInt(40, window.innerWidth - 100);
    catState.targetY = randInt(70, window.innerHeight - 80);
    moveCat();
  }

  cat.addEventListener('click', (e) => {
    e.stopPropagation();
    catState.lastInteraction = Date.now();

    if (catState.state === 'sleep') {
      say('嗯...别吵...');
      setTimeout(() => {
        setCatState('sit');
        say(pick(catLines));
      }, 800);
      return;
    }

    cat.classList.add('jumping');
    setTimeout(() => cat.classList.remove('jumping'), 400);
    say();
  });

  cat.addEventListener('dblclick', (e) => {
    e.stopPropagation();
    say('别碰我!');
    catState.targetX = randInt(40, window.innerWidth - 100);
    catState.targetY = randInt(70, window.innerHeight - 80);
    catState.speed = 3;
    moveCat();
    setTimeout(() => { catState.speed = 1.2; }, 2000);
  });

  window.addEventListener('resize', () => {
    catState.x = Math.min(catState.x, window.innerWidth - 70);
    catState.y = Math.min(catState.y, window.innerHeight - 70);
    cat.style.left = catState.x + 'px';
    cat.style.top = catState.y + 'px';
  });

  setTimeout(() => {
    setCatState('sit');
    say('喵~');
    scheduleNext();
  }, 1500);

  }, 600); // setTimeout 600ms 延迟初始化
})();
