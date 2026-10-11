/**
 * VoltEdge Atelier — Unified Cart & Egyptian Checkout System
 * نظام حقيبة التسوق والدفع الموحد لمصر (إنستاباي، فودافون كاش، ميزة، والدفع عند الاستلام)
 */

(function () {
  'use strict';

  const CART_STORAGE_KEY = 'voltedge_atelier_cart_v1';
  const ATELIER_PHONE = '01024567891';
  const ATELIER_WHATSAPP_INTL = '201024567891';
  const INSTAPAY_ID = 'voltedge@instapay';

  const EGYPT_GOVERNORATES = [
    'القاهرة',
    'الجيزة',
    'الإسكندرية',
    'الدقهلية',
    'الشرقية',
    'القليوبية',
    'الغربية',
    'المنوفية',
    'البحيرة',
    'دمياط',
    'بورسعيد',
    'الإسماعيلية',
    'السويس',
    'كفر الشيخ',
    'الفيوم',
    'بني سويف',
    'المنيا',
    'أسيوط',
    'سوهاج',
    'قنا',
    'الأقصر',
    'أسوان',
    'البحر الأحمر',
    'مطروح',
    'الوادي الجديد',
    'شمال سيناء',
    'جنوب سيناء'
  ];

  // Helper functions
  function formatEGP(amount) {
    return Number(amount || 0).toLocaleString('ar-EG') + ' ج.م';
  }

  window.formatEGP = formatEGP;

  window.copyToClipboard = function (text, successMsg) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        window.showToast(successMsg || 'تم النسخ بنجاح!');
      }).catch(() => {
        fallbackCopy(text, successMsg);
      });
    } else {
      fallbackCopy(text, successMsg);
    }
  };

  function fallbackCopy(text, successMsg) {
    const input = document.createElement('input');
    input.value = text;
    document.body.appendChild(input);
    input.select();
    document.execCommand('copy');
    document.body.removeChild(input);
    window.showToast(successMsg || 'تم النسخ بنجاح!');
  }

  function getCart() {
    try {
      const raw = localStorage.getItem(CART_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveCart(cart) {
    try {
      localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
    } catch (e) {}
    updateCartUI();
  }

  function getCartSummary() {
    const cart = getCart();
    const count = cart.reduce((acc, item) => acc + item.qty, 0);
    const total = cart.reduce((acc, item) => acc + (item.price * item.qty), 0);
    return { count, total, items: cart };
  }

  // Inject UI Modals into the DOM
  function injectCartModals() {
    if (document.getElementById('voltedge-cart-system-injected')) return;

    const container = document.createElement('div');
    container.id = 'voltedge-cart-system-injected';
    container.innerHTML = `
      <!-- 1. نافذة التوجيه الاحترافية عند إضافة المنتج (Added to Cart Prompt) -->
      <div id="added-to-cart-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-3 sm:p-4 bg-espresso/70 backdrop-blur-xs transition-opacity duration-200">
        <div class="relative w-full max-w-lg bg-ivory text-espresso rounded-2xl border-2 border-matteGold/50 shadow-2xl overflow-hidden my-auto transform transition-all animate-fadeIn">
          
          <!-- رأس النافذة الترحيبية -->
          <div class="bg-gradient-to-r from-espresso via-obsidian to-espresso text-ivory p-4 sm:p-5 flex items-center justify-between border-b border-matteGold/30">
            <div class="flex items-center gap-2.5">
              <span class="w-7 h-7 rounded-full bg-matteGold text-espresso flex items-center justify-center font-bold text-xs shrink-0 shadow-sm">✓</span>
              <div>
                <h3 class="font-display text-lg sm:text-xl font-bold text-ivory">تمت الإضافة لحقيبة التسوق بنجاح ✨</h3>
                <p class="text-[11px] text-matteGold/90">قطعة فريدة تم حفظها في سلتكِ الخاصة</p>
              </div>
            </div>
            <button type="button" onclick="window.closeAddedToCartModal()" aria-label="إغلاق النافذة" class="w-8 h-8 rounded-full bg-ivory/10 hover:bg-matteGold hover:text-espresso text-ivory flex items-center justify-center transition-colors text-sm">✕</button>
          </div>

          <!-- تفاصيل القطعة المضافة -->
          <div class="p-5 sm:p-6 space-y-5">
            <div class="flex items-center gap-4 p-3.5 rounded-xl bg-royalBeige/80 border border-royalBronze/20">
              <img id="atc-modal-img" src="" alt="" class="w-16 h-20 sm:w-20 sm:h-24 object-cover rounded-lg bg-royalBeige shrink-0 border border-matteGold/30" />
              <div class="flex-1 min-w-0">
                <span id="atc-modal-cat" class="text-[11px] font-semibold text-royalBronze block"></span>
                <h4 id="atc-modal-title" class="font-display text-base sm:text-lg font-bold text-espresso leading-snug truncate"></h4>
                <p id="atc-modal-price" class="tabular-nums text-base sm:text-lg font-bold text-matteGold mt-1"></p>
                <span class="inline-block mt-1 text-[11px] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">متاحة ومؤكدة الحجز</span>
              </div>
            </div>

            <!-- ملخص السلة والرسالة التوجيهية اللبقة -->
            <div class="bg-ivory border border-royalBronze/20 rounded-xl p-3.5 space-y-1.5 text-center">
              <div class="flex items-center justify-between text-xs text-mutedCocoa pb-1.5 border-b border-royalBronze/10">
                <span>إجمالي قطع السلة: <strong id="atc-modal-cart-count" class="tabular-nums text-espresso font-bold">1</strong></span>
                <span>المبلغ الكلي: <strong id="atc-modal-cart-total" class="tabular-nums text-royalBronze font-bold">0 ج.م</strong></span>
              </div>
              <p class="text-xs sm:text-[13px] text-espresso/90 font-medium pt-1">
                كيف تودين المتابعة الآن؟ نوجهكِ لاختيار الأنسب لكِ بكل سلاسة:
              </p>
            </div>

            <!-- خيارا التوجيه: إتمام الطلب الآن أو متابعة التسوق -->
            <div class="space-y-2.5 pt-1">
              <!-- الخيار 1: إتمام الطلب وتأكيد البيانات -->
              <button
                type="button"
                onclick="window.proceedToCheckoutFromAddedModal()"
                class="w-full py-3.5 px-5 rounded-xl bg-gradient-to-r from-matteGold to-goldHover hover:from-goldHover hover:to-matteGold text-espresso font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-all group"
              >
                <span>إتمام الطلب وتسجيل بيانات التوصيل الآن</span>
                <span class="transition-transform group-hover:-translate-x-1">←</span>
              </button>

              <!-- الخيار 2: متابعة التسوق وإضافة قطع أخرى -->
              <button
                type="button"
                onclick="window.continueShoppingFromAddedModal()"
                class="w-full py-3 px-5 rounded-xl bg-ivory hover:bg-royalBeige border border-royalBronze/30 text-espresso font-semibold text-xs sm:text-sm transition-colors flex items-center justify-center gap-2"
              >
                <span>متابعة تصفح الكولكشن (إضافة قطع أخرى)</span>
                <span class="text-xs text-royalBronze">🛍️</span>
              </button>
            </div>

            <!-- رابط عرض السلة السريع -->
            <div class="text-center pt-1">
              <button type="button" onclick="window.closeAddedToCartModal(); window.openCartDrawer();" class="text-xs text-royalBronze hover:text-espresso underline underline-offset-4">
                أو مراجعة وتعديل محتويات السلة بالتفصيل
              </button>
            </div>
          </div>

        </div>
      </div>

      <!-- 2. نافذة إتمام الطلب وبيانات العميل المصرية (Checkout Modal) -->
      <div id="checkout-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-3 sm:p-4 bg-espresso/70 backdrop-blur-xs overflow-y-auto">
        <div class="relative w-full max-w-2xl bg-ivory text-espresso rounded-2xl border-2 border-matteGold/50 shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-fadeIn">
          
          <!-- رأس نموذج الدفع -->
          <div class="bg-espresso text-ivory p-4 sm:p-5 flex items-center justify-between border-b border-matteGold/40 shrink-0">
            <div>
              <div class="flex items-center gap-2">
                <span class="w-2.5 h-2.5 rounded-full bg-matteGold"></span>
                <h3 class="font-display text-xl sm:text-2xl font-bold text-ivory">إتمام الطلب وتأكيد الحجز الملكي</h3>
              </div>
              <p class="text-xs text-matteGold/90 mt-0.5">شحن مؤمّن ومجاني لجميع محافظات جمهورية مصر العربية 🇪🇬</p>
            </div>
            <button type="button" onclick="window.closeCheckoutModal()" aria-label="إغلاق" class="w-8 h-8 rounded-full bg-ivory/10 hover:bg-matteGold hover:text-espresso text-ivory flex items-center justify-center transition-colors">✕</button>
          </div>

          <!-- محتوى النموذج قابل للتمرير -->
          <div class="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
            
            <!-- ملخص مصغر للقطع المختارة -->
            <div class="bg-royalBeige/70 p-3.5 sm:p-4 rounded-xl border border-royalBronze/20 space-y-2.5">
              <div class="flex items-center justify-between text-xs font-bold text-espresso border-b border-royalBronze/15 pb-2">
                <span>القطع المحجوزة في طلبكِ:</span>
                <span id="checkout-summary-badge" class="tabular-nums text-royalBronze">0 قطع</span>
              </div>
              <div id="checkout-mini-items" class="max-h-28 overflow-y-auto space-y-2 text-xs divide-y divide-royalBronze/10"></div>
              <div class="flex items-center justify-between pt-2 border-t border-royalBronze/15 text-sm font-bold">
                <span>المبلغ الإجمالي المستحق:</span>
                <span id="checkout-total-price" class="tabular-nums text-lg text-matteGold font-extrabold">0 ج.م</span>
              </div>
            </div>

            <!-- نموذج بيانات العميل -->
            <form id="checkout-form" class="space-y-4" onsubmit="event.preventDefault(); window.submitOrder();">
              
              <div class="border-b border-royalBronze/15 pb-2">
                <h4 class="font-display text-base font-bold text-espresso flex items-center gap-2">
                  <span class="w-5 h-5 rounded-full bg-matteGold/20 text-matteGold text-xs flex items-center justify-center font-bold">١</span>
                  بيانات العميل والتوصيل داخل مصر
                </h4>
              </div>

              <!-- الاسم بالكامل -->
              <div>
                <label for="co-name" class="block text-xs font-bold text-espresso mb-1">الاسم ثلاثي / بالكامل <span class="text-red-600">*</span></label>
                <input
                  type="text"
                  id="co-name"
                  required
                  placeholder="مثال: نورهان أحمد الشريف"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all placeholder:text-mutedCocoa/50"
                />
              </div>

              <!-- الهاتف والواتساب -->
              <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label for="co-phone" class="block text-xs font-bold text-espresso mb-1">رقم الهاتف المحمول (مصر) <span class="text-red-600">*</span></label>
                  <input
                    type="tel"
                    id="co-phone"
                    required
                    dir="ltr"
                    placeholder="010xxxxxxxx"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all placeholder:text-mutedCocoa/50 text-right"
                  />
                  <p class="text-[10px] text-mutedCocoa mt-0.5">للتواصل وتأكيد موعد التسليم مع المندوب</p>
                </div>
                <div>
                  <label for="co-whatsapp" class="block text-xs font-bold text-espresso mb-1">رقم الواتساب للتأكيد ومتابعة الشحنة</label>
                  <input
                    type="tel"
                    id="co-whatsapp"
                    dir="ltr"
                    placeholder="01xxxxxxxxx (اختياري)"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all placeholder:text-mutedCocoa/50 text-right"
                  />
                  <p class="text-[10px] text-mutedCocoa mt-0.5">ستصلكِ نسخة من إيصال الحجز عبر واتساب</p>
                </div>
              </div>

              <!-- المحافظة والعنوان -->
              <div class="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label for="co-gov" class="block text-xs font-bold text-espresso mb-1">المحافظة <span class="text-red-600">*</span></label>
                  <select
                    id="co-gov"
                    required
                    class="w-full px-3 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all"
                  >
                    <option value="">اختاري المحافظة...</option>
                    ${EGYPT_GOVERNORATES.map(gov => `<option value="${gov}">${gov}</option>`).join('')}
                  </select>
                </div>
                <div class="sm:col-span-2">
                  <label for="co-address" class="block text-xs font-bold text-espresso mb-1">العنوان التفصيلي <span class="text-red-600">*</span></label>
                  <input
                    type="text"
                    id="co-address"
                    required
                    placeholder="المدينة / المنطقة، اسم الشارع، رقم العمارة أو الفيلا"
                    class="w-full px-3.5 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all placeholder:text-mutedCocoa/50"
                  />
                </div>
              </div>

              <!-- ملاحظات المقاس أو التعديلات الخاصة -->
              <div>
                <label for="co-notes" class="block text-xs font-bold text-espresso mb-1">المقاس أو ملاحظات التعديل الخاصة (اختياري)</label>
                <input
                  type="text"
                  id="co-notes"
                  placeholder="مثال: مقاس M، تفصيل بطول 165 سم، أو موعد محدد للمناسبة"
                  class="w-full px-3.5 py-2.5 rounded-lg bg-ivory border border-royalBronze/30 focus:border-matteGold focus:ring-1 focus:ring-matteGold text-sm text-espresso outline-none transition-all placeholder:text-mutedCocoa/50"
                />
              </div>

              <!-- القسم الثاني: وسائل الدفع المعتمدة في مصر -->
              <div class="pt-4 border-t border-royalBronze/15 space-y-3">
                <div class="flex items-center justify-between">
                  <h4 class="font-display text-base font-bold text-espresso flex items-center gap-2">
                    <span class="w-5 h-5 rounded-full bg-matteGold/20 text-matteGold text-xs flex items-center justify-center font-bold">٢</span>
                    طريقة الدفع في مصر
                  </h4>
                  <span class="text-[11px] text-mutedCocoa">اختاري الطريقة المناسبة لكِ</span>
                </div>

                <div class="grid grid-cols-1 sm:grid-cols-2 gap-3" id="payment-methods-grid">
                  
                  <!-- خيار 1: الدفع عند الاستلام -->
                  <label class="payment-option-card relative p-3.5 rounded-xl border-2 border-matteGold bg-matteGold/10 cursor-pointer flex flex-col justify-between transition-all" onclick="window.selectPaymentMethod('cod')">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="cod" checked class="text-matteGold focus:ring-matteGold accent-[#D4AF37]" />
                        <span class="font-bold text-xs sm:text-sm text-espresso">الدفع عند الاستلام (COD)</span>
                      </div>
                      <span class="text-xs">💵</span>
                    </div>
                    <p class="text-[11px] text-mutedCocoa mt-2 leading-relaxed">ادفعي نقداً لمندوب الشحن عند استلام ومعاينة الفستان أو الإكسسوار.</p>
                    <span class="inline-block mt-2 text-[10px] text-matteGold font-bold">الأكثر طلباً داخل مصر 🇪🇬</span>
                  </label>

                  <!-- خيار 2: إنستاباي InstaPay -->
                  <label class="payment-option-card relative p-3.5 rounded-xl border border-royalBronze/25 bg-ivory hover:bg-royalBeige/40 cursor-pointer flex flex-col justify-between transition-all" onclick="window.selectPaymentMethod('instapay')">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="instapay" class="text-matteGold focus:ring-matteGold accent-[#D4AF37]" />
                        <span class="font-bold text-xs sm:text-sm text-espresso">إنستاباي InstaPay مصر</span>
                      </div>
                      <span class="text-xs">⚡</span>
                    </div>
                    <p class="text-[11px] text-mutedCocoa mt-2 leading-relaxed">تحويل لحظي فوري عبر تطبيق InstaPay المصري إلى المعرف الرسمي للأتيليه.</p>
                    <span class="inline-block mt-2 text-[10px] text-royalBronze font-bold">تحويل بدون رسوم فوراً</span>
                  </label>

                  <!-- خيار 3: فودافون كاش ومحافظ المحمول -->
                  <label class="payment-option-card relative p-3.5 rounded-xl border border-royalBronze/25 bg-ivory hover:bg-royalBeige/40 cursor-pointer flex flex-col justify-between transition-all" onclick="window.selectPaymentMethod('vodafone')">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="vodafone" class="text-matteGold focus:ring-matteGold accent-[#D4AF37]" />
                        <span class="font-bold text-xs sm:text-sm text-espresso">فودافون كاش ومحافظ المحمول</span>
                      </div>
                      <span class="text-xs">📱</span>
                    </div>
                    <p class="text-[11px] text-mutedCocoa mt-2 leading-relaxed">يقبل التحويل من فودافون كاش، أورنج كاش، اتصالات، أو وي باي (WE Pay).</p>
                    <span class="inline-block mt-2 text-[10px] text-red-700 font-bold">محفظة فودافون الرسمية</span>
                  </label>

                  <!-- خيار 4: بطاقات ميزة والبنكية المصرية -->
                  <label class="payment-option-card relative p-3.5 rounded-xl border border-royalBronze/25 bg-ivory hover:bg-royalBeige/40 cursor-pointer flex flex-col justify-between transition-all" onclick="window.selectPaymentMethod('card')">
                    <div class="flex items-start justify-between">
                      <div class="flex items-center gap-2">
                        <input type="radio" name="paymentMethod" value="card" class="text-matteGold focus:ring-matteGold accent-[#D4AF37]" />
                        <span class="font-bold text-xs sm:text-sm text-espresso">كارت ميزة / فيزا البنوك المصرية</span>
                      </div>
                      <span class="text-xs">💳</span>
                    </div>
                    <p class="text-[11px] text-mutedCocoa mt-2 leading-relaxed">دفع آمن بالبطاقات المصرفية وبطاقة ميزة الوطنية المعتمدة من البنك المركزي.</p>
                    <span class="inline-block mt-2 text-[10px] text-indigo-800 font-bold">ميزة الوطنية & VISA</span>
                  </label>

                </div>

                <!-- تفاصيل ديناميكية لطريقة الدفع المختارة -->
                <div id="payment-details-box" class="p-3.5 rounded-xl bg-matteGold/10 border border-matteGold/40 text-xs space-y-2">
                  <div class="flex items-center gap-2 text-espresso font-bold">
                    <span>✓</span>
                    <span id="pm-info-title">الدفع نقداً عند الاستلام (COD)</span>
                  </div>
                  <p id="pm-info-desc" class="text-mutedCocoa text-[11px] leading-relaxed">
                    لا يتطلب أي دفع مسبق؛ سيقوم مندوب الأتيليه بتوصيل طلبكِ مع حقيبة كوتور معقمة ومؤمنة، وتستطيعين معاينة القطعة ودفع قيمتها نقداً.
                  </p>
                  <div id="pm-dynamic-input" class="hidden pt-2 border-t border-matteGold/20"></div>
                </div>

              </div>

              <!-- رسالة خطأ أو تنبيه إن وجد -->
              <div id="co-error-msg" class="hidden p-3 rounded-lg bg-red-50 border border-red-300 text-red-800 text-xs"></div>

              <!-- زر إرسال وتأكيد الطلب -->
              <div class="pt-4 border-t border-royalBronze/15">
                <button
                  type="submit"
                  id="submit-order-btn"
                  class="w-full py-4 px-6 rounded-xl bg-espresso hover:bg-royalBronze text-ivory font-bold text-sm sm:text-base transition-colors shadow-xl flex items-center justify-center gap-2"
                >
                  <span>تأكيد الطلب والحجز الآن</span>
                  <span id="submit-btn-price" class="tabular-nums text-matteGold font-bold"></span>
                </button>
                <p class="text-center text-[10px] text-mutedCocoa mt-2">
                  بالضغط على تأكيد الطلب، يتم حجز القطعة فوراً بأولوية التجهيز وتجهيزها للشحن
                </p>
              </div>

            </form>

          </div>

        </div>
      </div>

      <!-- 3. نافذة تأكيد نجاح الطلب والفاتورة (Order Success Modal) -->
      <div id="order-success-modal" class="fixed inset-0 z-50 hidden items-center justify-center p-3 sm:p-4 bg-espresso/75 backdrop-blur-xs overflow-y-auto">
        <div class="relative w-full max-w-lg bg-ivory text-espresso rounded-2xl border-2 border-matteGold shadow-2xl overflow-hidden my-auto animate-fadeIn max-h-[94vh] flex flex-col">
          
          <div class="bg-gradient-to-r from-espresso to-obsidian text-ivory p-6 text-center border-b border-matteGold/30 shrink-0">
            <div class="w-14 h-14 rounded-full bg-matteGold text-espresso text-2xl font-extrabold flex items-center justify-center mx-auto mb-3 shadow-lg">✓</div>
            <h3 class="font-display text-2xl font-bold text-ivory">مبارك! تم تأكيد طلبكِ الملكي بنجاح ✨</h3>
            <p class="text-xs text-matteGold mt-1">سعداء باختياركِ كوتور VoltEdge Atelier</p>
          </div>

          <div class="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
            
            <!-- بطاقة رقم الطلب والإشعار -->
            <div class="p-4 rounded-xl bg-royalBeige/80 border border-royalBronze/20 text-center space-y-1">
              <span class="text-xs text-mutedCocoa block">رقم الطلب الرسمي:</span>
              <span id="succ-order-id" class="font-display text-2xl font-extrabold text-espresso tracking-wider tabular-nums block">#EG-00000</span>
              <span class="text-[11px] text-royalBronze font-semibold block mt-1">تاريخ الحجز: <span id="succ-order-date"></span></span>
            </div>

            <!-- تفاصيل العميل وطريقة الدفع -->
            <div class="space-y-2.5 text-xs">
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-royalBronze/15">
                <span class="text-mutedCocoa">اسم العميل:</span>
                <strong id="succ-customer-name" class="text-espresso font-bold"></strong>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-royalBronze/15">
                <span class="text-mutedCocoa">رقم الهاتف:</span>
                <strong id="succ-customer-phone" dir="ltr" class="text-espresso font-bold tabular-nums"></strong>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-royalBronze/15">
                <span class="text-mutedCocoa">عنوان التوصيل:</span>
                <strong id="succ-customer-address" class="text-espresso font-bold truncate max-w-[60%]"></strong>
              </div>
              <div class="flex items-center justify-between p-2.5 rounded-lg bg-ivory border border-royalBronze/15">
                <span class="text-mutedCocoa">طريقة الدفع المعتمدة:</span>
                <strong id="succ-payment-method" class="text-matteGold font-bold"></strong>
              </div>
              <div class="flex items-center justify-between p-3 rounded-lg bg-espresso text-ivory font-bold">
                <span>إجمالي المبلغ:</span>
                <span id="succ-total-amount" class="text-matteGold text-base tabular-nums">0 ج.م</span>
              </div>
            </div>

            <!-- تعليمات التحويل في حالة فودافون كاش أو إنستاباي -->
            <div id="succ-transfer-instructions" class="hidden p-3.5 rounded-xl bg-matteGold/15 border border-matteGold text-xs space-y-2"></div>

            <!-- أزرار المتابعة والواتساب -->
            <div class="space-y-2.5 pt-2">
              <a
                id="succ-whatsapp-btn"
                href="#"
                target="_blank"
                rel="noreferrer"
                class="w-full py-3.5 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition-colors text-center"
              >
                <span>متابعة وتأكيد التفاصيل عبر واتساب مباشرة</span>
                <span>💬</span>
              </a>

              <button
                type="button"
                onclick="window.closeSuccessModalAndContinue()"
                class="w-full py-3 px-5 rounded-xl bg-espresso hover:bg-royalBronze text-ivory font-bold text-xs sm:text-sm transition-colors"
              >
                العودة ومتابعة تصفح المتجر
              </button>
            </div>

          </div>

        </div>
      </div>
    `;

    document.body.appendChild(container);
  }

  let selectedPaymentMethod = 'cod';
  let lastAddedItem = null;

  // Change payment method handler
  window.selectPaymentMethod = function (method) {
    selectedPaymentMethod = method;
    const cards = document.querySelectorAll('.payment-option-card');
    cards.forEach(c => {
      c.classList.remove('border-matteGold', 'bg-matteGold/10');
      c.classList.add('border-royalBronze/25', 'bg-ivory');
      const radio = c.querySelector('input[type="radio"]');
      if (radio && radio.value === method) {
        radio.checked = true;
        c.classList.add('border-matteGold', 'bg-matteGold/10');
        c.classList.remove('border-royalBronze/25', 'bg-ivory');
      }
    });

    const infoTitle = document.getElementById('pm-info-title');
    const infoDesc = document.getElementById('pm-info-desc');
    const dynamicInput = document.getElementById('pm-dynamic-input');

    if (!infoTitle || !infoDesc || !dynamicInput) return;

    if (method === 'cod') {
      infoTitle.textContent = 'الدفع نقداً عند الاستلام (Cash on Delivery)';
      infoDesc.textContent = 'لا يتطلب أي دفع مسبق؛ سيقوم مندوب الأتيليه بتوصيل طلبكِ مع حقيبة كوتور معقمة ومؤمنة، وتستطيعين معاينة الفستان والتأكد من مطابقته قبل الدفع نقداً.';
      dynamicInput.classList.add('hidden');
      dynamicInput.innerHTML = '';
    } else if (method === 'instapay') {
      infoTitle.textContent = 'التحويل عبر إنستاباي InstaPay مصر';
      infoDesc.innerHTML = `
        <div class="space-y-1.5 pt-1">
          <div class="flex flex-wrap items-center gap-2">
            <span>معرف إنستاباي:</span>
            <span class="inline-flex items-center gap-1.5 bg-ivory px-2.5 py-1 rounded border border-matteGold text-espresso font-mono font-bold text-xs select-all">
              ${INSTAPAY_ID}
              <button type="button" onclick="window.copyToClipboard('${INSTAPAY_ID}', 'تم نسخ معرف إنستاباي بنجاح!')" class="text-[11px] text-royalBronze hover:text-espresso font-normal underline mr-1 cursor-pointer">نسخ 📋</button>
            </span>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <span>أو برقم الموبايل:</span>
            <span class="inline-flex items-center gap-1.5 bg-ivory px-2.5 py-1 rounded border border-matteGold text-espresso font-mono font-bold text-xs select-all">
              ${ATELIER_PHONE}
              <button type="button" onclick="window.copyToClipboard('${ATELIER_PHONE}', 'تم نسخ رقم الهاتف بنجاح!')" class="text-[11px] text-royalBronze hover:text-espresso font-normal underline mr-1 cursor-pointer">نسخ 📋</button>
            </span>
          </div>
        </div>
      `;
      dynamicInput.classList.remove('hidden');
      dynamicInput.innerHTML = `
        <label class="block text-[11px] font-bold text-espresso mb-1">اسم الحساب المحول منه أو الرقم المرجعي (اختياري للربط السريع):</label>
        <input type="text" id="co-instapay-ref" placeholder="مثال: من حساب أ / نورهان أو رقم العملية" class="w-full px-3 py-1.5 rounded bg-ivory border border-royalBronze/30 text-xs text-espresso outline-none" />
      `;
    } else if (method === 'vodafone') {
      infoTitle.textContent = 'التحويل عبر فودافون كاش ومحافظ المحمول';
      infoDesc.innerHTML = `
        <div class="space-y-1.5 pt-1">
          <div class="flex flex-wrap items-center gap-2">
            <span>رقم محفظة فودافون كاش:</span>
            <span class="inline-flex items-center gap-1.5 bg-ivory px-2.5 py-1 rounded border border-matteGold text-espresso font-mono font-bold text-xs select-all">
              ${ATELIER_PHONE}
              <button type="button" onclick="window.copyToClipboard('${ATELIER_PHONE}', 'تم نسخ رقم المحفظة بنجاح!')" class="text-[11px] text-red-700 hover:text-red-900 font-normal underline mr-1 cursor-pointer">نسخ 📋</button>
            </span>
          </div>
          <p class="text-[10px] text-mutedCocoa">(يقبل التحويل من أي محفظة إلكترونية مصرية: فودافون، أورنج، اتصالات، وي باي)</p>
        </div>
      `;
      dynamicInput.classList.remove('hidden');
      dynamicInput.innerHTML = `
        <label class="block text-[11px] font-bold text-espresso mb-1">رقم المحفظة المحول منها (لتأكيد استلام الإيداع):</label>
        <input type="tel" id="co-wallet-sender" dir="ltr" placeholder="010xxxxxxxx" class="w-full px-3 py-1.5 rounded bg-ivory border border-royalBronze/30 text-xs text-espresso outline-none text-right" />
      `;
    } else if (method === 'card') {
      infoTitle.textContent = 'كارت ميزة الوطنية والبطاقات المصرفية المصرية';
      infoDesc.textContent = 'دفع إلكتروني آمن 100% يدعم بطاقات ميزة الصادرة من جميع البنوك المصرية والبريد المصري، بالإضافة إلى بطاقات فيزا وماستركارد.';
      dynamicInput.classList.add('hidden');
      dynamicInput.innerHTML = '';
    }
  };

  // Add to cart with prompt modal
  window.addToCart = function (id, name, price, image, category) {
    const cart = getCart();
    const existing = cart.find(item => item.id === id);
    if (existing) {
      existing.qty += 1;
    } else {
      cart.push({ id, name, price: Number(price), image, category, qty: 1 });
    }
    saveCart(cart);

    // Save as last added
    lastAddedItem = { id, name, price, image, category };

    // Animate badge
    const badge = document.getElementById('cart-count-badge');
    if (badge) {
      badge.classList.add('scale-125');
      setTimeout(() => badge.classList.remove('scale-125'), 220);
    }

    // Open Added-to-Cart Prompt Modal
    window.openAddedToCartModal(lastAddedItem);
  };

  // Open Added-to-cart prompt modal
  window.openAddedToCartModal = function (item) {
    injectCartModals();
    const modal = document.getElementById('added-to-cart-modal');
    if (!modal) return;

    const img = document.getElementById('atc-modal-img');
    const cat = document.getElementById('atc-modal-cat');
    const title = document.getElementById('atc-modal-title');
    const price = document.getElementById('atc-modal-price');
    const cartCountEl = document.getElementById('atc-modal-cart-count');
    const cartTotalEl = document.getElementById('atc-modal-cart-total');

    const summary = getCartSummary();

    if (img) img.src = item.image;
    if (img) img.alt = item.name;
    if (cat) cat.textContent = item.category || 'VoltEdge Atelier';
    if (title) title.textContent = item.name;
    if (price) price.textContent = formatEGP(item.price);
    if (cartCountEl) cartCountEl.textContent = summary.count;
    if (cartTotalEl) cartTotalEl.textContent = formatEGP(summary.total);

    modal.classList.remove('hidden');
    modal.classList.add('flex');
  };

  window.closeAddedToCartModal = function () {
    const modal = document.getElementById('added-to-cart-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  window.continueShoppingFromAddedModal = function () {
    window.closeAddedToCartModal();
    window.showToast('تم حفظ القطعة في حقيبتكِ، تصفحي المزيد براحة تامة ✨');
  };

  window.proceedToCheckoutFromAddedModal = function () {
    window.closeAddedToCartModal();
    window.openCheckoutModal();
  };

  // Checkout modal
  window.openCheckoutModal = function () {
    injectCartModals();
    const cart = getCart();
    if (cart.length === 0) {
      window.showToast('حقيبة التسوق فارغة! أضيفي قطعة أولاً للطلب.');
      return;
    }

    // Close cart drawer if open
    if (window.closeCartDrawer) window.closeCartDrawer();

    const summary = getCartSummary();
    const summaryBadge = document.getElementById('checkout-summary-badge');
    const totalPriceEl = document.getElementById('checkout-total-price');
    const submitBtnPrice = document.getElementById('submit-btn-price');
    const miniItemsEl = document.getElementById('checkout-mini-items');

    if (summaryBadge) summaryBadge.textContent = summary.count + ' قطعة';
    if (totalPriceEl) totalPriceEl.textContent = formatEGP(summary.total);
    if (submitBtnPrice) submitBtnPrice.textContent = '(' + formatEGP(summary.total) + ')';

    if (miniItemsEl) {
      miniItemsEl.innerHTML = cart.map(item => `
        <div class="flex items-center justify-between py-1.5 gap-2">
          <div class="flex items-center gap-2 min-w-0">
            <img src="${item.image}" alt="" class="w-8 h-10 object-cover rounded shrink-0 bg-royalBeige" />
            <div class="min-w-0 truncate">
              <span class="font-bold text-espresso block truncate">${item.name}</span>
              <span class="text-[10px] text-mutedCocoa">الكمية: ${item.qty} × ${formatEGP(item.price)}</span>
            </div>
          </div>
          <span class="tabular-nums font-bold text-espresso shrink-0">${formatEGP(item.price * item.qty)}</span>
        </div>
      `).join('');
    }

    // Pre-fill phone into WhatsApp if user types phone
    const phoneInput = document.getElementById('co-phone');
    const waInput = document.getElementById('co-whatsapp');
    if (phoneInput && waInput && !waInput.value) {
      phoneInput.onblur = function () {
        if (!waInput.value) waInput.value = phoneInput.value;
      };
    }

    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.remove('hidden');
      modal.classList.add('flex');
    }
  };

  window.closeCheckoutModal = function () {
    const modal = document.getElementById('checkout-modal');
    if (modal) {
      modal.classList.add('hidden');
      modal.classList.remove('flex');
    }
  };

  // Submit Order
  window.submitOrder = function () {
    const name = document.getElementById('co-name')?.value.trim();
    const phone = document.getElementById('co-phone')?.value.trim();
    const whatsapp = document.getElementById('co-whatsapp')?.value.trim() || phone;
    const gov = document.getElementById('co-gov')?.value.trim();
    const address = document.getElementById('co-address')?.value.trim();
    const notes = document.getElementById('co-notes')?.value.trim();
    const errorBox = document.getElementById('co-error-msg');

    if (!name || !phone || !gov || !address) {
      if (errorBox) {
        errorBox.classList.remove('hidden');
        errorBox.textContent = 'الرجاء استكمال جميع الحقول الإلزامية (الاسم، رقم الهاتف، المحافظة، العنوان).';
      }
      return;
    }

    if (errorBox) errorBox.classList.add('hidden');

    const cart = getCart();
    if (cart.length === 0) return;

    const summary = getCartSummary();
    const orderNum = 'EG-' + Math.floor(10000 + Math.random() * 90000);
    const dateStr = new Date().toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' });

    let methodLabel = 'الدفع عند الاستلام (COD)';
    if (selectedPaymentMethod === 'instapay') methodLabel = 'إنستاباي InstaPay مصر';
    if (selectedPaymentMethod === 'vodafone') methodLabel = 'فودافون كاش ومحافظ المحمول';
    if (selectedPaymentMethod === 'card') methodLabel = 'كارت ميزة / فيزا البنوك المصرية';

    // Build WhatsApp message
    const itemsListText = cart.map(item => `• ${item.name} (${item.qty} قطعة - ${formatEGP(item.price * item.qty)})`).join('%0A');
    const waText = `*طلب حجز جديد من متجر VoltEdge Atelier* ✨%0A` +
      `*رقم الطلب:* %23${orderNum}%0A` +
      `*الاسم:* ${encodeURIComponent(name)}%0A` +
      `*الهاتف:* ${phone}%0A` +
      `*المحافظة والعنوان:* ${encodeURIComponent(gov)} - ${encodeURIComponent(address)}%0A` +
      (notes ? `*ملاحظات/المقاس:* ${encodeURIComponent(notes)}%0A` : '') +
      `*القطع المطلوبة:*%0A${itemsListText}%0A` +
      `*طريقة الدفع:* ${encodeURIComponent(methodLabel)}%0A` +
      `*إجمالي الفاتورة:* ${encodeURIComponent(formatEGP(summary.total))} (شحن مجاني مؤمن داخل مصر 🇪🇬)`;

    const waUrl = `https://wa.me/${ATELIER_WHATSAPP_INTL}?text=${waText}`;

    // Fill success modal
    document.getElementById('succ-order-id').textContent = '#' + orderNum;
    document.getElementById('succ-order-date').textContent = dateStr;
    document.getElementById('succ-customer-name').textContent = name;
    document.getElementById('succ-customer-phone').textContent = phone;
    document.getElementById('succ-customer-address').textContent = gov + ' - ' + address;
    document.getElementById('succ-payment-method').textContent = methodLabel;
    document.getElementById('succ-total-amount').textContent = formatEGP(summary.total);
    document.getElementById('succ-whatsapp-btn').href = waUrl;

    // Transfer instructions if needed
    const transferBox = document.getElementById('succ-transfer-instructions');
    if (transferBox) {
      if (selectedPaymentMethod === 'instapay') {
        transferBox.classList.remove('hidden');
        transferBox.innerHTML = `
          <strong class="text-espresso font-bold block mb-1">⚡ تعليمات تحويل إنستاباي:</strong>
          <p>يرجى تحويل مبلغ <strong class="text-royalBronze">${formatEGP(summary.total)}</strong> إلى المعرف الرسمي: <strong class="select-all underline">${INSTAPAY_ID}</strong> أو رقم الهاتف <strong class="select-all">${ATELIER_PHONE}</strong> ثم إرسال لقطة الشاشة عبر زر الواتساب أدناه لتأكيد شحن طلبكِ فوراً.</p>
        `;
      } else if (selectedPaymentMethod === 'vodafone') {
        transferBox.classList.remove('hidden');
        transferBox.innerHTML = `
          <strong class="text-espresso font-bold block mb-1">📱 تعليمات تحويل فودافون كاش:</strong>
          <p>يرجى تحويل مبلغ <strong class="text-royalBronze">${formatEGP(summary.total)}</strong> إلى رقم المحفظة: <strong class="select-all underline text-sm">${ATELIER_PHONE}</strong> ثم الضغط على زر الواتساب لإرسال رسالة التأكيد ومتابعة الشحن.</p>
        `;
      } else {
        transferBox.classList.add('hidden');
      }
    }

    // Save order in localStorage for Admin Dashboard
    try {
      const existingOrders = JSON.parse(localStorage.getItem('voltedge_atelier_orders_v1') || '[]');
      existingOrders.unshift({
        id: orderNum,
        date: dateStr,
        timestamp: Date.now(),
        name: name,
        phone: phone,
        whatsapp: whatsapp,
        gov: gov,
        address: address,
        notes: notes || '',
        paymentMethod: selectedPaymentMethod,
        paymentLabel: methodLabel,
        total: summary.total,
        items: [...cart],
        status: 'pending' // pending: جاري التجهيز, shipped: تم الشحن, delivered: تم التسليم, cancelled: ملغي
      });
      localStorage.setItem('voltedge_atelier_orders_v1', JSON.stringify(existingOrders));
    } catch (e) {
      console.warn('Failed to save order to localStorage', e);
    }

    // Clear cart
    saveCart([]);

    // Close checkout and open success
    window.closeCheckoutModal();
    const successModal = document.getElementById('order-success-modal');
    if (successModal) {
      successModal.classList.remove('hidden');
      successModal.classList.add('flex');
    }
  };

  window.closeSuccessModalAndContinue = function () {
    const successModal = document.getElementById('order-success-modal');
    if (successModal) {
      successModal.classList.add('hidden');
      successModal.classList.remove('flex');
    }
  };

  // Change quantity
  window.changeQty = function (id, delta) {
    let cart = getCart();
    const target = cart.find(item => item.id === id);
    if (!target) return;
    target.qty += delta;
    if (target.qty <= 0) {
      cart = cart.filter(item => item.id !== id);
    }
    saveCart(cart);
  };

  // Update Cart UI in drawer and headers
  function updateCartUI() {
    const summary = getCartSummary();
    const badge = document.getElementById('cart-count-badge');
    if (badge) badge.textContent = summary.count;

    const totalEl = document.getElementById('cart-total-price');
    if (totalEl) totalEl.textContent = formatEGP(summary.total);

    const container = document.getElementById('cart-items-container');
    if (container) {
      if (summary.items.length === 0) {
        container.innerHTML = `
          <div class="text-center py-16 space-y-3">
            <p class="font-display text-xl text-mutedCocoa">حقيبة التسوق فارغة حالياً</p>
            <p class="text-xs text-mutedCocoa/80">استكشفي تصاميم الأتيليه وأضيفي قطعكِ المفضلة</p>
          </div>
        `;
      } else {
        container.innerHTML = summary.items.map(item => `
          <div class="flex items-center gap-3.5 p-3 rounded-xl bg-royalBeige/70 border border-royalBronze/15">
            <img src="${item.image}" alt="${item.name}" referrerPolicy="no-referrer" class="w-16 h-20 object-cover rounded-lg bg-royalBeige shrink-0 border border-matteGold/20" />
            <div class="flex-1 min-w-0">
              <p class="text-[11px] text-royalBronze">${item.category || 'كوتور راقي'}</p>
              <h4 class="font-display text-base font-bold text-espresso truncate">${item.name}</h4>
              <p class="tabular-nums text-xs font-bold text-espresso mt-1">${formatEGP(item.price)}</p>
            </div>
            <div class="flex items-center gap-1.5 bg-ivory px-2 py-1 rounded-lg border border-royalBronze/20">
              <button type="button" onclick="window.changeQty('${item.id}', -1)" aria-label="تقليل" class="w-6 h-6 text-xs font-bold hover:text-royalBronze flex items-center justify-center">-</button>
              <span class="tabular-nums text-xs font-bold px-1">${item.qty}</span>
              <button type="button" onclick="window.changeQty('${item.id}', 1)" aria-label="زيادة" class="w-6 h-6 text-xs font-bold hover:text-royalBronze flex items-center justify-center">+</button>
            </div>
          </div>
        `).join('');
      }
    }
  }

  // Toast
  let toastTimer = null;
  window.showToast = function (message) {
    const toast = document.getElementById('toast-notification');
    const msgEl = document.getElementById('toast-message');
    if (!toast || !msgEl) return;
    msgEl.textContent = message;
    toast.classList.remove('translate-y-24', 'opacity-0');
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      toast.classList.add('translate-y-24', 'opacity-0');
    }, 3200);
  };

  // Cart Drawer open/close
  window.openCartDrawer = function () {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-drawer-backdrop');
    if (!cartDrawer || !cartBackdrop) return;
    cartBackdrop.classList.remove('hidden');
    setTimeout(() => {
      cartBackdrop.classList.remove('opacity-0');
      cartDrawer.classList.remove('translate-x-full');
    }, 10);
  };

  window.closeCartDrawer = function () {
    const cartDrawer = document.getElementById('cart-drawer');
    const cartBackdrop = document.getElementById('cart-drawer-backdrop');
    if (!cartDrawer || !cartBackdrop) return;
    cartBackdrop.classList.add('opacity-0');
    cartDrawer.classList.add('translate-x-full');
    setTimeout(() => cartBackdrop.classList.add('hidden'), 200);
  };

  // Wire up existing page buttons and events
  function initCartSystem() {
    injectCartModals();
    updateCartUI();

    const openCartBtn = document.getElementById('open-cart-btn');
    const closeCartBtn = document.getElementById('close-cart-btn');
    const cartBackdrop = document.getElementById('cart-drawer-backdrop');
    const checkoutBtn = document.getElementById('checkout-btn');

    if (openCartBtn) openCartBtn.onclick = window.openCartDrawer;
    if (closeCartBtn) closeCartBtn.onclick = window.closeCartDrawer;
    if (cartBackdrop) cartBackdrop.onclick = window.closeCartDrawer;

    // Checkout button in the drawer opens the checkout modal!
    if (checkoutBtn) {
      checkoutBtn.onclick = function () {
        const cart = getCart();
        if (cart.length === 0) {
          window.showToast('حقيبة التسوق فارغة! أضيفي قطعة أولاً للطلب.');
          return;
        }
        window.openCheckoutModal();
      };
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initCartSystem);
  } else {
    initCartSystem();
  }

})();
