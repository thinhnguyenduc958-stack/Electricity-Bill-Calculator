/**
 * Bài tập 1: TÍNH TIỀN ĐIỆN THEO BẬC THANG
 * JavaScript thuần, chạy 100% trên trình duyệt
 */

// Bảng giá điện 6 bậc (EVN)
const TIER_PRICES = [
  { tier: 1, name: "Bậc 1", max: 50, price: 1678 },
  { tier: 2, name: "Bậc 2", max: 50, price: 1734 },
  { tier: 3, name: "Bậc 3", max: 100, price: 2014 },
  { tier: 4, name: "Bậc 4", max: 100, price: 2536 },
  { tier: 5, name: "Bậc 5", max: 100, price: 2834 },
  { tier: 6, name: "Bậc 6", max: Infinity, price: 2927 },
];

/**
 * Định dạng tiền tệ: Dấu chấm phân cách hàng nghìn
 * Ví dụ: 1678 -> 1.678, 83900 -> 83.900, 2653200 -> 2.653.200
 */
function formatCurrency(amount) {
  const rounded = Math.round(amount);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

/**
 * Tính sản lượng và tiền điện theo từng bậc lũy tiến
 * Chỉ trả về những bậc thực sự có sử dụng
 */
function calculateTier(kwh) {
  let remaining = Math.max(0, kwh);
  const tiers = [];

  for (let i = 0; i < TIER_PRICES.length; i++) {
    if (remaining <= 0) break;

    const t = TIER_PRICES[i];
    let units = 0;
    if (t.max === Infinity) {
      units = remaining;
    } else {
      units = Math.min(remaining, t.max);
    }

    if (units > 0) {
      tiers.push({
        tierNumber: t.tier,
        name: t.name,
        consumedKwh: units,
        unitPrice: t.price,
        totalAmount: units * t.price,
      });
      remaining -= units;
    }
  }

  // Trường hợp 0 kWh
  if (tiers.length === 0) {
    tiers.push({
      tierNumber: 1,
      name: "Bậc 1",
      consumedKwh: 0,
      unitPrice: 1678,
      totalAmount: 0,
    });
  }

  return tiers;
}

/**
 * Tính toán hóa đơn tiền điện
 */
function calculateElectricity(customerCode, customerName, oldIndex, newIndex) {
  const consumedKwh = newIndex - oldIndex;
  const tierDetails = calculateTier(consumedKwh);

  const subtotal = tierDetails.reduce((sum, item) => sum + item.totalAmount, 0);
  const vatAmount = Math.round(subtotal * 0.08); // VAT 8%
  const totalPayment = subtotal + vatAmount;

  return {
    customerCode,
    customerName,
    oldIndex,
    newIndex,
    consumedKwh,
    tierDetails,
    subtotal,
    vatAmount,
    totalPayment,
  };
}

/**
 * Hiển thị hóa đơn lên giao diện
 */
function showInvoice(invoice) {
  document.getElementById("inv-customer-code").textContent = invoice.customerCode;
  document.getElementById("inv-customer-name").textContent = invoice.customerName;
  document.getElementById("inv-old-index").textContent = formatCurrency(invoice.oldIndex) + " kWh";
  document.getElementById("inv-new-index").textContent = formatCurrency(invoice.newIndex) + " kWh";
  document.getElementById("inv-kwh").textContent = formatCurrency(invoice.consumedKwh) + " kWh";

  // Render bảng chi tiết các bậc có sử dụng
  const tbody = document.getElementById("inv-tiers-body");
  tbody.innerHTML = "";

  invoice.tierDetails.forEach((tier) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td><strong>${tier.name}</strong></td>
      <td class="text-center font-mono">${formatCurrency(tier.consumedKwh)}</td>
      <td class="text-right">${formatCurrency(tier.unitPrice)} VNĐ/kWh</td>
      <td class="text-right font-bold">${formatCurrency(tier.totalAmount)} VNĐ</td>
    `;
    tbody.appendChild(row);
  });

  // Render tổng cộng
  document.getElementById("inv-subtotal").textContent = formatCurrency(invoice.subtotal) + " VNĐ";
  document.getElementById("inv-vat").textContent = formatCurrency(invoice.vatAmount) + " VNĐ";
  document.getElementById("inv-total").textContent = formatCurrency(invoice.totalPayment) + " VNĐ";

  // Hiển thị phần hóa đơn
  const invoiceSection = document.getElementById("invoice-section");
  invoiceSection.style.display = "block";

  // Cuộn nhẹ xuống hóa đơn
  invoiceSection.scrollIntoView({ behavior: "smooth", block: "start" });
}

/**
 * Reset form về trạng thái ban đầu
 */
function resetForm() {
  document.getElementById("customer-code").value = "";
  document.getElementById("customer-name").value = "";
  document.getElementById("old-index").value = "";
  document.getElementById("new-index").value = "";

  const errorBox = document.getElementById("error-box");
  errorBox.style.display = "none";
  errorBox.textContent = "";

  const invoiceSection = document.getElementById("invoice-section");
  invoiceSection.style.display = "none";

  window.scrollTo({ top: 0, behavior: "smooth" });
}

/**
 * In hóa đơn
 */
function printInvoice() {
  window.print();
}

// Bắt sự kiện form submit
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("calc-form");
  const errorBox = document.getElementById("error-box");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const code = document.getElementById("customer-code").value.trim();
    const name = document.getElementById("customer-name").value.trim();
    const oldStr = document.getElementById("old-index").value.trim();
    const newStr = document.getElementById("new-index").value.trim();

    // 1. Kiểm tra trống
    if (!code || !name || oldStr === "" || newStr === "") {
      errorBox.textContent = "Vui lòng nhập đầy đủ tất cả các trường dữ liệu.";
      errorBox.style.display = "block";
      document.getElementById("invoice-section").style.display = "none";
      return;
    }

    const oldIndex = parseFloat(oldStr);
    const newIndex = parseFloat(newStr);

    // 2. Kiểm tra số >= 0
    if (isNaN(oldIndex) || isNaN(newIndex) || oldIndex < 0 || newIndex < 0) {
      errorBox.textContent = "Chỉ số điện phải là số lớn hơn hoặc bằng 0.";
      errorBox.style.display = "block";
      document.getElementById("invoice-section").style.display = "none";
      return;
    }

    // 3. Kiểm tra chỉ số mới < chỉ số cũ
    if (newIndex < oldIndex) {
      errorBox.textContent = "Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.";
      errorBox.style.display = "block";
      document.getElementById("invoice-section").style.display = "none";
      return;
    }

    // Hợp lệ: ẩn lỗi và tính hóa đơn
    errorBox.style.display = "none";
    const invoice = calculateElectricity(code, name, oldIndex, newIndex);
    showInvoice(invoice);
  });
});
