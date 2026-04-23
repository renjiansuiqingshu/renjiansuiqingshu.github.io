// ===== 腾讯云开发配置 =====
// SDK 通过 init-sdk.js (ESM) 加载新版 @cloudbase/js-sdk
let app, auth, db, _;

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
  loginType: 'anonymous' // anonymous, wechat, custom
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
  $('#themeToggle').textContent = state.theme === 'dark' ? '☀️' : '🌙';
}

$('#themeToggle').addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('theme', state.theme);
  initTheme();
});

// ===== 认证 =====
async function initAuth() {
  try {
    // 匿名登录（默认方式）
    await auth.signInAnonymously();
    const loginState = await auth.getLoginState();
    state.currentUser = loginState;
    state.loginType = 'anonymous';
    updateUserUI();
  } catch (err) {
    console.error('匿名登录失败:', err);
    toast('匿名登录失败: ' + (err.message || err.code || JSON.stringify(err)), 'error');
  }
}

function updateUserUI() {
  if (state.currentUser && state.loginType !== 'anonymous') {
    $('#loginBtn').style.display = 'none';
    $('#userAvatar').style.display = 'flex';
    $('#avatarImg').src = state.currentUser.userInfo?.avatarUrl || '';
    $('#userName').textContent = state.currentUser.userInfo?.nickName || '用户';
  } else {
    $('#loginBtn').style.display = 'block';
    $('#userAvatar').style.display = 'none';
  }
}

// 微信登录（需要配置微信开放平台）
$('#loginBtn').addEventListener('click', async () => {
  try {
    // 方式1：微信公众号登录（推荐）
    const authInstance = app.auth();
    if (typeof authInstance.weixinAuthProvider === 'function') {
      // ⚠️ 替换为你的微信开放平台 appid
      const provider = authInstance.weixinAuthProvider({
        appid: 'wxYOUR_APPID',
        scope: 'snsapi_userinfo'
      });
      await provider.signIn();
      const loginState = await auth.getLoginState();
      state.currentUser = loginState;
      state.loginType = 'wechat';
      updateUserUI();
      checkAdmin(loginState.uid);
      toast('登录成功！', 'success');
      return;
    }

    // 方式2：自定义登录（token 方式）
    toast('请使用微信扫码登录', 'info');
  } catch (err) {
    if (err.message !== 'user cancel') {
      toast('登录失败：' + err.message, 'error');
    }
  }
});

$('#logoutBtn').addEventListener('click', async () => {
  await auth.signOut();
  // 重新匿名登录
  await auth.signInAnonymously();
  state.currentUser = await auth.getLoginState();
  state.loginType = 'anonymous';
  state.isAdmin = false;
  $('#adminBtn').style.display = 'none';
  updateUserUI();
  toast('已退出登录');
});

async function checkAdmin(uid) {
  try {
    const res = await db.collection('admins').where({ uid }).get();
    if (res.data.length > 0) {
      state.isAdmin = true;
      $('#adminBtn').style.display = 'block';
    }
  } catch (e) {
    // 静默失败
  }
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
  if (file.size > 5 * 1024 * 1024) {
    toast('图片不能超过 5MB', 'error');
    return;
  }
  state.selectedImage = file;
  const reader = new FileReader();
  reader.onload = (ev) => {
    $('#previewImg').src = ev.target.result;
    $('#imageUploadArea').style.display = 'block';
  };
  reader.readAsDataURL(file);
});

$('#removeImg').addEventListener('click', () => {
  state.selectedImage = null;
  $('#imageUploadArea').style.display = 'none';
  $('#imageInput').value = '';
});

// ===== 字数统计 =====
$('#secretInput').addEventListener('input', (e) => {
  $('#charCount').textContent = e.target.value.length;
});

// ===== 上传图片到云存储 =====
async function uploadImage(file) {
  const ext = file.name.split('.').pop() || 'jpg';
  const cloudPath = `images/${Date.now()}_${Math.random().toString(36).substr(2, 8)}.${ext}`;
  
  try {
    const result = await app.uploadFile({
      cloudPath,
      filePath: file
    });
    // 获取文件访问链接
    const urlResult = await app.getTempFileURL({
      fileList: [result.fileID]
    });
    return urlResult.fileList[0].tempFileURL || result.fileID;
  } catch (err) {
    console.error('图片上传失败:', err);
    throw err;
  }
}

