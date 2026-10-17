const STORAGE_KEY = 'subsc_manager_items_v1';
const CATEGORY_STORAGE_KEY = 'subsc_manager_categories_v1';
const PAYMENT_STORAGE_KEY = 'subsc_manager_payments_v1';

// 標準カテゴリ一覧
const DEFAULT_CATEGORIES = [
  { id: 'entertainment', icon: '🎬', label: '動画・エンタメ', isDefault: true },
  { id: 'music', icon: '🎵', label: '音楽・音声', isDefault: true },
  { id: 'work', icon: '💻', label: '仕事・クラウド・AI', isDefault: true },
  { id: 'lifestyle', icon: '🛍️', label: 'ショッピング・生活', isDefault: true },
  { id: 'game', icon: '🎮', label: 'ゲーム', isDefault: true },
  { id: 'book', icon: '📚', label: '書籍・雑誌・学習', isDefault: true },
  { id: 'fitness', icon: '💪', label: '健康・フィットネス', isDefault: true },
  { id: 'beauty', icon: '✨', label: '美容・ファッション', isDefault: true },
  { id: 'food', icon: '☕', label: 'グルメ・カフェ・食品', isDefault: true },
  { id: 'infra', icon: '📱', label: '通信・スマホ・インフラ', isDefault: true },
  { id: 'oshikatsu', icon: '💖', label: 'ファンクラブ・推し活', isDefault: true },
  { id: 'other', icon: '📦', label: 'その他', isDefault: true },
];

// 標準支払い方法一覧
const DEFAULT_PAYMENTS = [
  { id: 'credit_main', icon: '💳', label: 'メインクレカ', isDefault: true },
  { id: 'credit_sub', icon: '💳', label: 'サブクレカ', isDefault: true },
  { id: 'apple_pay', icon: '🍎', label: 'Apple Pay / App Store', isDefault: true },
  { id: 'google_pay', icon: '🤖', label: 'Google Play / Google Pay', isDefault: true },
  { id: 'paypay', icon: '📱', label: 'PayPay', isDefault: true },
  { id: 'rakuten_pay', icon: '🛍️', label: '楽天ペイ / 楽天カード', isDefault: true },
  { id: 'carrier', icon: '📶', label: 'キャリア決済', isDefault: true },
  { id: 'bank', icon: '🏦', label: '口座振替（銀行引落）', isDefault: true },
  { id: 'paypal', icon: '🌐', label: 'PayPal', isDefault: true },
  { id: 'other_pay', icon: '❓', label: '未設定・その他', isDefault: true },
];

const EMOJI_PRESETS = [
  '🏷️', '🎬', '🎵', '💻', '🤖', '🎮', '📚', '💪', '✨', '☕',
  '📱', '💖', '🏠', '🚗', '🐾', '🎨', '📰', '👶', '✈️', '📦'
];

const PAYMENT_EMOJI_PRESETS = [
  '💳', '🏦', '🍎', '🤖', '📱', '🛍️', '📶', '🌐', '🪙', '💴', '💎', '❓'
];

// 初回起動時サンプルデータ
const DEFAULT_ITEMS = [
  {
    id: 'sample-1',
    name: 'Netflix (スタンダード)',
    price: 1590,
    billingCycle: 'monthly',
    category: 'entertainment',
    paymentMethod: 'credit_main',
    status: 'active',
    startedAt: '2025-04-01',
    canceledAt: null,
    memo: '動画配信サービス',
    createdAt: Date.now() - 300000,
  },
  {
    id: 'sample-2',
    name: 'Amazon Prime',
    price: 5900,
    billingCycle: 'yearly',
    category: 'lifestyle',
    paymentMethod: 'credit_main',
    status: 'active',
    startedAt: '2024-10-01',
    canceledAt: null,
    memo: '年額プラン（配送料無料・Prime Video）',
    createdAt: Date.now() - 200000,
  },
  {
    id: 'sample-3',
    name: 'Spotify Premium',
    price: 1080,
    billingCycle: 'monthly',
    category: 'music',
    paymentMethod: 'apple_pay',
    status: 'active',
    startedAt: '2026-01-15',
    canceledAt: null,
    memo: '個人プラン',
    createdAt: Date.now() - 100000,
  },
];

let subscriptions = [];
let categories = [];
let paymentMethods = [];
let currentFilter = 'all';
let currentCategoryFilter = 'all';
let currentPaymentFilter = 'all';
let currentSort = 'created-desc';
let currentCanceledSort = 'canceled-desc';
let isViewingCanceledPage = false;

// インライン編集中のID
let editingCategoryId = null;
let editingPaymentId = null;

// DOM Elements
const activePageView = document.getElementById('activePageView');
const canceledPageView = document.getElementById('canceledPageView');
const toggleCanceledPageBtn = document.getElementById('toggleCanceledPageBtn');
const canceledCountBadge = document.getElementById('canceledCountBadge');
const backToActiveBtn = document.getElementById('backToActiveBtn');
const addCanceledDirectlyBtn = document.getElementById('addCanceledDirectlyBtn');

const subscriptionListEl = document.getElementById('subscriptionList');
const emptyStateEl = document.getElementById('emptyState');
const monthlyTotalEl = document.getElementById('monthlyTotal');
const yearlyTotalEl = document.getElementById('yearlyTotal');
const activeCountEl = document.getElementById('activeCount');
const cycleBreakdownEl = document.getElementById('cycleBreakdown');

// 解約済み画面のDOM
const canceledSubscriptionListEl = document.getElementById('canceledSubscriptionList');
const canceledEmptyStateEl = document.getElementById('canceledEmptyState');
const canceledTotalCountEl = document.getElementById('canceledTotalCount');
const canceledMonthlySavedEl = document.getElementById('canceledMonthlySaved');
const canceledYearlySavedEl = document.getElementById('canceledYearlySaved');
const canceledSortSelect = document.getElementById('canceledSortSelect');

// サブスク登録・編集モーダルDOM
const modalOverlay = document.getElementById('modalOverlay');
const modalTitle = document.getElementById('modalTitle');
const subscriptionForm = document.getElementById('subscriptionForm');
const subIdInput = document.getElementById('subId');
const serviceNameInput = document.getElementById('serviceName');
const priceInput = document.getElementById('price');
const billingCycleInput = document.getElementById('billingCycle');
const startedDateInput = document.getElementById('startedDateInput');
const subStatusInput = document.getElementById('subStatus');
const canceledDateGroup = document.getElementById('canceledDateGroup');
const canceledDateInput = document.getElementById('canceledDateInput');
const categoryInput = document.getElementById('category');
const paymentMethodInput = document.getElementById('paymentMethod');
const memoInput = document.getElementById('memo');

// 解約手続きモーダルDOM
const cancelSubModalOverlay = document.getElementById('cancelSubModalOverlay');
const closeCancelSubModalBtn = document.getElementById('closeCancelSubModalBtn');
const abortCancelSubBtn = document.getElementById('abortCancelSubBtn');
const cancelSubForm = document.getElementById('cancelSubForm');
const cancelTargetSubId = document.getElementById('cancelTargetSubId');
const cancelTargetSubName = document.getElementById('cancelTargetSubName');
const confirmCancelDate = document.getElementById('confirmCancelDate');
const confirmCancelMemo = document.getElementById('confirmCancelMemo');

// クイックカテゴリ追加DOM
const toggleQuickCategoryBtn = document.getElementById('toggleQuickCategoryBtn');
const quickCategoryBox = document.getElementById('quickCategoryBox');
const quickCatIcon = document.getElementById('quickCatIcon');
const quickCatLabel = document.getElementById('quickCatLabel');
const addQuickCategoryBtn = document.getElementById('addQuickCategoryBtn');
const quickEmojiPresets = document.getElementById('quickEmojiPresets');

