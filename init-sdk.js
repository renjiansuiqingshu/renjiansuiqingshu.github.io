// 腾讯云开发 REST API 直连版（无需 SDK，零额外下载）
// 替代 cloudbase-sdk.mjs + @cloudbase/* 依赖链

const ENV_ID = 'renjiansuiqingshu-d0d8b11638ca9a';
const ACCESS_KEY = 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjlkMWRjMzFlLWI0ZDAtNDQ4Yi1hNzZmLWIwY2M2M2Q4MTQ5OCJ9.eyJpc3MiOiJodHRwczovL3JlbmppYW5zdWlxaW5nc2h1LWQwZDhiMTE2MzhjYTlhLmFwLXNoYW5naGFpLnRjYi1hcGkudGVuY2VudGNsb3VkYXBpLmNvbSIsInN1YiI6ImFub24iLCJhdWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsImV4cCI6NDA4MDY0NzYwNywiaWF0IjoxNzc2OTY0NDA3LCJub25jZSI6IjMxYTVIbUVoU1FDdGkzeHpxb2dRNEEiLCJhdF9oYXNoIjoiMzFhNUhtRWhTUUN0aTN4enFvZ1E0QSIsIm5hbWUiOiJBbm9ueW1vdXMiLCJzY29wZSI6ImFub255bW91cyIsInByb2plY3RfaWQiOiJyZW5qaWFuc3VpcWluZ3NodS1kMGQ4YjExNjM4Y2E5YSIsIm1ldGEiOnsicGxhdGZvcm0iOiJQdWJsaXNoYWJsZUtleSJ9LCJ1c2VyX3R5cGUiOiIiLCJjbGllbnRfdHlwZSI6ImNsaWVudF91c2VyIiwiaXNfc3lzdGVtX2FkbWluIjpmYWxzZX0.fdgKvadnR3PQty2LBDYK_nu5RyBk43-2cEgV_yblPMydKGjvwMp1JL4IXmVp3Q_WzPlh7k2eiQd1V5jSHzYvFBbZXY2DMTVWft0mAxwV8bzwEv2-bHRkAPMnK2lHK96JHSRofFhh4Ra_eue5w1xvCAdOmNb9H664Gr4rEt1y9P_TOAYKQg74ojuYX45DUXSzIq9IJ0uv_s2YyXUPldJFa-0__vnQUToxfSppCqsBkRBke4oDRqcEmYaVIi2TL--zn1wNK3J41YbfMGkbyY63kLCcHyBBVjZ0_ZUrBeBSp9Tz0bTqb2OQshF2xBh02oG6LvZPBwxo0OxokTTc4PkbJg';

const API_BASE = `https://${ENV_ID}.ap-shanghai.tcb-api.tencentcloudapi.com/web`;

// ===== REST API 封装 =====
let _accessToken = ACCESS_KEY;

async function tcbRequest(action, data = {}) {
  const body = {
    action,
    dataVersion: '2020-01-10',
    env: ENV_ID,
    ...data
  };
  if (_accessToken) {
    body.access_token = _accessToken;
  }

  const resp = await fetch(API_BASE, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });

  if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
  const result = await resp.json();
  if (result.code && result.code !== 'SUCCESS') {
    throw new Error(result.message || result.code);
  }
  return result;
}

// ===== Auth 模块 =====
const auth = {
  async signInAnonymously() {
    const res = await tcbRequest('auth.signInAnonymously');
    if (res.access_token) _accessToken = res.access_token;
    return res;
  },
  async getLoginState() {
    try {
      const res = await tcbRequest('auth.getJwt');
      return { uid: res.uid, token: res.access_token };
    } catch (e) {
      return null;
    }
  },
  async signOut() {
    _accessToken = ACCESS_KEY;
  }
};

// ===== Database 模块 =====
function serverDate() {
  return { '$date': Date.now() };
}

// 命令操作符
const _ = {
  inc(val) { return { '$inc': val }; },
  set(val) { return { '$set': val }; },
  remove() { return { '$remove': true }; },
  gte(val) { return { '$gte': val instanceof Date ? val.getTime() : val }; },
  lte(val) { return { '$lte': val instanceof Date ? val.getTime() : val }; },
  eq(val) { return { '$eq': val }; },
  neq(val) { return { '$ne': val }; },
  in(val) { return { '$in': val }; }
};