// ===== 发布秘密 =====
$('#submitBtn').addEventListener('click', async () => {
  const content = $('#secretInput').value.trim();
  if (!content && !state.selectedImage) {
    toast('写点什么再投进树洞吧', 'error');
    return;
  }

  const btn = $('#submitBtn');
  btn.disabled = true;
  btn.textContent = '投递中...';

  try {
    let imageUrl = null;
    if (state.selectedImage) {
      imageUrl = await uploadImage(state.selectedImage);
    }

    const deviceId = getDeviceId();
    const post = {
      content: content || '(图片)',
      emoji: state.selectedEmoji,
      category: $('#categorySelect').value,
      imageUrl: imageUrl || null,
      authorUid: state.currentUser?.uid || null,
      authorName: state.currentUser?.userInfo?.nickName || generateAnonName(),
      authorAvatar: state.currentUser?.userInfo?.avatarUrl || null,
      deviceId,
      likes: 0,
      commentCount: 0,
      reportCount: 0,
      createdAt: db.serverDate(),
      status: 'active'
    };

    await db.collection('posts').add(post);

    // 清空表单
    $('#secretInput').value = '';
    $('#charCount').textContent = '0';
    state.selectedImage = null;
    $('#imageUploadArea').style.display = 'none';
    $('#imageInput').value = '';

    toast('秘密已投进树洞 🌳', 'success');
    loadPosts(true);
  } catch (err) {
    console.error('投递失败详情:', err);
    toast('投递失败：' + (err.message || err.code || JSON.stringify(err)), 'error');
  } finally {
    btn.disabled = false;
    btn.textContent = '投进树洞 🌳';
  }
});

// ===== 分类筛选 =====
$$('.cat-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.cat-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentCategory = btn.dataset.cat;
    loadPosts(true);
  });
});

// ===== 排序切换 =====
$$('.sort-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    $$('.sort-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    state.currentSort = btn.dataset.sort;
    loadPosts(true);
  });
});

// ===== 加载帖子 =====
async function loadPosts(reset = false) {
  if (reset) {
    state.posts = [];
    state.hasMore = true;
    $('#postsList').innerHTML = '';
    $('#emptyState').style.display = 'none';
  }

  if (!state.hasMore) return;

  try {
    let query = db.collection('posts')
      .where({ status: 'active' });

    if (state.currentCategory !== '全部') {
      query = query.where({ category: state.currentCategory });
    }

    // 排序 + 分页
    const orderByField = state.currentSort === 'latest' ? 'createdAt' : 'likes';
    const orderDirection = 'desc';

    query = query.orderBy(orderByField, orderDirection);

    if (state.posts.length > 0 && !reset) {
      const lastPost = state.posts[state.posts.length - 1];
      query = query.skip(state.posts.length);
    }

    query = query.limit(state.pageSize);
    const res = await query.get();

    if (res.data.length === 0 && state.posts.length === 0) {
      $('#emptyState').style.display = 'block';
      $('#loadMore').style.display = 'none';
      return;
    }

    $('#emptyState').style.display = 'none';

    res.data.forEach(post => {
      state.posts.push(post);
      renderPost(post);
    });

    state.hasMore = res.data.length === state.pageSize;
    $('#loadMore').style.display = state.hasMore ? 'block' : 'none';

  } catch (err) {
    console.error('加载失败:', err);
    toast('加载失败，请刷新重试', 'error');
  }
}