// クイック支払い方法追加DOM
const toggleQuickPaymentBtn = document.getElementById('toggleQuickPaymentBtn');
const quickPaymentBox = document.getElementById('quickPaymentBox');
const quickPayIcon = document.getElementById('quickPayIcon');
const quickPayLabel = document.getElementById('quickPayLabel');
const addQuickPaymentBtn = document.getElementById('addQuickPaymentBtn');
const quickPaymentEmojiPresets = document.getElementById('quickPaymentEmojiPresets');

// カテゴリ管理モーダルDOM
const openCategoryModalBtn = document.getElementById('openCategoryModalBtn');
const categoryModalOverlay = document.getElementById('categoryModalOverlay');
const closeCategoryModalBtn = document.getElementById('closeCategoryModalBtn');
const doneCategoryModalBtn = document.getElementById('doneCategoryModalBtn');
const categoryManageForm = document.getElementById('categoryManageForm');
const manageCatIcon = document.getElementById('manageCatIcon');
const manageCatLabel = document.getElementById('manageCatLabel');
const manageEmojiPresets = document.getElementById('manageEmojiPresets');
const categoryManageList = document.getElementById('categoryManageList');
const resetCategoriesBtn = document.getElementById('resetCategoriesBtn');

// 支払い方法管理モーダルDOM
const openPaymentModalBtn = document.getElementById('openPaymentModalBtn');
const paymentModalOverlay = document.getElementById('paymentModalOverlay');
const closePaymentModalBtn = document.getElementById('closePaymentModalBtn');
const donePaymentModalBtn = document.getElementById('donePaymentModalBtn');
const paymentManageForm = document.getElementById('paymentManageForm');
const managePayIcon = document.getElementById('managePayIcon');
const managePayLabel = document.getElementById('managePayLabel');
const managePaymentEmojiPresets = document.getElementById('managePaymentEmojiPresets');
const paymentManageList = document.getElementById('paymentManageList');
const resetPaymentsBtn = document.getElementById('resetPaymentsBtn');

// データ入出力モーダルDOM
const openDataModalBtn = document.getElementById('openDataModalBtn');
const dataModalOverlay = document.getElementById('dataModalOverlay');
const closeDataModalBtn = document.getElementById('closeDataModalBtn');
const doneDataModalBtn = document.getElementById('doneDataModalBtn');
const exportSummaryInfo = document.getElementById('exportSummaryInfo');
const exportJsonBtn = document.getElementById('exportJsonBtn');
const copyJsonBtn = document.getElementById('copyJsonBtn');
const exportCsvBtn = document.getElementById('exportCsvBtn');
const importModeSelect = document.getElementById('importModeSelect');
const importFileInput = document.getElementById('importFileInput');
const triggerImportFileBtn = document.getElementById('triggerImportFileBtn');
const importPasteTextarea = document.getElementById('importPasteTextarea');
const importFromTextBtn = document.getElementById('importFromTextBtn');
const dataFeedbackMsg = document.getElementById('dataFeedbackMsg');

const openModalBtn = document.getElementById('openModalBtn');
const emptyAddBtn = document.getElementById('emptyAddBtn');
const closeModalBtn = document.getElementById('closeModalBtn');
const cancelBtn = document.getElementById('cancelBtn');
const sortSelect = document.getElementById('sortSelect');
const categoryFilterSelect = document.getElementById('categoryFilterSelect');
const paymentFilterSelect = document.getElementById('paymentFilterSelect');
const filterChips = document.querySelectorAll('.chip');

function init() {
  loadCategories();
  loadPayments();
  loadFromStorage();

  renderEmojiPresets(quickEmojiPresets, quickCatIcon, EMOJI_PRESETS);
  renderEmojiPresets(manageEmojiPresets, manageCatIcon, EMOJI_PRESETS);
  renderEmojiPresets(quickPaymentEmojiPresets, quickPayIcon, PAYMENT_EMOJI_PRESETS);
  renderEmojiPresets(managePaymentEmojiPresets, managePayIcon, PAYMENT_EMOJI_PRESETS);

  renderCategoryOptions();
  renderPaymentOptions();
  renderAll();
  setupEventListeners();
}

function getTodayDateString() {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

function formatDateJP(dateStr) {
  if (!dateStr) return '日付未設定';
  const parts = dateStr.split('-');
  if (parts.length !== 3) return dateStr;
  return `${parts[0]}年${Number(parts[1])}月${Number(parts[2])}日`;
}

// 契約期間（開始日〜今日 または 開始日〜解約日）をわかりやすく計算
function calcDurationText(startDateStr, endDateStr = null) {
  if (!startDateStr) return '';
  const start = new Date(startDateStr + 'T00:00:00');
  const end = endDateStr ? new Date(endDateStr + 'T00:00:00') : new Date();
  if (isNaN(start.getTime()) || isNaN(end.getTime()) || end < start) return '';

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0 && months > 0) return `${years}年${months}ヶ月`;
  if (years > 0) return `${years}年`;
  if (months > 0) return `${months}ヶ月`;
  return `${Math.max(1, days)}日`;
}

function loadCategories() {
  try {
    const raw = localStorage.getItem(CATEGORY_STORAGE_KEY);
    if (!raw) {
      categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
      saveCategories();
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        categories = parsed;
      } else {
        categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
      }
      if (!categories.some((c) => c.id === 'other')) {
        categories.push({ id: 'other', icon: '📦', label: 'その他', isDefault: true });
      }
    }
  } catch (err) {
    console.error('カテゴリの読み込みに失敗しました:', err);
    categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
  }
}

function saveCategories() {
  localStorage.setItem(CATEGORY_STORAGE_KEY, JSON.stringify(categories));
}

function loadPayments() {
  try {
    const raw = localStorage.getItem(PAYMENT_STORAGE_KEY);
    if (!raw) {
      paymentMethods = DEFAULT_PAYMENTS.map((p) => ({ ...p }));
      savePayments();
    } else {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        paymentMethods = parsed;
      } else {
        paymentMethods = DEFAULT_PAYMENTS.map((p) => ({ ...p }));
      }
      if (!paymentMethods.some((p) => p.id === 'other_pay')) {
        paymentMethods.push({ id: 'other_pay', icon: '❓', label: '未設定・その他', isDefault: true });
      }
    }
  } catch (err) {
    console.error('支払い方法の読み込みに失敗しました:', err);
    paymentMethods = DEFAULT_PAYMENTS.map((p) => ({ ...p }));
  }
}

function savePayments() {
  localStorage.setItem(PAYMENT_STORAGE_KEY, JSON.stringify(paymentMethods));
}

function getCategoryById(catId) {
  return (
    categories.find((c) => c.id === catId) ||
    categories.find((c) => c.id === 'other') || {
      id: 'other',
      icon: '📦',
      label: 'その他',
    }
  );
}

function getPaymentById(payId) {
  return (
    paymentMethods.find((p) => p.id === payId) ||
    paymentMethods.find((p) => p.id === 'other_pay') || {
      id: 'other_pay',
      icon: '❓',
      label: '未設定・その他',
    }
  );
}

function renderEmojiPresets(container, targetInput, presetList) {
  container.innerHTML = '';
  presetList.forEach((emoji) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'emoji-btn';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      targetInput.value = emoji;
    });
    container.appendChild(btn);
  });
}

