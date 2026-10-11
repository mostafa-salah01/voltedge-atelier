/**
 * VoltEdge Atelier — Admin Dashboard & Store Management System
 * نظام إدارة المتجر التفاعلي (بدون قاعدة بيانات - متوافق بالكامل مع GitHub Pages)
 */

(function () {
  'use strict';

  const STORAGE_AUTH_KEY = 'voltedge_admin_logged_in';
  const STORAGE_ORDERS_KEY = 'voltedge_atelier_orders_v1';
  const STORAGE_CATALOG_KEY = 'voltedge_atelier_catalog_v1';
  const STORAGE_BRIDAL_KEY = 'voltedge_atelier_bridal_bookings_v1';
  const STORAGE_SETTINGS_KEY = 'voltedge_atelier_settings_v1';

  // Helper format EGP
  function formatEGP(amount) {
    return Number(amount || 0).toLocaleString('ar-EG') + ' ج.م';
  }

  // Toast notification
  function showAdminToast(msg) {
    const toast = document.getElementById('admin-toast');
    const toastText = document.getElementById('admin-toast-text');
    if (!toast || !toastText) return;
    toastText.textContent = msg;
    toast.classList.remove('translate-y-24', 'opacity-0', 'pointer-events-none');
    toast.classList.add('translate-y-0', 'opacity-100');
    setTimeout(() => {
      toast.classList.remove('translate-y-0', 'opacity-100');
      toast.classList.add('translate-y-24', 'opacity-0', 'pointer-events-none');
    }, 2800);
  }
  window.showAdminToast = showAdminToast;

  // =========================================================================
  // 1. إدارة المصادقة وتسجيل الدخول (Demo Authentication)
  // =========================================================================
  function isAuthenticated() {
    return (
      sessionStorage.getItem(STORAGE_AUTH_KEY) === 'true' ||
      localStorage.getItem(STORAGE_AUTH_KEY) === 'true'
    );
  }

  function checkAuthUI() {
    const loginView = document.getElementById('admin-login-view');
    const dashboardView = document.getElementById('admin-dashboard-view');
    if (!loginView || !dashboardView) return;

    if (isAuthenticated()) {
      loginView.style.display = 'none';
      loginView.classList.add('hidden');
      loginView.classList.remove('flex');

      dashboardView.style.display = 'flex';
      dashboardView.classList.remove('hidden');
      dashboardView.classList.add('flex');

      try {
        initDashboard();
      } catch (err) {
        console.error('Error in initDashboard:', err);
      }
    } else {
      dashboardView.style.display = 'none';
      dashboardView.classList.add('hidden');
      dashboardView.classList.remove('flex');

      loginView.style.display = 'flex';
      loginView.classList.remove('hidden');
      loginView.classList.add('flex');
    }
  }
  window.checkAuthUI = checkAuthUI;

  window.handleAdminLogin = function () {
    const userInput = document.getElementById('admin-user-input');
    const passInput = document.getElementById('admin-pass-input');
    const user = (userInput && userInput.value.trim()) || 'admin@voltedge.com';
    const feedback = document.getElementById('login-feedback');

    if (feedback) {
      feedback.textContent = 'تم تسجيل الدخول بنجاح! جاري فتح لوحة الإدارة...';
      feedback.className = 'p-2.5 rounded-lg text-xs text-center bg-emerald-950/70 text-emerald-300 border border-emerald-500/40 block';
      feedback.classList.remove('hidden');
    }

    const adminName = user.includes('@') ? user.split('@')[0] : user;
    sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
    localStorage.setItem(STORAGE_AUTH_KEY, 'true');
    sessionStorage.setItem('voltedge_admin_username', adminName || 'المدير العام');
    localStorage.setItem('voltedge_admin_username', adminName || 'المدير العام');

    checkAuthUI();
    showAdminToast('مرحباً بكِ في لوحة تحكم الأتيليه ✨');
  };

  window.quickDemoLogin = function () {
    sessionStorage.setItem(STORAGE_AUTH_KEY, 'true');
    localStorage.setItem(STORAGE_AUTH_KEY, 'true');
    sessionStorage.setItem('voltedge_admin_username', 'المدير العام (تجريبي)');
    localStorage.setItem('voltedge_admin_username', 'المدير العام (تجريبي)');
    checkAuthUI();
    showAdminToast('تم تسجيل الدخول السريع بنجاح كمسؤول للنظام ✨');
  };

  window.handleAdminLogout = function () {
    sessionStorage.removeItem(STORAGE_AUTH_KEY);
    localStorage.removeItem(STORAGE_AUTH_KEY);
    checkAuthUI();
    showAdminToast('تم تسجيل الخروج بنجاح.');
  };

  // =========================================================================
  // 2. البذور الافتراضية للطلبات (Seed Demo Orders in Egypt)
  // =========================================================================
  const DEFAULT_DEMO_ORDERS = [
    {
      id: 'EG-94281',
      date: '١٠ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 3600000 * 2,
      name: 'نورهان أحمد الشريف',
      phone: '01012345678',
      whatsapp: '01012345678',
      gov: 'القاهرة',
      address: 'المعادي - دجلة، شارع 206، فيلا 14',
      notes: 'مقاس M، فستان سهرة لمناسبة خاصة',
      paymentMethod: 'instapay',
      paymentLabel: 'إنستاباي InstaPay مصر',
      total: 14500,
      status: 'pending', // pending, shipped, delivered, cancelled
      items: [
        { id: 'ev-1', name: 'فستان السهرة الزمردي الملكي', price: 14500, qty: 1, image: 'images/evening-1.jfif' }
      ]
    },
    {
      id: 'EG-94105',
      date: '٩ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 3600000 * 24,
      name: 'مريم طارق العوضي',
      phone: '01124567890',
      whatsapp: '01124567890',
      gov: 'الجيزة',
      address: 'الشيخ زايد - كمبوند الربوة، عمارة 8 شقة 3',
      notes: 'تأكيد التسليم قبل الساعة 5 مساءً',
      paymentMethod: 'vodafone',
      paymentLabel: 'فودافون كاش ومحافظ المحمول',
      total: 21000,
      status: 'shipped',
      items: [
        { id: 'ev-2', name: 'فستان السهرة الياقوتي الكوتور', price: 16500, qty: 1, image: 'images/evening-2.jfif' },
        { id: 'acc-1', name: 'تاج الملكة فيكتوريا المرصع بالزركون', price: 4500, qty: 1, image: 'images/acc-1.jfif' }
      ]
    },
    {
      id: 'EG-93884',
      date: '٨ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 3600000 * 48,
      name: 'هادية محمود بسيوني',
      phone: '01239876543',
      whatsapp: '01239876543',
      gov: 'الإسكندرية',
      address: 'كفر عبده - شارع خليل خياط، عمارة البارون',
      notes: 'الدفع نقداً للمندوب عند المعاينة',
      paymentMethod: 'cod',
      paymentLabel: 'الدفع عند الاستلام (COD)',
      total: 18500,
      status: 'delivered',
      items: [
        { id: 'ev-3', name: 'فستان الذهب السائل المطرز يدوياً', price: 18500, qty: 1, image: 'images/evening-3.jfif' }
      ]
    },
    {
      id: 'EG-93412',
      date: '٧ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 3600000 * 72,
      name: 'سلمى إبراهيم الدالي',
      phone: '01098765432',
      whatsapp: '01098765432',
      gov: 'الدقهلية',
      address: 'المنصورة - حي الجامعة، برج النخيل الدور الخامس',
      notes: 'كارت ميزة البنك الأهلي',
      paymentMethod: 'card',
      paymentLabel: 'كارت ميزة / فيزا البنوك المصرية',
      total: 35000,
      status: 'delivered',
      items: [
        { id: 'wd-1', name: 'فستان زفاف العروس الملكية «أفروديت»', price: 35000, qty: 1, image: 'images/wedding-1.jfif' }
      ]
    },
    {
      id: 'EG-92901',
      date: '٥ أكتوبر ٢٠٢٦',
      timestamp: Date.now() - 3600000 * 120,
      name: 'يارا حسام الدين',
      phone: '01511223344',
      whatsapp: '01511223344',
      gov: 'البحر الأحمر',
      address: 'الجونة - منطقة مارينا، شاليه 42',
      notes: 'طلب إكسسوارات حصرية',
      paymentMethod: 'instapay',
      paymentLabel: 'إنستاباي InstaPay مصر',
      total: 7800,
      status: 'delivered',
      items: [
        { id: 'acc-2', name: 'عقد الأوبال الملكي الفاخر', price: 7800, qty: 1, image: 'images/acc-2.jfif' }
      ]
    }
  ];

  function getStoredOrders() {
    try {
      const raw = localStorage.getItem(STORAGE_ORDERS_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(DEFAULT_DEMO_ORDERS));
        return DEFAULT_DEMO_ORDERS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_DEMO_ORDERS;
    }
  }

  function saveStoredOrders(orders) {
    try {
      localStorage.setItem(STORAGE_ORDERS_KEY, JSON.stringify(orders));
    } catch (e) {}
    renderAll();
  }

  // =========================================================================
  // 3. البذور الافتراضية للكتالوج وإدارة الصور (Catalog & Products Management)
  // =========================================================================
  const DEFAULT_CATALOG_PRODUCTS = [
    {
      id: 'prod-ev-1',
      name: 'فستان السهرة الزمردي الملكي',
      category: 'evening',
      categoryLabel: 'فساتين سهرة',
      price: 14500,
      sku: 'EV-01',
      status: 'in_stock',
      image: 'images/evening-1.jfif',
      desc: 'حرير كريب فاخر بقصة منحوتة وتطريز زمردي يدوي مع شال كاب ملكي.'
    },
    {
      id: 'prod-ev-2',
      name: 'فستان السهرة الياقوتي الكوتور',
      category: 'evening',
      categoryLabel: 'فساتين سهرة',
      price: 16500,
      sku: 'EV-02',
      status: 'in_stock',
      image: 'images/evening-2.jfif',
      desc: 'قماش تفتا راقٍ بلون الياقوت الأحمر مع تفاصيل درابيه يدوية مطعمة بالكريستال.'
    },
    {
      id: 'prod-ev-3',
      name: 'فستان الذهب السائل المطرز يدوياً',
      category: 'evening',
      categoryLabel: 'فساتين سهرة',
      price: 18500,
      sku: 'EV-03',
      status: 'in_stock',
      image: 'images/evening-3.jfif',
      desc: 'تول إيطالي مذهب بخيوط الذهب المعدنية وأحجار شواروفسكي المتلألئة.'
    },
    {
      id: 'prod-ev-4',
      name: 'فستان السهرة الكحلي الملكي',
      category: 'evening',
      categoryLabel: 'فساتين سهرة',
      price: 15200,
      sku: 'EV-04',
      status: 'in_stock',
      image: 'images/evening-4.jfif',
      desc: 'مخمل أزرق ملكي بفتحة رقبة أيقونية وتطريز فضي لامع مستوحى من سماء الليل.'
    },
    {
      id: 'prod-wd-1',
      name: 'فستان زفاف العروس الملكية «أفروديت»',
      category: 'wedding',
      categoryLabel: 'زفاف وعرائس',
      price: 35000,
      sku: 'WD-01',
      status: 'made_to_order',
      image: 'images/wedding-1.jfif',
      desc: 'دانتيل فرنسي كوردونيه مشغول يدوياً مع ذيل ملكي بطول 3 أمتار وطرحة مطرزة.'
    },
    {
      id: 'prod-wd-2',
      name: 'فستان زفاف برنسيس بالتطريز اللؤلؤي',
      category: 'wedding',
      categoryLabel: 'زفاف وعرائس',
      price: 38000,
      sku: 'WD-02',
      status: 'made_to_order',
      image: 'images/wedding-2.jfif',
      desc: 'قصة أميرة منفوشة بطبقات التول الحريري وألف حبة لؤلؤ زراعي طبيعي.'
    },
    {
      id: 'prod-acc-1',
      name: 'تاج الملكة فيكتوريا المرصع بالزركون',
      category: 'accessories',
      categoryLabel: 'إكسسوارات ملكية',
      price: 4500,
      sku: 'AC-01',
      status: 'in_stock',
      image: 'images/acc-1.jfif',
      desc: 'تاج مطلي بالذهب الأبيض عيار 18 مع أحجار زركون سويدي نقية عاكسة للضوء.'
    },
    {
      id: 'prod-acc-2',
      name: 'عقد الأوبال الملكي الفاخر',
      category: 'accessories',
      categoryLabel: 'إكسسوارات ملكية',
      price: 7800,
      sku: 'AC-02',
      status: 'in_stock',
      image: 'images/acc-2.jfif',
      desc: 'طقم متكامل من العقد والأقراط المصنوعة يدوياً بكريستالات عاجية مطلية بالذهب.'
    },
    {
      id: 'prod-ex-1',
      name: 'فستان الكوتور الحصري «إصدار باريس الذهبي»',
      category: 'exclusive',
      categoryLabel: 'المجموعة الحصرية',
      price: 42000,
      sku: 'EX-01',
      status: 'in_stock',
      image: 'images/exclusive-1.jfif',
      desc: 'قطعة واحدة وحيدة تم تفصيلها في أسبوع الموضة بباريس من الحرير الطبيعي والتطريز النادر.'
    }
  ];

  function getStoredCatalog() {
    try {
      const raw = localStorage.getItem(STORAGE_CATALOG_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(DEFAULT_CATALOG_PRODUCTS));
        return DEFAULT_CATALOG_PRODUCTS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_CATALOG_PRODUCTS;
    }
  }

  function saveStoredCatalog(catalog) {
    try {
      localStorage.setItem(STORAGE_CATALOG_KEY, JSON.stringify(catalog));
    } catch (e) {}
    renderAll();
  }

  // =========================================================================
  // 4. البذور الافتراضية لحجوزات العرائس (Bridal Consultations)
  // =========================================================================
  const DEFAULT_BRIDAL_BOOKINGS = [
    {
      id: 'BR-4921',
      dateSubmitted: '١٠ أكتوبر ٢٠٢٦',
      brideName: 'دينا كريم عبد العزيز',
      phone: '01065432198',
      weddingDate: '2026-12-15',
      type: 'جلسة قياس وتصميم حضوري بالأتليه',
      status: 'تم تأكيد الموعد'
    },
    {
      id: 'BR-4880',
      dateSubmitted: '٨ أكتوبر ٢٠٢٦',
      brideName: 'شهد وائل المنصوري',
      phone: '01198765432',
      weddingDate: '2027-01-20',
      type: 'استشارة فيديو مع المصممة الرئيسية',
      status: 'قيد الانتظار'
    }
  ];

  function getStoredBridal() {
    try {
      const raw = localStorage.getItem(STORAGE_BRIDAL_KEY);
      if (!raw) {
        localStorage.setItem(STORAGE_BRIDAL_KEY, JSON.stringify(DEFAULT_BRIDAL_BOOKINGS));
        return DEFAULT_BRIDAL_BOOKINGS;
      }
      return JSON.parse(raw);
    } catch (e) {
      return DEFAULT_BRIDAL_BOOKINGS;
    }
  }

  function saveStoredBridal(list) {
    try {
      localStorage.setItem(STORAGE_BRIDAL_KEY, JSON.stringify(list));
    } catch (e) {}
    renderAll();
  }

  // =========================================================================
  // 5. التبديل بين التبويبات (Tabs Switching)
  // =========================================================================
  window.switchTab = function (tabId) {
    const tabs = ['overview', 'orders', 'products', 'consultations', 'settings'];
    tabs.forEach(t => {
      const content = document.getElementById('tab-content-' + t);
      const btn = document.getElementById('tab-btn-' + t);
      if (content) {
        if (t === tabId) {
          content.classList.remove('hidden');
        } else {
          content.classList.add('hidden');
        }
      }
      if (btn) {
        if (t === tabId) {
          btn.className = 'tab-btn active px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer';
        } else {
          btn.className = 'tab-btn px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-royalBeige/80 hover:text-matteGold hover:bg-espresso transition-all flex items-center gap-2 cursor-pointer';
        }
      }
    });

    // Re-render data for current tab
    if (tabId === 'orders') renderOrdersTable();
    if (tabId === 'products') renderCatalogGrid();
    if (tabId === 'consultations') renderBridalTable();
    if (tabId === 'overview') renderOverview();
  };

  // =========================================================================
  // 6. عرض التقارير والمؤشرات (Overview & KPIs)
  // =========================================================================
  function renderOverview() {
    const orders = getStoredOrders();
    const catalog = getStoredCatalog();
    const bridal = getStoredBridal();

    // KPIs
    const totalSales = orders
      .filter(o => o.status !== 'cancelled')
      .reduce((sum, o) => sum + (o.total || 0), 0);
    const totalOrdersCount = orders.length;
    const pendingOrdersCount = orders.filter(o => o.status === 'pending' || o.status === 'shipped').length;
    const deliveredOrdersCount = orders.filter(o => o.status === 'delivered').length;

    const elSales = document.getElementById('kpi-total-sales');
    const elOrders = document.getElementById('kpi-total-orders');
    const elPending = document.getElementById('kpi-pending-orders');
    const elDelivered = document.getElementById('kpi-delivered-orders');
    const elBridal = document.getElementById('kpi-bridal-count');

    if (elSales) elSales.textContent = formatEGP(totalSales);
    if (elOrders) elOrders.textContent = totalOrdersCount;
    if (elPending) elPending.textContent = pendingOrdersCount;
    if (elDelivered) elDelivered.textContent = deliveredOrdersCount;
    if (elBridal) elBridal.textContent = bridal.length;

    // Badges in Header tabs
    const bOrders = document.getElementById('orders-count-badge');
    const bProducts = document.getElementById('products-count-badge');
    const bConsultations = document.getElementById('consultations-count-badge');
    if (bOrders) bOrders.textContent = totalOrdersCount;
    if (bProducts) bProducts.textContent = catalog.length;
    if (bConsultations) bConsultations.textContent = bridal.length;

    // Catalog stats
    const elCatTotal = document.getElementById('catalog-total-count');
    const elCatAvail = document.getElementById('catalog-available-count');
    if (elCatTotal) elCatTotal.textContent = catalog.length;
    if (elCatAvail) elCatAvail.textContent = catalog.filter(c => c.status === 'in_stock').length;

    // Payment methods breakdown
    const pmCounts = { cod: 0, instapay: 0, vodafone: 0, card: 0 };
    orders.forEach(o => {
      const pm = o.paymentMethod || 'cod';
      if (pmCounts[pm] !== undefined) pmCounts[pm]++;
      else pmCounts.cod++;
    });

    const pmContainer = document.getElementById('payments-breakdown-list');
    if (pmContainer) {
      const totalPms = totalOrdersCount || 1;
      const calcPct = count => Math.round((count / totalPms) * 100);

      pmContainer.innerHTML = `
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">💵 الدفع عند الاستلام (COD)</span>
            <span class="font-bold tabular-nums text-matteGold">${pmCounts.cod} طلبات (${calcPct(pmCounts.cod)}%)</span>
          </div>
          <div class="w-full h-2 rounded-full bg-obsidian overflow-hidden">
            <div class="h-full bg-matteGold rounded-full" style="width: ${calcPct(pmCounts.cod)}%"></div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">⚡ إنستاباي InstaPay</span>
            <span class="font-bold tabular-nums text-matteGold">${pmCounts.instapay} طلبات (${calcPct(pmCounts.instapay)}%)</span>
          </div>
          <div class="w-full h-2 rounded-full bg-obsidian overflow-hidden">
            <div class="h-full bg-amber-400 rounded-full" style="width: ${calcPct(pmCounts.instapay)}%"></div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">📱 فودافون كاش والمحافظ</span>
            <span class="font-bold tabular-nums text-red-400">${pmCounts.vodafone} طلبات (${calcPct(pmCounts.vodafone)}%)</span>
          </div>
          <div class="w-full h-2 rounded-full bg-obsidian overflow-hidden">
            <div class="h-full bg-red-500 rounded-full" style="width: ${calcPct(pmCounts.vodafone)}%"></div>
          </div>
        </div>

        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="flex items-center gap-1.5">💳 كروت ميزة والبطاقات البنكية</span>
            <span class="font-bold tabular-nums text-indigo-400">${pmCounts.card} طلبات (${calcPct(pmCounts.card)}%)</span>
          </div>
          <div class="w-full h-2 rounded-full bg-obsidian overflow-hidden">
            <div class="h-full bg-indigo-500 rounded-full" style="width: ${calcPct(pmCounts.card)}%"></div>
          </div>
        </div>
      `;
    }

    // Governorates breakdown
    const govCounts = {};
    orders.forEach(o => {
      const g = o.gov || 'القاهرة';
      govCounts[g] = (govCounts[g] || 0) + 1;
    });
    const govContainer = document.getElementById('governorates-breakdown-list');
    if (govContainer) {
      const sortedGovs = Object.entries(govCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
      govContainer.innerHTML = sortedGovs.map(([gov, count]) => `
        <div class="p-2.5 rounded-xl bg-obsidian/70 border border-royalBronze/15 flex items-center justify-between">
          <span class="font-semibold text-royalBeige">📍 محافظة ${gov}</span>
          <span class="font-bold text-matteGold tabular-nums">${count} طلبات</span>
        </div>
      `).join('') || '<p class="text-royalBeige/50">لا توجد بيانات كافية</p>';
    }

    // Recent orders table preview
    const recentBody = document.getElementById('recent-orders-table-body');
    const recentTotalEl = document.getElementById('recent-orders-total');
    if (recentTotalEl) recentTotalEl.textContent = totalOrdersCount;

    if (recentBody) {
      recentBody.innerHTML = orders.slice(0, 5).map(o => {
        const statusBadge = getStatusBadgeHTML(o.status);
        return `
          <tr class="hover:bg-obsidian/40 transition-colors">
            <td class="py-3 px-3 font-bold text-matteGold">${o.id}</td>
            <td class="py-3 px-3 font-semibold text-ivory">${o.name}</td>
            <td class="py-3 px-3 text-royalBeige/80">${o.gov}</td>
            <td class="py-3 px-3">${o.paymentLabel || 'الدفع عند الاستلام'}</td>
            <td class="py-3 px-3 font-bold tabular-nums text-matteGold">${formatEGP(o.total)}</td>
            <td class="py-3 px-3">${statusBadge}</td>
            <td class="py-3 px-3 text-center">
              <button
                type="button"
                onclick="window.viewOrderInvoice('${o.id}')"
                class="px-2.5 py-1 rounded bg-matteGold/15 hover:bg-matteGold/30 text-matteGold text-[11px] font-bold"
              >
                الفاتورة
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  function getStatusBadgeHTML(status) {
    if (status === 'shipped') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-900/40 border border-blue-400/40 text-blue-300 text-[10px] font-bold">🚚 تم الشحن</span>';
    }
    if (status === 'delivered') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-900/40 border border-emerald-400/40 text-emerald-300 text-[10px] font-bold">✅ تم التسليم</span>';
    }
    if (status === 'cancelled') {
      return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-900/40 border border-red-400/40 text-red-300 text-[10px] font-bold">❌ ملغي</span>';
    }
    return '<span class="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-900/40 border border-amber-400/40 text-amber-300 text-[10px] font-bold">⏳ جاري التجهيز</span>';
  }

  // =========================================================================
  // 7. إدارة جدول الطلبات (Orders Management & Status Updates)
  // =========================================================================
  window.renderOrdersTable = function () {
    const orders = getStoredOrders();
    const searchVal = document.getElementById('orders-search-input')?.value.toLowerCase().trim() || '';
    const statusVal = document.getElementById('orders-status-filter')?.value || 'all';
    const paymentVal = document.getElementById('orders-payment-filter')?.value || 'all';

    const filtered = orders.filter(o => {
      if (statusVal !== 'all' && o.status !== statusVal) return false;
      if (paymentVal !== 'all' && o.paymentMethod !== paymentVal) return false;
      if (searchVal) {
        const matchesName = o.name?.toLowerCase().includes(searchVal);
        const matchesPhone = o.phone?.includes(searchVal);
        const matchesId = o.id?.toLowerCase().includes(searchVal);
        const matchesGov = o.gov?.toLowerCase().includes(searchVal);
        if (!matchesName && !matchesPhone && !matchesId && !matchesGov) return false;
      }
      return true;
    });

    const tbody = document.getElementById('orders-table-body');
    const noOrdersMsg = document.getElementById('no-orders-msg');
    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = '';
      if (noOrdersMsg) noOrdersMsg.classList.remove('hidden');
      return;
    }

    if (noOrdersMsg) noOrdersMsg.classList.add('hidden');

    tbody.innerHTML = filtered.map(o => {
      const itemsList = (o.items || []).map(it => `
        <div class="flex items-center gap-1.5 py-0.5">
          <img src="${it.image || 'images/evening-1.jfif'}" alt="" class="w-6 h-7 object-cover rounded bg-obsidian shrink-0 border border-matteGold/20" />
          <span class="truncate max-w-[140px] text-[11px] font-medium text-ivory">${it.name} (${it.qty || 1})</span>
        </div>
      `).join('');

      const cleanPhone = (o.phone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('مرحباً أستاذة ' + o.name + '، بخصوص طلبكِ رقم #' + o.id + ' من VoltEdge Atelier')}`;

      return `
        <tr class="hover:bg-obsidian/40 transition-colors">
          <!-- رقم الطلب والتاريخ -->
          <td class="py-3.5 px-4">
            <span class="font-bold text-matteGold block">${o.id}</span>
            <span class="text-[10px] text-royalBeige/60">${o.date}</span>
          </td>

          <!-- العميل ورقم الهاتف -->
          <td class="py-3.5 px-4">
            <span class="font-bold text-ivory block">${o.name}</span>
            <div class="flex items-center gap-1.5 mt-0.5">
              <span dir="ltr" class="text-[11px] text-royalBeige/80 font-mono">${o.phone}</span>
              <a href="${waLink}" target="_blank" rel="noreferrer" title="محادثة واتساب مباشرة" class="text-emerald-400 hover:text-emerald-300 text-xs">
                💬
              </a>
            </div>
          </td>

          <!-- المحافظة والعنوان -->
          <td class="py-3.5 px-4 max-w-[180px]">
            <span class="font-semibold text-matteGold block text-[11px]">${o.gov}</span>
            <span class="text-[11px] text-royalBeige/70 truncate block" title="${o.address}">${o.address}</span>
            ${o.notes ? `<span class="text-[10px] text-royalBronze italic block truncate mt-0.5" title="${o.notes}">ملاحظة: ${o.notes}</span>` : ''}
          </td>

          <!-- القطع المطلوبة -->
          <td class="py-3.5 px-4">
            <div class="space-y-0.5 max-h-20 overflow-y-auto">
              ${itemsList}
            </div>
          </td>

          <!-- وسيلة الدفع -->
          <td class="py-3.5 px-4">
            <span class="text-[11px] font-semibold text-royalBeige block">${o.paymentLabel || 'الدفع عند الاستلام'}</span>
            <span class="text-[10px] text-matteGold/80">شحن مجاني 🇪🇬</span>
          </td>

          <!-- المبلغ -->
          <td class="py-3.5 px-4 font-bold text-matteGold text-sm tabular-nums whitespace-nowrap">
            ${formatEGP(o.total)}
          </td>

          <!-- تغيير الحالة فوري -->
          <td class="py-3.5 px-4">
            <select
              onchange="window.updateOrderStatus('${o.id}', this.value)"
              class="px-2.5 py-1.5 rounded-lg bg-obsidian border border-matteGold/30 text-[11px] font-bold text-ivory outline-none cursor-pointer"
            >
              <option value="pending" ${o.status === 'pending' ? 'selected' : ''}>⏳ جاري التجهيز</option>
              <option value="shipped" ${o.status === 'shipped' ? 'selected' : ''}>🚚 تم الشحن مع المندوب</option>
              <option value="delivered" ${o.status === 'delivered' ? 'selected' : ''}>✅ تم التسليم بنجاح</option>
              <option value="cancelled" ${o.status === 'cancelled' ? 'selected' : ''}>❌ ملغي</option>
            </select>
          </td>

          <!-- الإجراءات -->
          <td class="py-3.5 px-4 text-center whitespace-nowrap">
            <div class="flex items-center justify-center gap-1.5">
              <button
                type="button"
                onclick="window.viewOrderInvoice('${o.id}')"
                class="px-2.5 py-1 rounded bg-matteGold/15 hover:bg-matteGold text-matteGold hover:text-espresso text-[11px] font-bold transition-colors cursor-pointer"
                title="عرض وطباعة الفاتورة"
              >
                الفاتورة 🧾
              </button>
              <button
                type="button"
                onclick="window.deleteOrder('${o.id}')"
                class="p-1 rounded hover:bg-red-950/60 text-red-400 text-xs transition-colors cursor-pointer"
                title="حذف الطلب التجريبي"
              >
                ✕
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  };

  window.updateOrderStatus = function (orderId, newStatus) {
    const orders = getStoredOrders();
    const target = orders.find(o => o.id === orderId);
    if (target) {
      target.status = newStatus;
      saveStoredOrders(orders);
      showAdminToast(`تم تحديث حالة الطلب #${orderId} إلى: ${getStatusLabel(newStatus)} بنجاح ✅`);
    }
  };

  function getStatusLabel(s) {
    if (s === 'shipped') return 'تم الشحن مع المندوب';
    if (s === 'delivered') return 'تم التسليم بنجاح';
    if (s === 'cancelled') return 'ملغي';
    return 'جاري التجهيز';
  }

  window.deleteOrder = function (orderId) {
    if (!confirm(`هل ترغبين بالتأكيد في حذف الطلب التجريبي رقم #${orderId}؟`)) return;
    let orders = getStoredOrders();
    orders = orders.filter(o => o.id !== orderId);
    saveStoredOrders(orders);
    showAdminToast(`تم حذف الطلب #${orderId} بنجاح.`);
  };

  window.createQuickDemoOrder = function () {
    const govs = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'الشرقية', 'الغربية'];
    const names = ['شروق مدحت', 'آية عبد الرحمن', 'ريهام الجوهري', 'دنيا الشاذلي', 'فريدة السلاب'];
    const pms = [
      { key: 'cod', label: 'الدفع عند الاستلام (COD)' },
      { key: 'instapay', label: 'إنستاباي InstaPay مصر' },
      { key: 'vodafone', label: 'فودافون كاش ومحافظ المحمول' }
    ];

    const randomName = names[Math.floor(Math.random() * names.length)];
    const randomGov = govs[Math.floor(Math.random() * govs.length)];
    const randomPm = pms[Math.floor(Math.random() * pms.length)];
    const randomPhone = '010' + Math.floor(10000000 + Math.random() * 90000000);
    const orderId = 'EG-' + Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

    const newOrder = {
      id: orderId,
      date: dateStr,
      timestamp: Date.now(),
      name: randomName,
      phone: randomPhone,
      whatsapp: randomPhone,
      gov: randomGov,
      address: `شارع الثورة - فيلا ${Math.floor(Math.random() * 50) + 1}`,
      notes: 'طلب سريع تجريبي من لوحة التحكم',
      paymentMethod: randomPm.key,
      paymentLabel: randomPm.label,
      total: 16500,
      status: 'pending',
      items: [
        { id: 'ev-demo', name: 'فستان السهرة الياقوتي الكوتور', price: 16500, qty: 1, image: 'images/evening-2.jfif' }
      ]
    };

    const orders = getStoredOrders();
    orders.unshift(newOrder);
    saveStoredOrders(orders);
    showAdminToast(`تم إنشاء الطلب التجريبي الجديد #${orderId} بنجاح! 📦`);
  };

  window.resetOrdersToDemo = function () {
    if (!confirm('هل تودين استعادة سجل الطلبات التجريبية الأصلي؟')) return;
    localStorage.removeItem(STORAGE_ORDERS_KEY);
    renderAll();
    showAdminToast('تم استعادة نماذج الطلبات التجريبية بنجاح 🔄');
  };

  // =========================================================================
  // 8. عرض الفاتورة وطباعتها (Invoice View)
  // =========================================================================
  window.viewOrderInvoice = function (orderId) {
    const orders = getStoredOrders();
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const modal = document.getElementById('invoice-modal');
    const container = document.getElementById('invoice-modal-content');
    if (!modal || !container) return;

    const itemsHtml = (order.items || []).map(it => `
      <div class="flex items-center justify-between py-2 border-b border-royalBronze/10">
        <div class="flex items-center gap-2.5">
          <img src="${it.image || 'images/evening-1.jfif'}" alt="" class="w-10 h-12 object-cover rounded bg-royalBeige shrink-0" />
          <div>
            <strong class="font-bold text-espresso block">${it.name}</strong>
            <span class="text-[11px] text-mutedCocoa">الكمية: ${it.qty || 1} × ${formatEGP(it.price)}</span>
          </div>
        </div>
        <span class="font-bold text-espresso tabular-nums">${formatEGP((it.price || 0) * (it.qty || 1))}</span>
      </div>
    `).join('');

    container.innerHTML = `
      <div class="p-3.5 rounded-xl bg-royalBeige/70 border border-royalBronze/20 flex items-center justify-between">
        <div>
          <span class="text-[11px] text-mutedCocoa block">رقم الفاتورة:</span>
          <strong class="font-display text-xl font-bold text-espresso">#${order.id}</strong>
        </div>
        <div class="text-left">
          <span class="text-[11px] text-mutedCocoa block">تاريخ الإصدار:</span>
          <span class="font-semibold text-espresso">${order.date}</span>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 p-3 rounded-xl bg-ivory border border-royalBronze/15 text-xs">
        <div>
          <span class="text-mutedCocoa block">بيانات العميل:</span>
          <strong class="text-espresso font-bold block">${order.name}</strong>
          <span dir="ltr" class="text-mutedCocoa block font-mono text-[11px]">${order.phone}</span>
        </div>
        <div>
          <span class="text-mutedCocoa block">عنوان التوصيل (مصر 🇪🇬):</span>
          <span class="text-espresso font-semibold block">${order.gov} - ${order.address}</span>
        </div>
      </div>

      <div class="space-y-1">
        <span class="text-xs font-bold text-espresso block">القطع المحجوزة:</span>
        <div class="divide-y divide-royalBronze/10">
          ${itemsHtml}
        </div>
      </div>

      <div class="p-3.5 rounded-xl bg-espresso text-ivory space-y-1.5">
        <div class="flex items-center justify-between text-xs">
          <span class="text-royalBeige/70">طريقة الدفع المعتمدة:</span>
          <span class="font-semibold text-matteGold">${order.paymentLabel || 'الدفع عند الاستلام'}</span>
        </div>
        <div class="flex items-center justify-between text-xs">
          <span class="text-royalBeige/70">تكلفة الشحن لجميع المحافظات:</span>
          <span class="text-emerald-400 font-bold">مجاني ومؤمن 🇪🇬</span>
        </div>
        <div class="flex items-center justify-between pt-1.5 border-t border-matteGold/30 text-sm font-bold">
          <span>المبلغ الإجمالي المستحق:</span>
          <span class="text-matteGold font-extrabold text-base tabular-nums">${formatEGP(order.total)}</span>
        </div>
      </div>
    `;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeInvoiceModal = function () {
    const modal = document.getElementById('invoice-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // =========================================================================
  // 9. إدارة المنتجات والصور (Catalog, Products & Images Management)
  // =========================================================================
  let currentCatalogCategoryFilter = 'all';

  window.filterCatalogByCategory = function (cat) {
    currentCatalogCategoryFilter = cat;
    document.querySelectorAll('.cat-filter-btn').forEach(btn => {
      if (btn.getAttribute('data-cat') === cat) {
        btn.className = 'cat-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-bold bg-matteGold text-espresso';
      } else {
        btn.className = 'cat-filter-btn px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-obsidian text-royalBeige hover:text-matteGold';
      }
    });
    renderCatalogGrid();
  };

  window.renderCatalogGrid = function () {
    const catalog = getStoredCatalog();
    const searchVal = document.getElementById('catalog-search-input')?.value.toLowerCase().trim() || '';

    const filtered = catalog.filter(p => {
      if (currentCatalogCategoryFilter !== 'all' && p.category !== currentCatalogCategoryFilter) return false;
      if (searchVal) {
        const matchesName = p.name?.toLowerCase().includes(searchVal);
        const matchesSku = p.sku?.toLowerCase().includes(searchVal);
        if (!matchesName && !matchesSku) return false;
      }
      return true;
    });

    const container = document.getElementById('catalog-grid');
    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = `
        <div class="col-span-full p-12 text-center text-royalBeige/60 text-sm">
          لا توجد قطع مطابقة للبحث الحالي. اضغطي «إضافة قطعة جديدة» لإضافة فستان أو إكسسوار.
        </div>
      `;
      return;
    }

    container.innerHTML = filtered.map(item => {
      const isAvailable = item.status === 'in_stock';
      const statusBadge = isAvailable
        ? '<span class="px-2 py-0.5 rounded bg-emerald-900/60 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">متوفر للشحن ✅</span>'
        : (item.status === 'made_to_order'
          ? '<span class="px-2 py-0.5 rounded bg-amber-900/60 text-amber-300 border border-amber-500/30 text-[10px] font-bold">تفصيل خاص 🧵</span>'
          : '<span class="px-2 py-0.5 rounded bg-red-900/60 text-red-300 border border-red-500/30 text-[10px] font-bold">نفذت الكمية ❌</span>');

      return `
        <div class="rounded-2xl bg-espresso/80 border border-matteGold/30 overflow-hidden flex flex-col group hover:border-matteGold transition-all">
          
          <!-- صورة القطعة مع زر التعديل السريع -->
          <div class="relative aspect-3/4 overflow-hidden bg-obsidian">
            <img
              src="${item.image || 'images/evening-1.jfif'}"
              alt="${item.name}"
              class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onerror="this.src='images/evening-1.jfif'"
            />
            <div class="absolute top-2.5 right-2.5 flex flex-col gap-1">
              ${statusBadge}
            </div>
            <div class="absolute bottom-2.5 left-2.5">
              <span class="px-2 py-0.5 rounded bg-obsidian/90 text-matteGold text-[10px] font-mono border border-matteGold/30">
                ${item.sku || 'VE-ATELIER'}
              </span>
            </div>
          </div>

          <!-- تفاصيل القطعة -->
          <div class="p-4 flex-1 flex flex-col justify-between space-y-3">
            <div>
              <span class="text-[10px] text-royalBronze font-bold uppercase tracking-wider block">${getCategoryArabicName(item.category)}</span>
              <h4 class="font-display text-base font-bold text-ivory leading-snug mt-0.5 line-clamp-1" title="${item.name}">${item.name}</h4>
              <p class="text-matteGold font-extrabold text-base tabular-nums mt-1">${formatEGP(item.price)}</p>
              ${item.desc ? `<p class="text-[11px] text-royalBeige/60 line-clamp-2 mt-1 leading-relaxed">${item.desc}</p>` : ''}
            </div>

            <!-- أزرار التحكم بالقطعة والصورة -->
            <div class="pt-2 border-t border-matteGold/20 space-y-2">
              <div class="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onclick="window.openEditProductModal('${item.id}')"
                  class="py-2 px-2.5 rounded-xl bg-matteGold hover:bg-goldHover text-espresso font-bold text-xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="تعديل البيانات وتغيير الصورة"
                >
                  <span>✏️</span>
                  <span>تعديل القطعة</span>
                </button>
                <button
                  type="button"
                  onclick="window.toggleProductStatus('${item.id}')"
                  class="py-2 px-2.5 rounded-xl bg-obsidian hover:bg-matteGold/20 border border-matteGold/30 text-royalBeige hover:text-matteGold text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                  title="تبديل حالة التوفر"
                >
                  <span>🔄</span>
                  <span>${isAvailable ? 'إيقاف التوفر' : 'تفعيل التوفر'}</span>
                </button>
              </div>

              <div class="flex items-center justify-between text-[11px] text-royalBeige/60 pt-1">
                <button
                  type="button"
                  onclick="window.deleteProduct('${item.id}')"
                  class="text-red-400 hover:text-red-300 text-[11px] hover:underline cursor-pointer"
                >
                  حذف القطعة 🗑️
                </button>
                <span class="text-[10px] text-royalBeige/40">تعديل فوري</span>
              </div>
            </div>

          </div>

        </div>
      `;
    }).join('');
  };

  function getCategoryArabicName(cat) {
    if (cat === 'evening') return 'فساتين سهرة';
    if (cat === 'wedding') return 'زفاف وعرائس';
    if (cat === 'accessories') return 'إكسسوارات ملكية';
    if (cat === 'exclusive') return 'المجموعة الحصرية';
    return 'كوتور راقٍ';
  }

  // =========================================================================
  // 10. نموذج إضافة وتعديل الفستان / الإكسسوار والصور (Product Modal)
  // =========================================================================
  let currentEditingImage = '';

  window.openAddProductModal = function () {
    const modal = document.getElementById('product-modal');
    const form = document.getElementById('product-form');
    const titleEl = document.getElementById('product-modal-title');
    if (!modal || !form) return;

    form.reset();
    document.getElementById('pm-item-id').value = '';
    titleEl.textContent = 'إضافة فستان / قطعة جديدة للأتيليه ✨';
    currentEditingImage = 'images/evening-1.jfif';
    document.getElementById('pm-image-preview').src = currentEditingImage;
    document.getElementById('pm-image-url').value = '';

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.openEditProductModal = function (itemId) {
    const catalog = getStoredCatalog();
    const item = catalog.find(p => p.id === itemId);
    if (!item) return;

    const modal = document.getElementById('product-modal');
    const titleEl = document.getElementById('product-modal-title');
    if (!modal) return;

    titleEl.textContent = 'تعديل بيانات وصورة: ' + item.name;
    document.getElementById('pm-item-id').value = item.id;
    document.getElementById('pm-name').value = item.name;
    document.getElementById('pm-category').value = item.category || 'evening';
    document.getElementById('pm-price').value = item.price;
    document.getElementById('pm-status').value = item.status || 'in_stock';
    document.getElementById('pm-sku').value = item.sku || '';
    document.getElementById('pm-desc').value = item.desc || '';

    currentEditingImage = item.image || 'images/evening-1.jfif';
    document.getElementById('pm-image-preview').src = currentEditingImage;
    document.getElementById('pm-image-url').value = item.image.startsWith('data:') ? '' : item.image;

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeProductModal = function () {
    const modal = document.getElementById('product-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Upload image from user's machine (FileReader -> base64 DataURL)
  window.handleImageFileUpload = function (event) {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('الرجاء اختيار ملف صورة صالح (JPEG, PNG, WEBP, etc.)');
      return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
      currentEditingImage = e.target.result;
      document.getElementById('pm-image-preview').src = currentEditingImage;
      showAdminToast('تم تحميل الصورة بنجاح! جاهزة للحفظ ✅');
    };
    reader.readAsDataURL(file);
  };

  // Preset image choice
  window.handlePresetImageSelect = function (val) {
    if (!val) return;
    currentEditingImage = val;
    document.getElementById('pm-image-preview').src = currentEditingImage;
    document.getElementById('pm-image-url').value = val;
  };

  // Custom Image URL
  window.handleCustomImageUrl = function (url) {
    if (!url) return;
    currentEditingImage = url;
    document.getElementById('pm-image-preview').src = currentEditingImage;
  };

  // Save product
  window.handleSaveProduct = function () {
    const itemId = document.getElementById('pm-item-id').value.trim();
    const name = document.getElementById('pm-name').value.trim();
    const category = document.getElementById('pm-category').value;
    const price = Number(document.getElementById('pm-price').value);
    const status = document.getElementById('pm-status').value;
    const sku = document.getElementById('pm-sku').value.trim() || ('VE-' + Math.floor(1000 + Math.random() * 9000));
    const desc = document.getElementById('pm-desc').value.trim();

    if (!name || isNaN(price)) {
      alert('يرجى استكمال الحقول المطلوبة (اسم القطعة والسعر).');
      return;
    }

    const catalog = getStoredCatalog();

    if (itemId) {
      // Edit existing product
      const target = catalog.find(p => p.id === itemId);
      if (target) {
        target.name = name;
        target.category = category;
        target.categoryLabel = getCategoryArabicName(category);
        target.price = price;
        target.status = status;
        target.sku = sku;
        target.desc = desc;
        target.image = currentEditingImage || target.image || 'images/evening-1.jfif';
      }
      showAdminToast(`تم تحديث بيانات وصورة «${name}» بنجاح ✨`);
    } else {
      // Add new product
      const newId = 'prod-custom-' + Date.now();
      catalog.unshift({
        id: newId,
        name: name,
        category: category,
        categoryLabel: getCategoryArabicName(category),
        price: price,
        status: status,
        sku: sku,
        desc: desc,
        image: currentEditingImage || 'images/evening-1.jfif'
      });
      showAdminToast(`تمت إضافة القطعة الجديدة «${name}» للكتالوج بنجاح ✨`);
    }

    saveStoredCatalog(catalog);
    window.closeProductModal();
  };

  window.toggleProductStatus = function (itemId) {
    const catalog = getStoredCatalog();
    const target = catalog.find(p => p.id === itemId);
    if (target) {
      target.status = (target.status === 'in_stock') ? 'out_of_stock' : 'in_stock';
      saveStoredCatalog(catalog);
      showAdminToast(`تم تغيير توفر «${target.name}» إلى: ${target.status === 'in_stock' ? 'متوفر' : 'غير متوفر'}`);
    }
  };

  window.deleteProduct = function (itemId) {
    const catalog = getStoredCatalog();
    const target = catalog.find(p => p.id === itemId);
    if (!target) return;

    if (!confirm(`هل أنتِ متأكدة من حذف «${target.name}» من الكتالوج؟`)) return;

    const filtered = catalog.filter(p => p.id !== itemId);
    saveStoredCatalog(filtered);
    showAdminToast(`تم حذف القطعة بنجاح.`);
  };

  window.resetCatalogToDefaults = function () {
    if (!confirm('هل تودين استعادة الكتالوج والصور الأصلية للأتيليه؟')) return;
    localStorage.removeItem(STORAGE_CATALOG_KEY);
    renderAll();
    showAdminToast('تمت استعادة الكتالوج الأصلي بنجاح 🔄');
  };

  // =========================================================================
  // 11. حجوزات العرائس (Bridal Consultations Management)
  // =========================================================================
  function renderBridalTable() {
    const bookings = getStoredBridal();
    const tbody = document.getElementById('bridal-bookings-table-body');
    if (!tbody) return;

    if (bookings.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="py-8 text-center text-royalBeige/60">
            لا توجد حجوزات استشارات عرائس مسجلة حالياً.
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = bookings.map(b => {
      const cleanPhone = (b.phone || '').replace(/[^0-9]/g, '');
      const waNumber = cleanPhone.startsWith('0') ? '2' + cleanPhone : cleanPhone;
      const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent('أهلاً بكِ عروستنا الغالية ' + b.brideName + '، بخصوص موعد استشارة زفافكِ من VoltEdge Atelier')}`;

      return `
        <tr class="hover:bg-obsidian/40 transition-colors">
          <td class="py-3.5 px-4 font-bold text-matteGold">${b.id}</td>
          <td class="py-3.5 px-4 font-bold text-ivory">${b.brideName}</td>
          <td class="py-3.5 px-4">
            <div class="flex items-center gap-1.5">
              <span dir="ltr" class="font-mono text-royalBeige/80">${b.phone}</span>
              <a href="${waLink}" target="_blank" rel="noreferrer" title="واتساب" class="text-emerald-400 hover:text-emerald-300">💬</a>
            </div>
          </td>
          <td class="py-3.5 px-4 font-semibold text-matteGold">${b.weddingDate || 'غير محدد'}</td>
          <td class="py-3.5 px-4 text-royalBeige/80">${b.type || 'حضوري بالأتليه'}</td>
          <td class="py-3.5 px-4">
            <select
              onchange="window.updateBridalBookingStatus('${b.id}', this.value)"
              class="px-2.5 py-1.5 rounded-lg bg-obsidian border border-matteGold/30 text-xs font-semibold text-ivory outline-none"
            >
              <option value="تم تأكيد الموعد" ${b.status === 'تم تأكيد الموعد' ? 'selected' : ''}>✅ تم تأكيد الموعد</option>
              <option value="قيد الانتظار" ${b.status === 'قيد الانتظار' ? 'selected' : ''}>⏳ قيد الانتظار</option>
              <option value="تمت الاستشارة" ${b.status === 'تمت الاستشارة' ? 'selected' : ''}>👑 تمت الاستشارة بنجاح</option>
              <option value="ملغي" ${b.status === 'ملغي' ? 'selected' : ''}>❌ ملغي</option>
            </select>
          </td>
          <td class="py-3.5 px-4 text-center">
            <button
              type="button"
              onclick="window.deleteBridalBooking('${b.id}')"
              class="p-1 text-red-400 hover:text-red-300 text-xs"
              title="حذف الحجز"
            >
              ✕
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  window.updateBridalBookingStatus = function (id, status) {
    const list = getStoredBridal();
    const item = list.find(b => b.id === id);
    if (item) {
      item.status = status;
      saveStoredBridal(list);
      showAdminToast(`تم تحديث حالة موعد العروس بنجاح ✅`);
    }
  };

  window.deleteBridalBooking = function (id) {
    if (!confirm('حذف هذا الحجز التجريبي؟')) return;
    let list = getStoredBridal();
    list = list.filter(b => b.id !== id);
    saveStoredBridal(list);
    showAdminToast('تم حذف الحجز بنجاح.');
  };

  window.addDemoBridalBooking = function () {
    const list = getStoredBridal();
    const refNum = 'BR-' + Math.floor(1000 + Math.random() * 9000);
    const names = ['ميادة سمير', 'ياسمين خفاجة', 'ريم العزازي'];
    const randomName = names[Math.floor(Math.random() * names.length)];

    list.unshift({
      id: refNum,
      dateSubmitted: new Date().toLocaleDateString('ar-EG'),
      brideName: randomName,
      phone: '010' + Math.floor(10000000 + Math.random() * 90000000),
      weddingDate: '2026-11-28',
      type: 'جلسة قياس وتصميم حضوري بالأتليه',
      status: 'قيد الانتظار'
    });

    saveStoredBridal(list);
    showAdminToast(`تمت إضافة حجز عروس تجريبي جديد #${refNum} ✨`);
  };

  // =========================================================================
  // 12. حفظ الإعدادات المصرية (Settings)
  // =========================================================================
  window.saveAtelierSettings = function () {
    const vfPhone = document.getElementById('set-vf-phone')?.value.trim();
    const instaId = document.getElementById('set-instapay-id')?.value.trim();
    const waPhone = document.getElementById('set-wa-phone')?.value.trim();

    const settings = { vfPhone, instaId, waPhone };
    try {
      localStorage.setItem(STORAGE_SETTINGS_KEY, JSON.stringify(settings));
    } catch (e) {}

    showAdminToast('تم حفظ إعدادات الدفع والشحن في مصر بنجاح 💾✨');
  };

  // =========================================================================
  // 13. التهيأة الشاملة (Init & Render All)
  // =========================================================================
  function renderAll() {
    renderOverview();
    renderOrdersTable();
    renderCatalogGrid();
    renderBridalTable();
  }

  function initDashboard() {
    // Fill current admin name
    const adminNameEl = document.getElementById('current-admin-name');
    const storedName = sessionStorage.getItem('voltedge_admin_username') || 'المدير العام';
    if (adminNameEl) adminNameEl.textContent = storedName;

    // Fill settings from localStorage
    try {
      const raw = localStorage.getItem(STORAGE_SETTINGS_KEY);
      if (raw) {
        const s = JSON.parse(raw);
        if (s.vfPhone && document.getElementById('set-vf-phone')) document.getElementById('set-vf-phone').value = s.vfPhone;
        if (s.instaId && document.getElementById('set-instapay-id')) document.getElementById('set-instapay-id').value = s.instaId;
        if (s.waPhone && document.getElementById('set-wa-phone')) document.getElementById('set-wa-phone').value = s.waPhone;
      }
    } catch (e) {}

    renderAll();
  }
  window.initDashboard = initDashboard;

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAuthUI);
  } else {
    checkAuthUI();
  }

})();