function renderPost(post) {
  const card = document.createElement('div');
  card.className = 'post-card';
  card.dataset.id = post._id;

  const isLiked = state.likedPosts.has(post._id);
  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();

  card.innerHTML = `
    <div class="post-header">
      <div class="post-meta">
        <span class="post-emoji">${post.emoji || '☁️'}</span>
        <span>${post.authorName || '匿名'}</span>
        <span class="post-category">${post.category || '随想'}</span>
        <span class="post-time">${timeAgo(createdAt)}</span>
      </div>
      <button class="post-more" data-id="${post._id}" title="更多">⋯</button>
    </div>
    <div class="post-content">${escapeHtml(post.content)}</div>
    ${post.imageUrl ? `<div class="post-image"><img src="${post.imageUrl}" alt="秘密图片" loading="lazy"></div>` : ''}
    <div class="post-actions">
      <button class="post-action ${isLiked ? 'liked' : ''}" data-action="like" data-id="${post._id}">
        <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
        <span>${post.likes || 0}</span>
      </button>
      <button class="post-action" data-action="comment" data-id="${post._id}">
        <span class="icon">💬</span>
        <span>${post.commentCount || 0}</span>
      </button>
      <button class="btn-report" data-action="report" data-id="${post._id}">🚩 举报</button>
    </div>
  `;

  // 点击卡片打开详情
  card.addEventListener('click', (e) => {
    if (e.target.closest('.post-action') || e.target.closest('.post-more') || e.target.closest('.btn-report')) return;
    openPostDetail(post._id);
  });

  // 操作按钮
  card.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      handleAction(btn.dataset.action, btn.dataset.id);
    });
  });

  // 更多按钮
  card.querySelector('.post-more').addEventListener('click', (e) => {
    e.stopPropagation();
    showPostMenu(post._id);
  });

  $('#postsList').appendChild(card);
}

// ===== 操作处理 =====
async function handleAction(action, postId) {
  switch (action) {
    case 'like':
      await toggleLike(postId);
      break;
    case 'comment':
      openPostDetail(postId);
      break;
    case 'report':
      await reportPost(postId);
      break;
  }
}

async function toggleLike(postId) {
  const isLiked = state.likedPosts.has(postId);

  try {
    if (isLiked) {
      await db.collection('posts').doc(postId).update({
        likes: _.inc(-1)
      });
      state.likedPosts.delete(postId);
    } else {
      await db.collection('posts').doc(postId).update({
        likes: _.inc(1)
      });
      state.likedPosts.add(postId);
    }
    localStorage.setItem('likedPosts', JSON.stringify([...state.likedPosts]));

    // 更新 UI
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (card) {
      const btn = card.querySelector('[data-action="like"]');
      const icon = btn.querySelector('.icon');
      const count = btn.querySelector('span:last-child');
      const newCount = parseInt(count.textContent) + (isLiked ? -1 : 1);
      btn.classList.toggle('liked');
      icon.textContent = isLiked ? '🤍' : '❤️';
      count.textContent = Math.max(0, newCount);
    }
  } catch (err) {
    toast('操作失败', 'error');
  }
}

async function reportPost(postId) {
  if (!confirm('确定要举报这条秘密吗？')) return;

  try {
    await db.collection('reports').add({
      postId,
      reportedBy: state.currentUser?.uid || getDeviceId(),
      reason: 'inappropriate',
      createdAt: db.serverDate(),
      status: 'pending'
    });
    await db.collection('posts').doc(postId).update({
      reportCount: _.inc(1)
    });
    toast('举报已提交，感谢反馈', 'success');
  } catch (err) {
    toast('举报失败', 'error');
  }
}

function showPostMenu(postId) {
  const post = state.posts.find(p => p._id === postId);
  const isOwner = post?.deviceId === getDeviceId();
  const actions = [];

  if (isOwner || state.isAdmin) {
    actions.push({ label: '🗑️ 删除', action: () => deletePost(postId) });
  }
  if (!isOwner) {
    actions.push({ label: '🚩 举报', action: () => reportPost(postId) });
  }

  if (actions.length === 0) return;

  const menu = document.createElement('div');
  menu.style.cssText = `
    position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
    background: var(--bg-secondary); border-radius: 12px; padding: 8px;
    z-index: 300; box-shadow: var(--shadow); border: 1px solid var(--border);
    min-width: 160px;
  `;
  actions.forEach(a => {
    const btn = document.createElement('button');
    btn.textContent = a.label;
    btn.style.cssText = `
      display: block; width: 100%; padding: 10px 16px; background: none;
      border: none; color: var(--text-primary); font-size: 14px;
      cursor: pointer; text-align: left; border-radius: 8px;
    `;
    btn.onmouseover = () => btn.style.background = 'var(--bg-tertiary)';
    btn.onmouseout = () => btn.style.background = 'none';
    btn.onclick = () => { menu.remove(); overlay.remove(); a.action(); };
    menu.appendChild(btn);
  });

  const overlay = document.createElement('div');
  overlay.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;z-index:299;';
  overlay.onclick = () => { menu.remove(); overlay.remove(); };

  document.body.appendChild(overlay);
  document.body.appendChild(menu);
}