function renderCategoryOptions(selectedId = null) {
  const currentSelected = selectedId || categoryInput.value || 'entertainment';

  categoryInput.innerHTML = '';
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.label}`;
    categoryInput.appendChild(opt);
  });

  if (categories.some((c) => c.id === currentSelected)) {
    categoryInput.value = currentSelected;
  }

  const prevFilter = categoryFilterSelect.value || 'all';
  categoryFilterSelect.innerHTML = '<option value="all">すべて表示</option>';
  categories.forEach((cat) => {
    const opt = document.createElement('option');
    opt.value = cat.id;
    opt.textContent = `${cat.icon} ${cat.label}`;
    categoryFilterSelect.appendChild(opt);
  });

  if (prevFilter === 'all' || categories.some((c) => c.id === prevFilter)) {
    categoryFilterSelect.value = prevFilter;
  } else {
    currentCategoryFilter = 'all';
    categoryFilterSelect.value = 'all';
  }
}

function renderPaymentOptions(selectedId = null) {
  const currentSelected = selectedId || paymentMethodInput.value || 'credit_main';

  paymentMethodInput.innerHTML = '';
  paymentMethods.forEach((pay) => {
    const opt = document.createElement('option');
    opt.value = pay.id;
    opt.textContent = `${pay.icon} ${pay.label}`;
    paymentMethodInput.appendChild(opt);
  });

  if (paymentMethods.some((p) => p.id === currentSelected)) {
    paymentMethodInput.value = currentSelected;
  }

  const prevFilter = paymentFilterSelect.value || 'all';
  paymentFilterSelect.innerHTML = '<option value="all">すべて表示</option>';
  paymentMethods.forEach((pay) => {
    const opt = document.createElement('option');
    opt.value = pay.id;
    opt.textContent = `${pay.icon} ${pay.label}`;
    paymentFilterSelect.appendChild(opt);
  });

  if (prevFilter === 'all' || paymentMethods.some((p) => p.id === prevFilter)) {
    paymentFilterSelect.value = prevFilter;
  } else {
    currentPaymentFilter = 'all';
    paymentFilterSelect.value = 'all';
  }
}

function addNewCategory(iconStr, labelStr) {
  const label = labelStr.trim();
  const icon = iconStr.trim() || '🏷️';

  if (!label) return null;

  const newCat = {
    id: 'cat-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    icon,
    label,
    isDefault: false,
  };

  const otherIndex = categories.findIndex((c) => c.id === 'other');
  if (otherIndex !== -1) {
    categories.splice(otherIndex, 0, newCat);
  } else {
    categories.push(newCat);
  }

  saveCategories();
  renderCategoryOptions(newCat.id);
  renderCategoryManageList();
  return newCat;
}

function updateCategory(catId, newIconStr, newLabelStr) {
  const label = newLabelStr.trim();
  const icon = newIconStr.trim() || '🏷️';
  if (!label) return false;

  categories = categories.map((c) =>
    c.id === catId ? { ...c, icon, label } : c
  );

  saveCategories();
  editingCategoryId = null;
  renderCategoryOptions();
  renderCategoryManageList();
  renderAll();
  return true;
}

function addNewPayment(iconStr, labelStr) {
  const label = labelStr.trim();
  const icon = iconStr.trim() || '💳';

  if (!label) return null;

  const newPay = {
    id: 'pay-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6),
    icon,
    label,
    isDefault: false,
  };

  const otherIndex = paymentMethods.findIndex((p) => p.id === 'other_pay');
  if (otherIndex !== -1) {
    paymentMethods.splice(otherIndex, 0, newPay);
  } else {
    paymentMethods.push(newPay);
  }

  savePayments();
  renderPaymentOptions(newPay.id);
  renderPaymentManageList();
  return newPay;
}

function updatePayment(payId, newIconStr, newLabelStr) {
  const label = newLabelStr.trim();
  const icon = newIconStr.trim() || '💳';
  if (!label) return false;

  paymentMethods = paymentMethods.map((p) =>
    p.id === payId ? { ...p, icon, label } : p
  );

  savePayments();
  editingPaymentId = null;
  renderPaymentOptions();
  renderPaymentManageList();
  renderAll();
  return true;
}

function renderCategoryManageList() {
  categoryManageList.innerHTML = '';

  categories.forEach((cat) => {
    const usedCount = subscriptions.filter((s) => s.status !== 'canceled' && s.category === cat.id).length;
    const isEditing = editingCategoryId === cat.id;

    const row = document.createElement('div');
    row.className = 'category-manage-item' + (isEditing ? ' editing' : '');

    if (isEditing) {
      row.innerHTML = `
        <div class="inline-edit-group">
          <input
            type="text"
            class="inline-icon-input cat-edit-icon"
            value="${escapeHtml(cat.icon)}"
            maxlength="4"
            aria-label="カテゴリアイコン"
          />
          <input
            type="text"
            class="inline-label-input cat-edit-label"
            value="${escapeHtml(cat.label)}"
            maxlength="24"
            aria-label="カテゴリ名"
          />
        </div>
        <div class="manage-item-right">
          <button type="button" class="action-btn save cat-save-btn" data-id="${cat.id}">保存</button>
          <button type="button" class="action-btn cat-cancel-btn">取消</button>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="category-manage-left">
          <span>${escapeHtml(cat.icon)}</span>
          <span>${escapeHtml(cat.label)}</span>
          ${!cat.isDefault ? '<span class="category-badge-custom">カスタム</span>' : ''}
          <span style="font-size:0.75rem; color:var(--text-sub); font-weight:400;">(契約中 ${usedCount}件)</span>
        </div>
        <div class="manage-item-right">
          <button type="button" class="action-btn cat-edit-btn" data-id="${cat.id}">編集</button>
          ${
            cat.id !== 'other'
              ? `<button type="button" class="action-btn delete cat-delete-btn" data-id="${cat.id}">削除</button>`
              : `<span style="font-size:0.75rem; color:var(--text-sub); padding:0 4px;">標準</span>`
          }
        </div>
      `;
    }

    categoryManageList.appendChild(row);

    if (isEditing) {
      const labelInput = row.querySelector('.cat-edit-label');
      const iconInput = row.querySelector('.cat-edit-icon');
      if (labelInput) {
        labelInput.focus();
        labelInput.select();
      }
      const handleKey = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          updateCategory(cat.id, iconInput.value, labelInput.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          editingCategoryId = null;
          renderCategoryManageList();
        }
      };
      iconInput?.addEventListener('keydown', handleKey);
      labelInput?.addEventListener('keydown', handleKey);
    }
  });
}

function renderPaymentManageList() {
  paymentManageList.innerHTML = '';

  paymentMethods.forEach((pay) => {
    const matchedSubs = subscriptions.filter(
      (s) => s.status !== 'canceled' && (s.paymentMethod || 'other_pay') === pay.id
    );
    const usedCount = matchedSubs.length;
    const monthlySubtotal = matchedSubs.reduce((sum, s) => sum + getMonthlyEquivalent(s), 0);
    const isEditing = editingPaymentId === pay.id;

    const row = document.createElement('div');
    row.className = 'category-manage-item' + (isEditing ? ' editing' : '');

    if (isEditing) {
      row.innerHTML = `
        <div class="inline-edit-group">
          <input
            type="text"
            class="inline-icon-input pay-edit-icon"
            value="${escapeHtml(pay.icon)}"
            maxlength="4"
            aria-label="支払い方法アイコン"
          />
          <input
            type="text"
            class="inline-label-input pay-edit-label"
            value="${escapeHtml(pay.label)}"
            maxlength="28"
            aria-label="支払い方法名"
          />
        </div>
        <div class="manage-item-right">
          <button type="button" class="action-btn save pay-save-btn" data-id="${pay.id}">保存</button>
          <button type="button" class="action-btn pay-cancel-btn">取消</button>
        </div>
      `;
    } else {
      row.innerHTML = `
        <div class="category-manage-left">
          <span>${escapeHtml(pay.icon)}</span>
          <span>${escapeHtml(pay.label)}</span>
          ${!pay.isDefault ? '<span class="category-badge-custom">カスタム</span>' : ''}
          <span style="font-size:0.75rem; color:var(--text-sub); font-weight:400;">(契約中 ${usedCount}件)</span>
        </div>
        <div class="manage-item-right">
          <span class="payment-subtotal" title="この支払い方法の月額換算合計">月 ${formatYen(monthlySubtotal)}</span>
          <button type="button" class="action-btn pay-edit-btn" data-id="${pay.id}">編集</button>
          ${
            pay.id !== 'other_pay'
              ? `<button type="button" class="action-btn delete pay-delete-btn" data-id="${pay.id}">削除</button>`
              : `<span style="font-size:0.75rem; color:var(--text-sub); padding:0 4px;">標準</span>`
          }
        </div>
      `;
    }

    paymentManageList.appendChild(row);

    if (isEditing) {
      const labelInput = row.querySelector('.pay-edit-label');
      const iconInput = row.querySelector('.pay-edit-icon');
      if (labelInput) {
        labelInput.focus();
        labelInput.select();
      }
      const handleKey = (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          e.stopPropagation();
          updatePayment(pay.id, iconInput.value, labelInput.value);
        } else if (e.key === 'Escape') {
          e.preventDefault();
          e.stopPropagation();
          editingPaymentId = null;
          renderPaymentManageList();
        }
      };
      iconInput?.addEventListener('keydown', handleKey);
      labelInput?.addEventListener('keydown', handleKey);
    }
  });
}

function normalizeSubscriptionItem(item) {
  return {
    id: String(item.id || 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7)),
    name: String(item.name || '名称未設定'),
    price: Math.max(0, Number(item.price) || 0),
    billingCycle: item.billingCycle === 'yearly' ? 'yearly' : 'monthly',
    category: String(item.category || 'other'),
    paymentMethod: String(item.paymentMethod || 'credit_main'),
    status: item.status === 'canceled' ? 'canceled' : 'active',
    startedAt: item.startedAt || null,
    canceledAt: item.canceledAt || null,
    memo: String(item.memo || ''),
    createdAt: Number(item.createdAt) || Date.now(),
  };
}

function loadFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      subscriptions = [...DEFAULT_ITEMS];
      saveToStorage();
    } else {
      subscriptions = JSON.parse(raw).map(normalizeSubscriptionItem);
    }
  } catch (err) {
    console.error('データの読み込みに失敗しました:', err);
    subscriptions = [];
  }
}

function saveToStorage() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(subscriptions));
}

function formatYen(amount) {
  return '¥' + Math.round(amount).toLocaleString('ja-JP');
}

function getMonthlyEquivalent(item) {
  return item.billingCycle === 'yearly' ? item.price / 12 : item.price;
}

function getYearlyEquivalent(item) {
  return item.billingCycle === 'monthly' ? item.price * 12 : item.price;
}

function getActiveSubscriptions() {
  return subscriptions.filter((item) => item.status !== 'canceled');
}

function getCanceledSubscriptions() {
  return subscriptions.filter((item) => item.status === 'canceled');
}

function renderSummary() {
  const activeSubs = getActiveSubscriptions();
  const canceledSubs = getCanceledSubscriptions();

  const totalMonthly = activeSubs.reduce((sum, item) => sum + getMonthlyEquivalent(item), 0);
  const totalYearly = activeSubs.reduce((sum, item) => sum + getYearlyEquivalent(item), 0);
  const monthlyCount = activeSubs.filter((i) => i.billingCycle === 'monthly').length;
  const yearlyCount = activeSubs.filter((i) => i.billingCycle === 'yearly').length;

  monthlyTotalEl.textContent = formatYen(totalMonthly);
  yearlyTotalEl.textContent = formatYen(totalYearly);
  activeCountEl.innerHTML = `${activeSubs.length}<span class="unit">件</span>`;
  cycleBreakdownEl.textContent = `月額 ${monthlyCount}件 / 年額 ${yearlyCount}件`;

  canceledCountBadge.textContent = String(canceledSubs.length);

  const savedMonthly = canceledSubs.reduce((sum, item) => sum + getMonthlyEquivalent(item), 0);
  const savedYearly = canceledSubs.reduce((sum, item) => sum + getYearlyEquivalent(item), 0);
  canceledTotalCountEl.innerHTML = `${canceledSubs.length}<span class="unit">件</span>`;
  canceledMonthlySavedEl.textContent = formatYen(savedMonthly);
  canceledYearlySavedEl.textContent = formatYen(savedYearly);
}

function getFilteredAndSortedActiveItems() {
  const activeSubs = getActiveSubscriptions();
  const filtered = activeSubs.filter((item) => {
    const matchCycle = currentFilter === 'all' || item.billingCycle === currentFilter;
    const matchCategory = currentCategoryFilter === 'all' || item.category === currentCategoryFilter;
    const itemPay = item.paymentMethod || 'other_pay';
    const matchPayment = currentPaymentFilter === 'all' || itemPay === currentPaymentFilter;
    return matchCycle && matchCategory && matchPayment;
  });

  return filtered.sort((a, b) => {
    switch (currentSort) {
      case 'started-desc': {
        const sA = a.startedAt || '0000-00-00';
        const sB = b.startedAt || '0000-00-00';
        return sB.localeCompare(sA) || b.createdAt - a.createdAt;
      }
      case 'started-asc': {
        const sA = a.startedAt || '9999-99-99';
        const sB = b.startedAt || '9999-99-99';
        return sA.localeCompare(sB) || a.createdAt - b.createdAt;
      }
      case 'price-desc':
        return getMonthlyEquivalent(b) - getMonthlyEquivalent(a);
      case 'price-asc':
        return getMonthlyEquivalent(a) - getMonthlyEquivalent(b);
      case 'name-asc':
        return a.name.localeCompare(b.name, 'ja');
      case 'created-desc':
      default:
        return b.createdAt - a.createdAt;
    }
  });
}

function getSortedCanceledItems() {
  const canceledSubs = [...getCanceledSubscriptions()];
  return canceledSubs.sort((a, b) => {
    const dateA = a.canceledAt || '';
    const dateB = b.canceledAt || '';
    switch (currentCanceledSort) {
      case 'canceled-asc':
        return dateA.localeCompare(dateB) || a.createdAt - b.createdAt;
      case 'started-asc': {
        const sA = a.startedAt || '9999-99-99';
        const sB = b.startedAt || '9999-99-99';
        return sA.localeCompare(sB) || a.createdAt - b.createdAt;
      }
      case 'price-desc':
        return getMonthlyEquivalent(b) - getMonthlyEquivalent(a);
      case 'name-asc':
        return a.name.localeCompare(b.name, 'ja');
      case 'canceled-desc':
      default:
        return dateB.localeCompare(dateA) || b.createdAt - a.createdAt;
    }
  });
}

function renderActiveList() {
  const activeSubs = getActiveSubscriptions();
  const items = getFilteredAndSortedActiveItems();
  subscriptionListEl.innerHTML = '';

  if (activeSubs.length === 0) {
    emptyStateEl.classList.remove('hidden');
    return;
  }

  emptyStateEl.classList.add('hidden');

  if (items.length === 0) {
    subscriptionListEl.innerHTML = `
      <div class="empty-state">
        <p>条件に一致するサブスクがありません。</p>
      </div>
    `;
    return;
  }

  items.forEach((item) => {
    const cat = getCategoryById(item.category);
    const pay = getPaymentById(item.paymentMethod);
    const isYearly = item.billingCycle === 'yearly';
    const cycleLabel = isYearly ? '年額' : '月額';
    const cycleUnit = isYearly ? '/年' : '/月';
    const subPriceText = isYearly
      ? `月あたり 約${formatYen(item.price / 12)}`
      : `年換算 ${formatYen(item.price * 12)}`;

    let startedBadgeHtml = '';
    if (item.startedAt) {
      const duration = calcDurationText(item.startedAt);
      const durationLabel = duration ? ` (${duration})` : '';
      startedBadgeHtml = `<span class="started-date-badge" title="契約開始日">📅 ${escapeHtml(formatDateJP(item.startedAt))}開始${escapeHtml(durationLabel)}</span>`;
    }

    const card = document.createElement('div');
    card.className = 'sub-item';
    card.innerHTML = `
      <div class="sub-info">
        <div class="sub-category-icon" title="${escapeHtml(cat.label)}">${escapeHtml(cat.icon)}</div>
        <div class="sub-details">
          <div class="sub-name-row">
            <span class="sub-name">${escapeHtml(item.name)}</span>
            <span class="cycle-badge ${item.billingCycle}">${cycleLabel}</span>
            <span class="category-tag">${escapeHtml(cat.icon)} ${escapeHtml(cat.label)}</span>
            <span class="payment-tag" title="支払い方法">${escapeHtml(pay.icon)} ${escapeHtml(pay.label)}</span>
            ${startedBadgeHtml}
          </div>
          ${item.memo ? `<div class="sub-memo">${escapeHtml(item.memo)}</div>` : ''}
        </div>
      </div>
      <div class="sub-right">
        <div class="sub-pricing">
          <div class="sub-price">${formatYen(item.price)}<span class="cycle-unit">${cycleUnit}</span></div>
          <div class="sub-subprice">${subPriceText}</div>
        </div>
        <div class="sub-actions">
          <button class="action-btn cancel-sub" data-id="${item.id}" title="解約日を記録して解約済みリストへ移動">解約済みにする</button>
          <button class="action-btn edit" data-id="${item.id}" aria-label="${escapeHtml(item.name)}を編集">編集</button>
          <button class="action-btn delete" data-id="${item.id}" aria-label="${escapeHtml(item.name)}を削除">削除</button>
        </div>
      </div>
    `;

    subscriptionListEl.appendChild(card);
  });
}

function renderCanceledList() {
  const items = getSortedCanceledItems();
  canceledSubscriptionListEl.innerHTML = '';

  if (items.length === 0) {
    canceledEmptyStateEl.classList.remove('hidden');
    return;
  }

  canceledEmptyStateEl.classList.add('hidden');

  items.forEach((item) => {
    const cat = getCategoryById(item.category);
    const pay = getPaymentById(item.paymentMethod);
    const isYearly = item.billingCycle === 'yearly';
    const cycleLabel = isYearly ? '年額' : '月額';
    const cycleUnit = isYearly ? '/年' : '/月';
    const subPriceText = isYearly
      ? `月あたり 約${formatYen(item.price / 12)}`
      : `年換算 ${formatYen(item.price * 12)}`;

    let periodBadgeHtml = '';
    if (item.startedAt && item.canceledAt) {
      const duration = calcDurationText(item.startedAt, item.canceledAt);
      const durationLabel = duration ? ` (契約期間: ${duration})` : '';
      periodBadgeHtml = `<span class="canceled-date-badge">🗓️ ${escapeHtml(formatDateJP(item.startedAt))} 〜 ${escapeHtml(formatDateJP(item.canceledAt))} 解約${escapeHtml(durationLabel)}</span>`;
    } else {
      periodBadgeHtml = `<span class="canceled-date-badge">🗓️ ${escapeHtml(formatDateJP(item.canceledAt))} 解約</span>`;
    }

    const card = document.createElement('div');
    card.className = 'sub-item canceled-item';
    card.innerHTML = `
      <div class="sub-info">
        <div class="sub-category-icon" title="${escapeHtml(cat.label)}">${escapeHtml(cat.icon)}</div>
        <div class="sub-details">
          <div class="sub-name-row">
            <span class="sub-name">${escapeHtml(item.name)}</span>
            ${periodBadgeHtml}
            <span class="cycle-badge ${item.billingCycle}">${cycleLabel}</span>
            <span class="category-tag">${escapeHtml(cat.icon)} ${escapeHtml(cat.label)}</span>
            <span class="payment-tag" title="支払い方法">${escapeHtml(pay.icon)} ${escapeHtml(pay.label)}</span>
          </div>
          ${item.memo ? `<div class="sub-memo">${escapeHtml(item.memo)}</div>` : ''}
        </div>
      </div>
      <div class="sub-right">
        <div class="sub-pricing">
          <div class="sub-price">${formatYen(item.price)}<span class="cycle-unit">${cycleUnit}</span></div>
          <div class="sub-subprice">${subPriceText}</div>
        </div>
        <div class="sub-actions">
          <button class="action-btn restore-sub" data-id="${item.id}" title="契約中の一覧に戻す">再契約・戻す</button>
          <button class="action-btn edit" data-id="${item.id}" aria-label="${escapeHtml(item.name)}を編集">編集</button>
          <button class="action-btn delete" data-id="${item.id}" aria-label="${escapeHtml(item.name)}を削除">削除</button>
        </div>
      </div>
    `;

    canceledSubscriptionListEl.appendChild(card);
  });
}

function renderAll() {
  renderSummary();
  renderActiveList();
  renderCanceledList();
}

function switchPageView(showCanceled) {
  isViewingCanceledPage = showCanceled;
  if (showCanceled) {
    activePageView.classList.add('hidden');
    canceledPageView.classList.remove('hidden');
    toggleCanceledPageBtn.classList.add('active-view');
  } else {
    canceledPageView.classList.add('hidden');
    activePageView.classList.remove('hidden');
    toggleCanceledPageBtn.classList.remove('active-view');
  }
}

function updateModalStatusFields() {
  if (subStatusInput.value === 'canceled') {
    canceledDateGroup.classList.remove('hidden');
    canceledDateInput.required = true;
    if (!canceledDateInput.value) {
      canceledDateInput.value = getTodayDateString();
    }
  } else {
    canceledDateGroup.classList.add('hidden');
    canceledDateInput.required = false;
  }
}

function openModal(editItem = null, defaultStatus = 'active') {
  quickCategoryBox.classList.add('hidden');
  quickPaymentBox.classList.add('hidden');

  renderCategoryOptions(editItem ? editItem.category : 'entertainment');
  renderPaymentOptions(editItem ? editItem.paymentMethod : 'credit_main');

  if (editItem) {
    modalTitle.textContent = 'サブスクを編集';
    subIdInput.value = editItem.id;
    serviceNameInput.value = editItem.name;
    priceInput.value = editItem.price;
    billingCycleInput.value = editItem.billingCycle;
    startedDateInput.value = editItem.startedAt || '';
    subStatusInput.value = editItem.status === 'canceled' ? 'canceled' : 'active';
    canceledDateInput.value = editItem.canceledAt || getTodayDateString();
    categoryInput.value = categories.some((c) => c.id === editItem.category)
      ? editItem.category
      : 'other';
    paymentMethodInput.value = paymentMethods.some((p) => p.id === editItem.paymentMethod)
      ? editItem.paymentMethod
      : 'other_pay';
    memoInput.value = editItem.memo || '';
  } else {
    modalTitle.textContent =
      defaultStatus === 'canceled' ? '解約済みサブスクを追加' : 'サブスクを追加';
    subscriptionForm.reset();
    subIdInput.value = '';
    billingCycleInput.value = 'monthly';
    startedDateInput.value = defaultStatus === 'active' ? getTodayDateString() : '';
    subStatusInput.value = defaultStatus;
    canceledDateInput.value = getTodayDateString();
    if (categories.length > 0) {
      categoryInput.value = categories[0].id;
    }
    if (paymentMethods.length > 0) {
      paymentMethodInput.value = paymentMethods[0].id;
    }
  }

  updateModalStatusFields();
  modalOverlay.classList.remove('hidden');
  serviceNameInput.focus();
}

function closeModal() {
  modalOverlay.classList.add('hidden');
  quickCategoryBox.classList.add('hidden');
  quickPaymentBox.classList.add('hidden');
  subscriptionForm.reset();
}

function openCancelSubModal(targetItem) {
  cancelTargetSubId.value = targetItem.id;
  cancelTargetSubName.textContent = `「${targetItem.name}」を解約済みに移動します`;
  confirmCancelDate.value = targetItem.canceledAt || getTodayDateString();
  confirmCancelMemo.value = targetItem.memo || '';
  cancelSubModalOverlay.classList.remove('hidden');
  confirmCancelDate.focus();
}

function closeCancelSubModal() {
  cancelSubModalOverlay.classList.add('hidden');
  cancelSubForm.reset();
}

function openCategoryModal() {
  editingCategoryId = null;
  renderCategoryManageList();
  categoryModalOverlay.classList.remove('hidden');
  manageCatLabel.focus();
}

function closeCategoryModal() {
  editingCategoryId = null;
  categoryModalOverlay.classList.add('hidden');
}

function openPaymentModal() {
  editingPaymentId = null;
  renderPaymentManageList();
  paymentModalOverlay.classList.remove('hidden');
  managePayLabel.focus();
}

function closePaymentModal() {
  editingPaymentId = null;
  paymentModalOverlay.classList.add('hidden');
}

// ==================== エクスポート・インポート機能 ====================

function buildBackupPayload() {
  return {
    app: 'SubscManager',
    version: 1,
    exportedAt: new Date().toISOString(),
    settings: {
      categories,
      paymentMethods,
    },
    subscriptions,
  };
}

function updateDataModalSummary() {
  const activeCount = getActiveSubscriptions().length;
  const canceledCount = getCanceledSubscriptions().length;
  exportSummaryInfo.textContent = `現在の保存データ: 契約中 ${activeCount}件 / 解約済み ${canceledCount}件 ｜ カテゴリ ${categories.length}種 / 支払い方法 ${paymentMethods.length}種`;
}

function showDataFeedback(message, isError = false) {
  dataFeedbackMsg.textContent = message;
  dataFeedbackMsg.className = 'data-feedback ' + (isError ? 'error' : 'success');
  dataFeedbackMsg.classList.remove('hidden');
}

function hideDataFeedback() {
  dataFeedbackMsg.classList.add('hidden');
  dataFeedbackMsg.textContent = '';
}

function openDataModal() {
  updateDataModalSummary();
  hideDataFeedback();
  importPasteTextarea.value = '';
  dataModalOverlay.classList.remove('hidden');
}

function closeDataModal() {
  dataModalOverlay.classList.add('hidden');
  hideDataFeedback();
}

function downloadBlob(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function handleExportJson() {
  const payload = buildBackupPayload();
  const jsonStr = JSON.stringify(payload, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8' });
  const filename = `subsc-manager-backup-${getTodayDateString()}.json`;
  downloadBlob(blob, filename);
  showDataFeedback(`バックアップファイル（${filename}）を保存しました。`);
}

async function handleCopyJson() {
  const payload = buildBackupPayload();
  const jsonStr = JSON.stringify(payload);
  try {
    await navigator.clipboard.writeText(jsonStr);
    showDataFeedback('バックアップ文字列をクリップボードにコピーしました！メモ帳や別端末へ貼り付けて復元できます。');
  } catch (err) {
    importPasteTextarea.value = jsonStr;
    importPasteTextarea.focus();
    importPasteTextarea.select();
    showDataFeedback('下のテキスト欄にバックアップ文字列を出力しました。全選択してコピーしてください。');
  }
}

function csvEscape(val) {
  const str = String(val ?? '');
  if (str.includes('"') || str.includes(',') || str.includes('\n')) {
    return '"' + str.replace(/"/g, '""') + '"';
  }
  return str;
}

function handleExportCsv() {
  const headers = [
    'ステータス',
    'サービス名',
    '金額(円)',
    '支払いサイクル',
    '月額換算(円)',
    '年額換算(円)',
    'カテゴリ',
    '支払い方法',
    '契約開始日',
    '解約日',
    'メモ',
  ];

  const rows = subscriptions.map((item) => {
    const cat = getCategoryById(item.category);
    const pay = getPaymentById(item.paymentMethod);
    return [
      item.status === 'canceled' ? '解約済み' : '契約中',
      item.name,
      item.price,
      item.billingCycle === 'yearly' ? '年額' : '月額',
      Math.round(getMonthlyEquivalent(item)),
      Math.round(getYearlyEquivalent(item)),
      cat.label,
      pay.label,
      item.startedAt || '',
      item.canceledAt || '',
      item.memo || '',
    ].map(csvEscape).join(',');
  });

  // Excelで文字化けしないようUTF-8 BOMを付与
  const csvContent = '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' });
  const filename = `subsc-list-${getTodayDateString()}.csv`;
  downloadBlob(blob, filename);
  showDataFeedback(`CSVファイル（${filename}）を出力しました。`);
}

function applyImportedData(rawJsonStr) {
  let parsed;
  try {
    parsed = JSON.parse(rawJsonStr);
  } catch (err) {
    showDataFeedback('エラー: 有効なJSONデータではありません。形式をご確認ください。', true);
    return;
  }

  // 単一配列（旧形式やサブスク配列のみ）またはフルバックアップオブジェクト両方に対応
  const incomingSubs = Array.isArray(parsed)
    ? parsed
    : Array.isArray(parsed?.subscriptions)
    ? parsed.subscriptions
    : null;
  const incomingCategories = Array.isArray(parsed?.settings?.categories)
    ? parsed.settings.categories
    : Array.isArray(parsed?.categories)
    ? parsed.categories
    : null;
  const incomingPayments = Array.isArray(parsed?.settings?.paymentMethods)
    ? parsed.settings.paymentMethods
    : Array.isArray(parsed?.paymentMethods)
    ? parsed.paymentMethods
    : null;

  if (!incomingSubs && !incomingCategories && !incomingPayments) {
    showDataFeedback('エラー: インポート可能な設定データまたはサブスクデータが見つかりませんでした。', true);
    return;
  }

  const mode = importModeSelect.value; // 'overwrite' or 'merge'

  if (mode === 'overwrite') {
    if (incomingCategories && incomingCategories.length > 0) {
      categories = incomingCategories.map((c) => ({
        id: String(c.id),
        icon: String(c.icon || '🏷️'),
        label: String(c.label || 'カテゴリ'),
        isDefault: Boolean(c.isDefault),
      }));
      if (!categories.some((c) => c.id === 'other')) {
        categories.push({ id: 'other', icon: '📦', label: 'その他', isDefault: true });
      }
      saveCategories();
    }

    if (incomingPayments && incomingPayments.length > 0) {
      paymentMethods = incomingPayments.map((p) => ({
        id: String(p.id),
        icon: String(p.icon || '💳'),
        label: String(p.label || '支払い方法'),
        isDefault: Boolean(p.isDefault),
      }));
      if (!paymentMethods.some((p) => p.id === 'other_pay')) {
        paymentMethods.push({ id: 'other_pay', icon: '❓', label: '未設定・その他', isDefault: true });
      }
      savePayments();
    }

    if (incomingSubs) {
      subscriptions = incomingSubs.map(normalizeSubscriptionItem);
      saveToStorage();
    }
  } else {
    // merge (追加統合)
    if (incomingCategories) {
      const existingCatIds = new Set(categories.map((c) => c.id));
      incomingCategories.forEach((c) => {
        if (c && c.id && !existingCatIds.has(c.id)) {
          categories.push({
            id: String(c.id),
            icon: String(c.icon || '🏷️'),
            label: String(c.label || 'カテゴリ'),
            isDefault: Boolean(c.isDefault),
          });
          existingCatIds.add(c.id);
        }
      });
      saveCategories();
    }

    if (incomingPayments) {
      const existingPayIds = new Set(paymentMethods.map((p) => p.id));
      incomingPayments.forEach((p) => {
        if (p && p.id && !existingPayIds.has(p.id)) {
          paymentMethods.push({
            id: String(p.id),
            icon: String(p.icon || '💳'),
            label: String(p.label || '支払い方法'),
            isDefault: Boolean(p.isDefault),
          });
          existingPayIds.add(p.id);
        }
      });
      savePayments();
    }

    if (incomingSubs) {
      const existingSubIds = new Set(subscriptions.map((s) => s.id));
      incomingSubs.forEach((item) => {
        const norm = normalizeSubscriptionItem(item);
        if (existingSubIds.has(norm.id)) {
          norm.id = 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
        }
        subscriptions.push(norm);
        existingSubIds.add(norm.id);
      });
      saveToStorage();
    }
  }

  renderCategoryOptions();
  renderPaymentOptions();
  renderAll();
  updateDataModalSummary();
  importPasteTextarea.value = '';

  showDataFeedback(
    `インポート完了！現在のデータ: 契約中 ${getActiveSubscriptions().length}件 / 解約済み ${getCanceledSubscriptions().length}件（カテゴリ ${categories.length}種・支払い方法 ${paymentMethods.length}種）`
  );
}

// ==================== フォーム送信・イベント ====================

function handleFormSubmit(e) {
  e.preventDefault();

  const id = subIdInput.value.trim();
  const name = serviceNameInput.value.trim();
  const price = Number(priceInput.value);
  const billingCycle = billingCycleInput.value;
  const startedAt = startedDateInput.value || null;
  const status = subStatusInput.value === 'canceled' ? 'canceled' : 'active';
  const canceledAt = status === 'canceled' ? (canceledDateInput.value || getTodayDateString()) : null;
  const category = categoryInput.value;
  const paymentMethod = paymentMethodInput.value;
  const memo = memoInput.value.trim();

  if (!name || isNaN(price) || price < 0) return;

  if (id) {
    subscriptions = subscriptions.map((item) =>
      item.id === id
        ? { ...item, name, price, billingCycle, startedAt, status, canceledAt, category, paymentMethod, memo }
        : item
    );
  } else {
    const newItem = {
      id: 'sub-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7),
      name,
      price,
      billingCycle,
      startedAt,
      status,
      canceledAt,
      category,
      paymentMethod,
      memo,
      createdAt: Date.now(),
    };
    subscriptions.unshift(newItem);
  }

  saveToStorage();
  renderAll();
  closeModal();
}

function handleCancelSubFormSubmit(e) {
  e.preventDefault();
  const id = cancelTargetSubId.value;
  const canceledAt = confirmCancelDate.value || getTodayDateString();
  const memo = confirmCancelMemo.value.trim();

  subscriptions = subscriptions.map((item) =>
    item.id === id
      ? { ...item, status: 'canceled', canceledAt, memo }
      : item
  );

  saveToStorage();
  renderAll();
  closeCancelSubModal();
}

function handleListClick(e) {
  const cancelSubBtn = e.target.closest('.action-btn.cancel-sub');
  const restoreSubBtn = e.target.closest('.action-btn.restore-sub');
  const editBtn = e.target.closest('.action-btn.edit');
  const deleteBtn = e.target.closest('.action-btn.delete');

  if (cancelSubBtn) {
    const id = cancelSubBtn.dataset.id;
    const target = subscriptions.find((item) => item.id === id);
    if (target) openCancelSubModal(target);
  } else if (restoreSubBtn) {
    const id = restoreSubBtn.dataset.id;
    const target = subscriptions.find((item) => item.id === id);
    if (!target) return;
    if (confirm(`「${target.name}」を契約中の一覧に戻しますか？`)) {
      subscriptions = subscriptions.map((item) =>
        item.id === id ? { ...item, status: 'active', canceledAt: null } : item
      );
      saveToStorage();
      renderAll();
    }
  } else if (editBtn) {
    const id = editBtn.dataset.id;
    const target = subscriptions.find((item) => item.id === id);
    if (target) openModal(target);
  } else if (deleteBtn) {
    const id = deleteBtn.dataset.id;
    const target = subscriptions.find((item) => item.id === id);
    if (!target) return;

    if (confirm(`「${target.name}」のデータを完全に削除してもよろしいですか？`)) {
      subscriptions = subscriptions.filter((item) => item.id !== id);
      saveToStorage();
      renderAll();
    }
  }
}

function goHome() {
  // 解約済み画面にいる場合は契約中画面へ戻す
  switchPageView(false);

  // 絞り込み条件をすべて解除（初期状態）
  currentFilter = 'all';
  currentCategoryFilter = 'all';
  currentPaymentFilter = 'all';

  filterChips.forEach((c) => {
    c.classList.toggle('active', c.dataset.filter === 'all');
  });
  categoryFilterSelect.value = 'all';
  paymentFilterSelect.value = 'all';

  renderActiveList();
}

function renderStoragePathFooter() {
  const footerEl = document.getElementById('storagePathInfo');
  if (!footerEl) return;
  const appPath = '/Users/tatsu/.gemini/antigravity/scratch/subsc-manager';
  footerEl.textContent = `データ保管場所パス: ${appPath} ｜ ブラウザ保存領域 (localStorage): ${STORAGE_KEY}, ${CATEGORY_STORAGE_KEY}, ${PAYMENT_STORAGE_KEY}`;
}

function setupEventListeners() {
  renderStoragePathFooter();

  const homeBtn = document.getElementById('homeBtn');
  const headerLogoHome = document.getElementById('headerLogoHome');
  homeBtn?.addEventListener('click', goHome);
  headerLogoHome?.addEventListener('click', goHome);

  toggleCanceledPageBtn.addEventListener('click', () => {
    switchPageView(!isViewingCanceledPage);
  });

  backToActiveBtn.addEventListener('click', () => {
    switchPageView(false);
  });

  openModalBtn.addEventListener('click', () =>
    openModal(null, isViewingCanceledPage ? 'canceled' : 'active')
  );
  emptyAddBtn.addEventListener('click', () => openModal(null, 'active'));
  addCanceledDirectlyBtn.addEventListener('click', () => openModal(null, 'canceled'));

  closeModalBtn.addEventListener('click', closeModal);
  cancelBtn.addEventListener('click', closeModal);

  subStatusInput.addEventListener('change', updateModalStatusFields);

  closeCancelSubModalBtn.addEventListener('click', closeCancelSubModal);
  abortCancelSubBtn.addEventListener('click', closeCancelSubModal);
  cancelSubForm.addEventListener('submit', handleCancelSubFormSubmit);

  cancelSubModalOverlay.addEventListener('click', (e) => {
    if (e.target === cancelSubModalOverlay) closeCancelSubModal();
  });

  toggleQuickCategoryBtn.addEventListener('click', () => {
    quickCategoryBox.classList.toggle('hidden');
    if (!quickCategoryBox.classList.contains('hidden')) {
      quickCatLabel.focus();
    }
  });

  addQuickCategoryBtn.addEventListener('click', () => {
    const created = addNewCategory(quickCatIcon.value, quickCatLabel.value);
    if (created) {
      categoryInput.value = created.id;
      quickCatLabel.value = '';
      quickCategoryBox.classList.add('hidden');
    } else {
      quickCatLabel.focus();
    }
  });

  quickCatLabel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuickCategoryBtn.click();
    }
  });

  toggleQuickPaymentBtn.addEventListener('click', () => {
    quickPaymentBox.classList.toggle('hidden');
    if (!quickPaymentBox.classList.contains('hidden')) {
      quickPayLabel.focus();
    }
  });

  addQuickPaymentBtn.addEventListener('click', () => {
    const created = addNewPayment(quickPayIcon.value, quickPayLabel.value);
    if (created) {
      paymentMethodInput.value = created.id;
      quickPayLabel.value = '';
      quickPaymentBox.classList.add('hidden');
    } else {
      quickPayLabel.focus();
    }
  });

  quickPayLabel.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addQuickPaymentBtn.click();
    }
  });

  // カテゴリ管理モーダル
  openCategoryModalBtn.addEventListener('click', openCategoryModal);
  closeCategoryModalBtn.addEventListener('click', closeCategoryModal);
  doneCategoryModalBtn.addEventListener('click', closeCategoryModal);

  categoryManageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const created = addNewCategory(manageCatIcon.value, manageCatLabel.value);
    if (created) {
      manageCatLabel.value = '';
      manageCatLabel.focus();
    }
  });

  categoryManageList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.cat-edit-btn');
    const saveBtn = e.target.closest('.cat-save-btn');
    const cancelEditBtn = e.target.closest('.cat-cancel-btn');
    const delBtn = e.target.closest('.cat-delete-btn');

    if (editBtn) {
      editingCategoryId = editBtn.dataset.id;
      renderCategoryManageList();
      return;
    }

    if (cancelEditBtn) {
      editingCategoryId = null;
      renderCategoryManageList();
      return;
    }

    if (saveBtn) {
      const row = saveBtn.closest('.category-manage-item');
      const iconVal = row.querySelector('.cat-edit-icon')?.value || '';
      const labelVal = row.querySelector('.cat-edit-label')?.value || '';
      updateCategory(saveBtn.dataset.id, iconVal, labelVal);
      return;
    }

    if (delBtn) {
      const catId = delBtn.dataset.id;
      const targetCat = categories.find((c) => c.id === catId);
      if (!targetCat || targetCat.id === 'other') return;

      const usedCount = subscriptions.filter((s) => s.category === catId).length;
      const msg =
        usedCount > 0
          ? `カテゴリ「${targetCat.label}」を削除しますか？\n（このカテゴリを設定中の ${usedCount} 件のサブスクは「その他」に変更されます）`
          : `カテゴリ「${targetCat.label}」を削除しますか？`;

      if (confirm(msg)) {
        categories = categories.filter((c) => c.id !== catId);
        if (usedCount > 0) {
          subscriptions = subscriptions.filter(Boolean).map((s) =>
            s.category === catId ? { ...s, category: 'other' } : s
          );
          saveToStorage();
        }
        saveCategories();
        renderCategoryOptions();
        renderCategoryManageList();
        renderAll();
      }
    }
  });

  resetCategoriesBtn.addEventListener('click', () => {
    if (confirm('カテゴリ一覧を初期状態に戻しますか？（編集した内容や独自に追加したカテゴリがリセットされます）')) {
      categories = DEFAULT_CATEGORIES.map((c) => ({ ...c }));
      editingCategoryId = null;
      saveCategories();
      renderCategoryOptions();
      renderCategoryManageList();
      renderAll();
    }
  });

  // 支払い方法管理モーダル
  openPaymentModalBtn.addEventListener('click', openPaymentModal);
  closePaymentModalBtn.addEventListener('click', closePaymentModal);
  donePaymentModalBtn.addEventListener('click', closePaymentModal);

  paymentManageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const created = addNewPayment(managePayIcon.value, managePayLabel.value);
    if (created) {
      managePayLabel.value = '';
      managePayLabel.focus();
    }
  });

  paymentManageList.addEventListener('click', (e) => {
    const editBtn = e.target.closest('.pay-edit-btn');
    const saveBtn = e.target.closest('.pay-save-btn');
    const cancelEditBtn = e.target.closest('.pay-cancel-btn');
    const delBtn = e.target.closest('.pay-delete-btn');

    if (editBtn) {
      editingPaymentId = editBtn.dataset.id;
      renderPaymentManageList();
      return;
    }

    if (cancelEditBtn) {
      editingPaymentId = null;
      renderPaymentManageList();
      return;
    }

    if (saveBtn) {
      const row = saveBtn.closest('.category-manage-item');
      const iconVal = row.querySelector('.pay-edit-icon')?.value || '';
      const labelVal = row.querySelector('.pay-edit-label')?.value || '';
      updatePayment(saveBtn.dataset.id, iconVal, labelVal);
      return;
    }

    if (delBtn) {
      const payId = delBtn.dataset.id;
      const targetPay = paymentMethods.find((p) => p.id === payId);
      if (!targetPay || targetPay.id === 'other_pay') return;

      const usedCount = subscriptions.filter((s) => (s.paymentMethod || 'other_pay') === payId).length;
      const msg =
        usedCount > 0
          ? `支払い方法「${targetPay.label}」を削除しますか？\n（設定中の ${usedCount} 件のサブスクは「未設定・その他」に変更されます）`
          : `支払い方法「${targetPay.label}」を削除しますか？`;

      if (confirm(msg)) {
        paymentMethods = paymentMethods.filter((p) => p.id !== payId);
        if (usedCount > 0) {
          subscriptions = subscriptions.map((s) =>
            (s.paymentMethod || 'other_pay') === payId ? { ...s, paymentMethod: 'other_pay' } : s
          );
          saveToStorage();
        }
        savePayments();
        renderPaymentOptions();
        renderPaymentManageList();
        renderAll();
      }
    }
  });

  resetPaymentsBtn.addEventListener('click', () => {
    if (confirm('支払い方法一覧を初期状態に戻しますか？（編集した内容や独自に追加したカード名などがリセットされます）')) {
      paymentMethods = DEFAULT_PAYMENTS.map((p) => ({ ...p }));
      editingPaymentId = null;
      savePayments();
      renderPaymentOptions();
      renderPaymentManageList();
      renderAll();
    }
  });

  // データ入出力モーダル
  openDataModalBtn.addEventListener('click', openDataModal);
  closeDataModalBtn.addEventListener('click', closeDataModal);
  doneDataModalBtn.addEventListener('click', closeDataModal);

  exportJsonBtn.addEventListener('click', handleExportJson);
  copyJsonBtn.addEventListener('click', handleCopyJson);
  exportCsvBtn.addEventListener('click', handleExportCsv);

  triggerImportFileBtn.addEventListener('click', () => {
    importFileInput.value = '';
    importFileInput.click();
  });

  importFileInput.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        applyImportedData(reader.result);
      }
    };
    reader.onerror = () => {
      showDataFeedback('ファイルの読み込みに失敗しました。', true);
    };
    reader.readAsText(file, 'utf-8');
  });

  importFromTextBtn.addEventListener('click', () => {
    const text = importPasteTextarea.value.trim();
    if (!text) {
      showDataFeedback('復元するバックアップ文字列を貼り付けてください。', true);
      importPasteTextarea.focus();
      return;
    }
    applyImportedData(text);
  });

  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) closeModal();
  });

  categoryModalOverlay.addEventListener('click', (e) => {
    if (e.target === categoryModalOverlay) closeCategoryModal();
  });

  paymentModalOverlay.addEventListener('click', (e) => {
    if (e.target === paymentModalOverlay) closePaymentModal();
  });

  dataModalOverlay.addEventListener('click', (e) => {
    if (e.target === dataModalOverlay) closeDataModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      if (!modalOverlay.classList.contains('hidden')) closeModal();
      if (!cancelSubModalOverlay.classList.contains('hidden')) closeCancelSubModal();
      if (!categoryModalOverlay.classList.contains('hidden')) closeCategoryModal();
      if (!paymentModalOverlay.classList.contains('hidden')) closePaymentModal();
      if (!dataModalOverlay.classList.contains('hidden')) closeDataModal();
    }
  });

  subscriptionForm.addEventListener('submit', handleFormSubmit);
  subscriptionListEl.addEventListener('click', handleListClick);
  canceledSubscriptionListEl.addEventListener('click', handleListClick);

  filterChips.forEach((chip) => {
    chip.addEventListener('click', () => {
      filterChips.forEach((c) => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      renderActiveList();
    });
  });

  categoryFilterSelect.addEventListener('change', (e) => {
    currentCategoryFilter = e.target.value;
    renderActiveList();
  });

  paymentFilterSelect.addEventListener('change', (e) => {
    currentPaymentFilter = e.target.value;
    renderActiveList();
  });

  sortSelect.addEventListener('change', (e) => {
    currentSort = e.target.value;
    renderActiveList();
  });

  canceledSortSelect.addEventListener('change', (e) => {
    currentCanceledSort = e.target.value;
    renderCanceledList();
  });
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

init();

// PWA用 Service Worker の登録
if ('serviceWorker' in navigator && (location.protocol === 'https:' || location.hostname === 'localhost' || location.hostname === '127.0.0.1')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch((err) => {
      console.warn('Service Worker registration skipped:', err);
    });
  });
}