class Query {
  constructor(collectionName, conditions = [], options = {}) {
    this._collection = collectionName;
    this._conditions = conditions;
    this._orderBy = options.orderBy || null;
    this._limit = options.limit || 100;
    this._skip = options.skip || 0;
  }

  where(cond) {
    return new Query(this._collection, [...this._conditions, cond], {
      orderBy: this._orderBy,
      limit: this._limit,
      skip: this._skip
    });
  }

  orderBy(field, direction = 'asc') {
    return new Query(this._collection, this._conditions, {
      orderBy: { field, direction },
      limit: this._limit,
      skip: this._skip
    });
  }

  limit(n) {
    return new Query(this._collection, this._conditions, {
      orderBy: this._orderBy,
      limit: n,
      skip: this._skip
    });
  }

  skip(n) {
    return new Query(this._collection, this._conditions, {
      orderBy: this._orderBy,
      limit: this._limit,
      skip: n
    });
  }

  async get() {
    const query = {};
    for (const cond of this._conditions) {
      Object.assign(query, cond);
    }
    const data = {
      collectionName: this._collection,
      query: JSON.stringify(query),
      limit: this._limit,
      skip: this._skip
    };
    if (this._orderBy) {
      data.order = `${this._orderBy.field} ${this._orderBy.direction}`;
    }
    const res = await tcbRequest('database.query', data);
    return { data: res.data || res.list || [] };
  }

  async count() {
    const query = {};
    for (const cond of this._conditions) {
      Object.assign(query, cond);
    }
    const res = await tcbRequest('database.count', {
      collectionName: this._collection,
      query: JSON.stringify(query)
    });
    return { total: res.total || res.count || 0 };
  }
}

class DocRef {
  constructor(collectionName, docId) {
    this._collection = collectionName;
    this._id = docId;
  }

  async get() {
    const res = await tcbRequest('database.query', {
      collectionName: this._collection,
      query: JSON.stringify({ _id: this._id })
    });
    return { data: res.data || res.list || [] };
  }

  async update(data) {
    return tcbRequest('database.update', {
      collectionName: this._collection,
      query: JSON.stringify({ _id: this._id }),
      data: JSON.stringify(data)
    });
  }

  async remove() {
    return tcbRequest('database.delete', {
      collectionName: this._collection,
      query: JSON.stringify({ _id: this._id })
    });
  }
}

class CollectionRef {
  constructor(name) {
    this._name = name;
  }

  doc(id) {
    return new DocRef(this._name, id);
  }

  where(cond) {
    return new Query(this._name).where(cond);
  }

  orderBy(field, direction = 'asc') {
    return new Query(this._name).orderBy(field, direction);
  }

  limit(n) {
    return new Query(this._name).limit(n);
  }

  async add(data) {
    const res = await tcbRequest('database.add', {
      collectionName: this._name,
      data: JSON.stringify([data])
    });
    return { _id: res.id_list ? res.id_list[0] : res._id };
  }

  async count() {
    return new Query(this._name).count();
  }
}

const db = {
  collection(name) { return new CollectionRef(name); },
  serverDate,
  command: _
};

// ===== 初始化 =====
async function init() {
  try {
    await auth.signInAnonymously();
    window.__tcb = { app: null, auth, db, _ };
    window.__tcbReady = true;
    window.dispatchEvent(new Event('tcb-ready'));
    console.log('✅ REST API 直连初始化成功（无需 SDK）');
  } catch (e) {
    console.error('❌ 初始化失败:', e);
    window.__tcbError = e.message;
    window.dispatchEvent(new Event('tcb-error'));
    document.addEventListener('DOMContentLoaded', () => {
      const el = document.createElement('div');
      el.style.cssText = 'position:fixed;top:0;left:0;right:0;background:#f44336;color:white;padding:12px;z-index:9999;font-size:14px;text-align:center';
      el.textContent = '初始化失败: ' + e.message;
      document.body.prepend(el);
    });
  }
}

init();