async function deletePost(postId) {
  if (!confirm('确定删除这条秘密吗？')) return;
  try {
    await db.collection('posts').doc(postId).update({ status: 'deleted' });
    const card = document.querySelector(`.post-card[data-id="${postId}"]`);
    if (card) card.remove();
    toast('已删除', 'success');
  } catch (err) {
    toast('删除失败', 'error');
  }
}

// ===== 帖子详情 & 评论 =====
async function openPostDetail(postId) {
  const post = state.posts.find(p => p._id === postId);
  if (!post) return;

  const createdAt = post.createdAt ? new Date(post.createdAt) : new Date();
  const isLiked = state.likedPosts.has(postId);

  const modalBody = $('#modalBody');
  modalBody.innerHTML = `
    <div class="modal-post">
      <div class="post-header">
        <div class="post-meta">
          <span class="post-emoji">${post.emoji || '☁️'}</span>
          <span>${post.authorName || '匿名'}</span>
          <span class="post-category">${post.category || '随想'}</span>
          <span class="post-time">${timeAgo(createdAt)}</span>
        </div>
      </div>
      <div class="post-content">${escapeHtml(post.content)}</div>
      ${post.imageUrl ? `<div class="post-image"><img src="${post.imageUrl}" alt=""></div>` : ''}
      <div class="post-actions">
        <button class="post-action ${isLiked ? 'liked' : ''}" data-action="like" data-id="${postId}">
          <span class="icon">${isLiked ? '❤️' : '🤍'}</span>
          <span>${post.likes || 0}</span>
        </button>
        <button class="post-action" data-action="comment">
          <span class="icon">💬</span>
          <span>${post.commentCount || 0}</span>
        </button>
      </div>
    </div>
    <div class="comments-section">
      <div class="comments-title">💬 评论</div>
      <div class="comment-input-wrap">
        <input class="comment-input" id="commentInput" placeholder="说点什么..." maxlength="500">
        <button class="btn-comment" id="submitComment">发送</button>
      </div>
      <div class="comments-list" id="commentsList">
        <div style="text-align:center;color:var(--text-muted);padding:20px;">加载中...</div>
      </div>
    </div>
  `;

  // 点赞
  const likeBtn = modalBody.querySelector('[data-action="like"]');
  if (likeBtn) {
    likeBtn.addEventListener('click', async () => {
      await toggleLike(postId);
      const res = await db.collection('posts').doc(postId).get();
      const updated = res.data[0];
      likeBtn.classList.toggle('liked');
      likeBtn.querySelector('.icon').textContent = state.likedPosts.has(postId) ? '❤️' : '🤍';
      likeBtn.querySelector('span:last-child').textContent = updated?.likes || 0;
    });
  }

  // 提交评论
  const submitComment = $('#submitComment');
  submitComment.addEventListener('click', async () => {
    const text = $('#commentInput').value.trim();
    if (!text) return;
    submitComment.disabled = true;

    try {
      await db.collection('comments').add({
        postId,
        content: text,
        authorUid: state.currentUser?.uid || null,
        authorName: state.currentUser?.userInfo?.nickName || generateAnonName(),
        authorAvatar: state.currentUser?.userInfo?.avatarUrl || null,
        deviceId: getDeviceId(),
        createdAt: db.serverDate()
      });

      await db.collection('posts').doc(postId).update({
        commentCount: _.inc(1)
      });

      $('#commentInput').value = '';
      toast('评论成功', 'success');
      loadComments(postId);
    } catch (err) {
      toast('评论失败', 'error');
    } finally {
      submitComment.disabled = false;
    }
  });

  // 回车发送
  $('#commentInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      submitComment.click();
    }
  });

  $('#postModal').style.display = 'flex';
  loadComments(postId);
}

async function loadComments(postId) {
  const list = $('#commentsList');
  try {
    const res = await db.collection('comments')
      .where({ postId })
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    if (res.data.length === 0) {
      list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">暂无评论，来说点什么吧</div>';
      return;
    }

    list.innerHTML = '';
    res.data.forEach(c => {
      const time = c.createdAt ? timeAgo(new Date(c.createdAt)) : '';
      const isOwner = c.deviceId === getDeviceId();

      const item = document.createElement('div');
      item.className = 'comment-item';
      item.innerHTML = `
        <div class="comment-avatar">${c.authorAvatar ? `<img src="${c.authorAvatar}" style="width:100%;height:100%;border-radius:50%">` : '👤'}</div>
        <div class="comment-body">
          <div class="comment-author">${escapeHtml(c.authorName || '匿名')}</div>
          <div class="comment-text">${escapeHtml(c.content)}</div>
          <div class="comment-time">${time}</div>
          <div class="comment-actions">
            ${isOwner || state.isAdmin ? `<button class="comment-action-btn" data-cid="${c._id}" data-pid="${postId}">删除</button>` : ''}
          </div>
        </div>
      `;

      // 删除评论
      const delBtn = item.querySelector('.comment-action-btn');
      if (delBtn) {
        delBtn.addEventListener('click', async () => {
          if (!confirm('删除这条评论？')) return;
          try {
            await db.collection('comments').doc(c._id).remove();
            await db.collection('posts').doc(postId).update({
              commentCount: _.inc(-1)
            });
            item.remove();
            toast('评论已删除', 'success');
          } catch (err) {
            toast('删除失败', 'error');
          }
        });
      }

      list.appendChild(item);
    });
  } catch (err) {
    list.innerHTML = '<div style="text-align:center;color:var(--text-muted);padding:20px;">加载评论失败</div>';
  }
}

// 关闭弹窗
$('#modalClose').addEventListener('click', () => {
  $('#postModal').style.display = 'none';
});
$('#postModal').addEventListener('click', (e) => {
  if (e.target === $('#postModal')) {
    $('#postModal').style.display = 'none';
  }
});

// ===== 管理后台 =====
$('#adminBtn').addEventListener('click', () => {
  $('#adminModal').style.display = 'flex';
  loadAdminContent('reports');
});

$('#adminModalClose').addEventListener('click', () => {
  $('#adminModal').style.display = 'none';
});
$('#adminModal').addEventListener('click', (e) => {
  if (e.target === $('#adminModal')) {
    $('#adminModal').style.display = 'none';
  }
});

$$('.admin-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    $$('.admin-tab').forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    loadAdminContent(tab.dataset.tab);
  });
});

async function loadAdminContent(tab) {
  const body = $('#adminBody');
  body.innerHTML = '<div style="text-align:center;padding:20px;color:var(--text-muted)">加载中...</div>';

  try {
    if (tab === 'reports') {
      const res = await db.collection('reports')
        .where({ status: 'pending' })
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      if (res.data.length === 0) {
        body.innerHTML = '<div style="text-align:center;padding:40px;color:var(--text-muted)">🎉 暂无待处理的举报</div>';
        return;
      }

      body.innerHTML = '';
      for (const report of res.data) {
        let postContent = '(已删除)';
        let postData = null;
        try {
          const postRes = await db.collection('posts').doc(report.postId).get();
          if (postRes.data.length > 0) {
            postData = postRes.data[0];
            postContent = postData.content?.substring(0, 100) || '(图片)';
          }
        } catch (e) {}

        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div class="admin-item-header">
            <span style="color:var(--accent);font-weight:600">🚩 举报</span>
            <span style="color:var(--text-muted);font-size:12px">${report.createdAt ? timeAgo(new Date(report.createdAt)) : ''}</span>
          </div>
          <div class="admin-item-content">
            <strong>被举报内容：</strong>${escapeHtml(postContent)}
            ${postData?.imageUrl ? '<br><em>(含图片)</em>' : ''}
          </div>
          <div class="admin-item-actions">
            <button class="admin-btn admin-btn-dismiss" data-id="${report._id}">忽略</button>
            <button class="admin-btn admin-btn-delete" data-pid="${report.postId}" data-rid="${report._id}">删除内容</button>
          </div>
        `;

        // 忽略举报
        item.querySelector('.admin-btn-dismiss').addEventListener('click', async () => {
          await db.collection('reports').doc(report._id).update({ status: 'dismissed' });
          item.remove();
          toast('已忽略', 'success');
        });

        // 删除内容
        item.querySelector('.admin-btn-delete').addEventListener('click', async () => {
          if (!confirm('确定删除该内容？')) return;
          await db.collection('posts').doc(report.postId).update({ status: 'deleted' });
          await db.collection('reports').doc(report._id).update({ status: 'resolved' });
          item.remove();
          toast('内容已删除', 'success');
          loadPosts(true);
        });

        body.appendChild(item);
      }

    } else if (tab === 'posts') {
      const res = await db.collection('posts')
        .orderBy('createdAt', 'desc')
        .limit(50)
        .get();

      body.innerHTML = '';
      res.data.forEach(post => {
        if (post.status === 'deleted') return;

        const item = document.createElement('div');
        item.className = 'admin-item';
        item.innerHTML = `
          <div class="admin-item-header">
            <span>${post.emoji || '☁️'} ${post.authorName || '匿名'}</span>
            <span style="color:var(--text-muted);font-size:12px">
              ❤️${post.likes || 0} 💬${post.commentCount || 0} ${post.reportCount ? '🚩' + post.reportCount : ''}
            </span>
          </div>
          <div class="admin-item-content">${escapeHtml((post.content || '').substring(0, 150))}</div>
          <div class="admin-item-actions">
            <button class="admin-btn admin-btn-delete" data-pid="${post._id}">删除</button>
          </div>
        `;

        item.querySelector('.admin-btn-delete').addEventListener('click', async () => {
          if (!confirm('确定删除？')) return;
          await db.collection('posts').doc(post._id).update({ status: 'deleted' });
          item.remove();
          toast('已删除', 'success');
          loadPosts(true);
        });

        body.appendChild(item);
      });
    }
  } catch (err) {
    body.innerHTML = `<div style="text-align:center;padding:20px;color:#f44336">加载失败：${err.message}</div>`;
  }
}

// ===== 加载更多 =====
$('#loadMoreBtn').addEventListener('click', () => loadPosts(false));

// ===== 统计更新 =====
async function updateStats() {
  try {
    // 总数
    const totalRes = await db.collection('posts')
      .where({ status: 'active' })
      .count();
    $('#totalCount').textContent = totalRes.total || 0;

    // 今日
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayRes = await db.collection('posts')
      .where({
        status: 'active',
        createdAt: _.gte(today)
      })
      .count();
    $('#todayCount').textContent = todayRes.total || 0;
  } catch (err) {
    // 静默失败
  }
}

// 定时刷新统计
setInterval(updateStats, 30000);

// ===== 键盘快捷键 =====
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    $('#postModal').style.display = 'none';
    $('#adminModal').style.display = 'none';
  }
});

// ===== 初始化 =====
// 等待新版 SDK 加载完成
function waitForTcb() {
  return new Promise((resolve, reject) => {
    if (window.__tcbReady) return resolve();
    if (window.__tcbError) return reject(new Error(window.__tcbError));
    window.addEventListener('tcb-ready', resolve, { once: true });
    window.addEventListener('tcb-error', () => reject(new Error(window.__tcbError || 'SDK加载失败')), { once: true });
    setTimeout(() => reject(new Error('SDK 加载超时')), 30000);
  });
}

document.addEventListener('DOMContentLoaded', async () => {
  initTheme();
  try {
    await waitForTcb();
    const tcb = window.__tcb;
    app = tcb.app;
    auth = tcb.auth;
    db = tcb.db;
    _ = tcb._;
    console.log('✅ SDK 就绪');
    await initAuth();
    loadPosts(true);
    updateStats();
  } catch (err) {
    console.error('❌ 初始化失败:', err);
    toast('初始化失败: ' + err.message, 'error');
  }
});
