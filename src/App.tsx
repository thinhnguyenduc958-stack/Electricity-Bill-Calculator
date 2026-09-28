import React, { useState, useRef } from 'react';
import {
  Zap,
  RotateCcw,
  Printer,
  AlertCircle,
  FileText,
  Info,
  Building2,
  Calendar,
  Layers,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import {
  calculateElectricity,
  calculateTier,
  formatCurrency,
  numberToVietnameseWords,
  TIER_CONFIGS,
  type CalculationResult,
} from './logic/electricity';

export default function App() {
  // Form input states
  const [customerCode, setCustomerCode] = useState<string>('KH-882914');
  const [customerName, setCustomerName] = useState<string>('Nguyễn Văn An');
  const [oldIndex, setOldIndex] = useState<string>('100');
  const [newIndex, setNewIndex] = useState<string>('280');

  // Result and error states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invoiceResult, setInvoiceResult] = useState<CalculationResult | null>(null);
  const [showTariffGuide, setShowTariffGuide] = useState<boolean>(false);

  // DOM Refs for smooth UX
  const invoiceRef = useRef<HTMLDivElement>(null);
  const formRef = useRef<HTMLDivElement>(null);

  /**
   * Reset the form to fresh state
   */
  const resetForm = () => {
    setCustomerCode('');
    setCustomerName('');
    setOldIndex('');
    setNewIndex('');
    setErrorMessage(null);
    setInvoiceResult(null);

    // Smooth scroll back to form
    formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /**
   * Show invoice and trigger smooth scroll
   */
  const showInvoice = (result: CalculationResult) => {
    setInvoiceResult(result);
    setErrorMessage(null);

    // Smooth scroll to invoice section
    setTimeout(() => {
      invoiceRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 120);
  };

  /**
   * Validate and compute electricity bill
   */
  const handleCalculateElectricity = (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    // 1. Validation: check empty inputs
    if (!customerCode.trim()) {
      setErrorMessage('Vui lòng nhập mã khách hàng.');
      setInvoiceResult(null);
      return;
    }
    if (!customerName.trim()) {
      setErrorMessage('Vui lòng nhập tên khách hàng.');
      setInvoiceResult(null);
      return;
    }
    if (oldIndex.trim() === '') {
      setErrorMessage('Vui lòng nhập chỉ số điện cũ.');
      setInvoiceResult(null);
      return;
    }
    if (newIndex.trim() === '') {
      setErrorMessage('Vui lòng nhập chỉ số điện mới.');
      setInvoiceResult(null);
      return;
    }

    const oldVal = parseFloat(oldIndex);
    const newVal = parseFloat(newIndex);

    // 2. Validation: valid numbers and non-negative
    if (isNaN(oldVal) || isNaN(newVal)) {
      setErrorMessage('Chỉ số điện phải là định dạng số hợp lệ.');
      setInvoiceResult(null);
      return;
    }

    if (oldVal < 0 || newVal < 0) {
      setErrorMessage('Chỉ số điện phải là số lớn hơn hoặc bằng 0.');
      setInvoiceResult(null);
      return;
    }

    // 3. Validation: new index must be >= old index
    if (newVal < oldVal) {
      setErrorMessage('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.');
      setInvoiceResult(null);
      return;
    }

    // Clear previous error
    setErrorMessage(null);

    // 4. Calculate bill according to tiered rates
    const result = calculateElectricity(customerCode, customerName, oldVal, newVal);
    showInvoice(result);
  };

  /**
   * Quick load preset test cases for immediate testing
   */
  const loadTestCase = (
    code: string,
    name: string,
    oldVal: number,
    newVal: number
  ) => {
    setCustomerCode(code);
    setCustomerName(name);
    setOldIndex(oldVal.toString());
    setNewIndex(newVal.toString());
    setErrorMessage(null);

    // Automatically calculate to verify test case
    const result = calculateElectricity(code, name, oldVal, newVal);
    if (newVal >= oldVal) {
      showInvoice(result);
    } else {
      setInvoiceResult(null);
      setErrorMessage('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.');
    }
  };

  /**
   * Handle invoice printing
   */
  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50/40 to-indigo-50/30 text-slate-800 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Navigation & Header (Hidden on print) */}
        <header className="no-print text-center pt-2 pb-1">
          <div className="inline-flex items-center justify-center p-3 bg-blue-600 text-white rounded-2xl shadow-lg shadow-blue-500/20 mb-3">
            <Zap className="w-8 h-8 text-amber-300 fill-amber-300" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            HÓA ĐƠN TIỀN ĐIỆN
          </h1>
          <p className="mt-2 text-base text-slate-600 font-medium">
            Tính tiền điện theo bậc thang lũy tiến
          </p>
        </header>

        {/* Input Form Card (Hidden on print) */}
        <section
          ref={formRef}
          className="no-print bg-white rounded-2xl shadow-xl shadow-slate-200/70 border border-slate-200/80 overflow-hidden"
        >
          {/* Top Form Banner */}
          <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-800 text-white px-6 py-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <Building2 className="w-5 h-5 text-blue-200" />
              <span className="font-semibold text-sm sm:text-base tracking-wide">
                Thông tin tính cước điện sinh hoạt
              </span>
            </div>
            <button
              type="button"
              onClick={() => setShowTariffGuide(!showTariffGuide)}
              className="text-xs bg-white/15 hover:bg-white/25 active:bg-white/30 text-white font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Info className="w-3.5 h-3.5 text-blue-200" />
              {showTariffGuide ? 'Đóng biểu giá' : 'Xem biểu giá 6 bậc'}
            </button>
          </div>

          {/* Quick Tariff Reference Dropdown */}
          {showTariffGuide && (
            <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6 transition-all duration-200">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  Bảng giá điện sinh hoạt 6 bậc hiện hành (EVN)
                </h4>
                <span className="text-xs text-slate-500">VAT áp dụng: 8%</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5 text-xs">
                {TIER_CONFIGS.map((tier) => (
                  <div
                    key={tier.tierNumber}
                    className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex flex-col justify-between"
                  >
                    <div>
                      <div className="font-bold text-blue-900">{tier.name}</div>
                      <div className="text-slate-500 text-[11px] mt-0.5">{tier.rangeDescription}</div>
                    </div>
                    <div className="mt-2 font-mono font-bold text-slate-800 text-sm">
                      {formatCurrency(tier.unitPrice)}
                      <span className="text-[10px] text-slate-500 font-sans font-normal ml-0.5">đ/kWh</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Form Content */}
          <form onSubmit={handleCalculateElectricity} className="p-6 sm:p-8 space-y-6">
            {/* Input Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
              {/* Customer ID */}
              <div>
                <label
                  htmlFor="customerCode"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Mã khách hàng <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="text"
                    id="customerCode"
                    value={customerCode}
                    onChange={(e) => setCustomerCode(e.target.value)}
                    placeholder="Nhập mã khách hàng"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all duration-150"
                  />
                </div>
              </div>

              {/* Customer Name */}
              <div>
                <label
                  htmlFor="customerName"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Tên khách hàng <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="text"
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nhập tên khách hàng"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all duration-150"
                  />
                </div>
              </div>

              {/* Old Meter Index */}
              <div>
                <label
                  htmlFor="oldIndex"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Chỉ số cũ (kWh) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    id="oldIndex"
                    min="0"
                    step="any"
                    value={oldIndex}
                    onChange={(e) => setOldIndex(e.target.value)}
                    placeholder="Nhập số kWh"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all duration-150"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                    kWh
                  </div>
                </div>
              </div>

              {/* New Meter Index */}
              <div>
                <label
                  htmlFor="newIndex"
                  className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2"
                >
                  Chỉ số mới (kWh) <span className="text-rose-500">*</span>
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <input
                    type="number"
                    id="newIndex"
                    min="0"
                    step="any"
                    value={newIndex}
                    onChange={(e) => setNewIndex(e.target.value)}
                    placeholder="Nhập số kWh"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 text-sm font-mono font-medium placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent focus:bg-white transition-all duration-150"
                  />
                  <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-xs font-semibold text-slate-400">
                    kWh
                  </div>
                </div>
              </div>
            </div>

            {/* Error Message Box */}
            {errorMessage && (
              <div
                role="alert"
                className="flex items-start gap-3 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 animate-in fade-in duration-200"
              >
                <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-sm font-medium">{errorMessage}</div>
              </div>
            )}

            {/* Test Case Quick Selectors */}
            <div className="pt-2 border-t border-slate-100">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-slate-500">
                  Dữ liệu mẫu kiểm tra (Test Cases):
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => loadTestCase('KH-882914', 'Nguyễn Văn An', 100, 280)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title="180 kWh (Bậc 1, 2, 3)"
                >
                  Case 1: 100 → 280 (180 kWh)
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCase('KH-102931', 'Trần Thị Mai', 0, 50)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title="50 kWh (Chỉ Bậc 1)"
                >
                  Case 2: 0 → 50 (Bậc 1)
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCase('KH-554109', 'Lê Hoàng Nam', 0, 100)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title="100 kWh (Bậc 1 & 2)"
                >
                  Case 3: 0 → 100 (Bậc 1 & 2)
                </button>
                <button
                  type="button"
                  onClick={() => loadTestCase('KH-773210', 'Công Ty Phúc Thịnh', 0, 500)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title="500 kWh (Đủ 6 bậc)"
                >
                  Case 4: 0 → 500 (Đủ 6 bậc)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setCustomerCode('KH-999999');
                    setCustomerName('Khách Hàng Test');
                    setOldIndex('500');
                    setNewIndex('400');
                    setInvoiceResult(null);
                    setErrorMessage('Chỉ số mới phải lớn hơn hoặc bằng chỉ số cũ.');
                  }}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 border border-slate-200/80 transition-colors"
                  title="Chỉ số mới < Cũ (Báo lỗi)"
                >
                  Case 5: 500 → 400 (Lỗi)
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-3 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 active:bg-slate-200 font-semibold text-sm transition-all duration-150 flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Xóa làm lại
              </button>

              <button
                type="submit"
                className="px-7 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:from-blue-800 active:to-indigo-800 text-white font-bold text-sm shadow-md shadow-blue-500/25 transition-all duration-150 flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                TÍNH HÓA ĐƠN
              </button>
            </div>
          </form>
        </section>

        {/* Invoice Printable View Section */}
        {invoiceResult && (
          <div ref={invoiceRef} className="space-y-4">
            {/* Invoice Control Bar (Hidden on print) */}
            <div className="no-print flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                Đã tính hóa đơn thành công!
              </div>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 sm:flex-initial px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-50 font-medium text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <RotateCcw className="w-4 h-4" />
                  ← Nhập lại
                </button>
                <button
                  type="button"
                  onClick={handlePrintInvoice}
                  className="flex-1 sm:flex-initial px-5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-medium text-xs sm:text-sm shadow-sm transition-colors flex items-center justify-center gap-1.5"
                >
                  <Printer className="w-4 h-4" />
                  🖨 In hóa đơn
                </button>
              </div>
            </div>

            {/* Official Invoice Sheet */}
            <article
              id="invoice-printable"
              className="bg-white rounded-2xl shadow-xl shadow-slate-200/80 border border-slate-200 p-6 sm:p-10 relative overflow-hidden"
            >
              {/* Watermark / decorative top border */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-800" />

              {/* Invoice Header */}
              <div className="border-b border-slate-200 pb-6 mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <Zap className="w-6 h-6 text-blue-600 fill-blue-600" />
                      <h2 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 uppercase">
                        HÓA ĐƠN TIỀN ĐIỆN
                      </h2>
                    </div>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1">
                      Hóa đơn tính tiền điện sinh hoạt theo bậc thang lũy tiến
                    </p>
                  </div>
                  <div className="text-left sm:text-right font-mono text-xs text-slate-600 space-y-1">
                    <div>
                      <span className="text-slate-400 font-sans">Mã HĐ: </span>
                      <span className="font-bold text-slate-800">{invoiceResult.invoiceId}</span>
                    </div>
                    <div className="flex items-center sm:justify-end gap-1.5 text-slate-500">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{invoiceResult.calculationDate}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Customer and Meter Information */}
              <div className="bg-slate-50/80 rounded-xl p-5 border border-slate-200/80 mb-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-900 mb-3.5 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-blue-600" />
                  Thông tin khách hàng & Chỉ số điện
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-y-3 gap-x-6 text-sm">
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">Mã khách hàng:</span>
                    <span className="font-bold text-slate-900 font-mono tracking-wide">
                      {invoiceResult.customerCode}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">Tên khách hàng:</span>
                    <span className="font-bold text-slate-900">
                      {invoiceResult.customerName}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">Chỉ số cũ:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatCurrency(invoiceResult.oldIndex)} kWh
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-xs block mb-0.5">Chỉ số mới:</span>
                    <span className="font-semibold text-slate-800 font-mono">
                      {formatCurrency(invoiceResult.newIndex)} kWh
                    </span>
                  </div>
                  <div className="sm:col-span-2 lg:col-span-2">
                    <span className="text-slate-500 text-xs block mb-0.5">Sản lượng điện tiêu thụ:</span>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100/70 border border-blue-200 rounded-lg">
                      <span className="text-base font-extrabold text-blue-800 font-mono">
                        {formatCurrency(invoiceResult.consumedKwh)}
                      </span>
                      <span className="text-xs font-semibold text-blue-700">kWh</span>
                      <span className="text-xs text-slate-500 font-normal">
                        ({invoiceResult.newIndex} - {invoiceResult.oldIndex})
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Tier Table */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                    Bảng chi tiết điện năng theo bậc
                  </h3>
                  <span className="text-xs text-slate-500">
                    Áp dụng {invoiceResult.tierDetails.length} bậc tiêu thụ
                  </span>
                </div>

                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left border-collapse text-sm">
                    <thead>
                      <tr className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                        <th className="py-3 px-4">Bậc</th>
                        <th className="py-3 px-4 text-center">Số kWh trong bậc</th>
                        <th className="py-3 px-4 text-right">Đơn giá</th>
                        <th className="py-3 px-4 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-sans">
                      {invoiceResult.tierDetails.map((tier) => (
                        <tr key={tier.tierNumber} className="hover:bg-blue-50/30 transition-colors">
                          <td className="py-3.5 px-4 font-semibold text-slate-900">
                            <div className="flex items-center gap-2">
                              <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-blue-100 text-blue-800 text-xs font-bold font-mono">
                                {tier.tierNumber}
                              </span>
                              <span>{tier.name}</span>
                              <span className="text-xs text-slate-400 font-normal hidden sm:inline">
                                ({tier.rangeDescription})
                              </span>
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono font-bold text-slate-800">
                            {formatCurrency(tier.consumedKwh)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono text-slate-700 tabular-nums">
                            {formatCurrency(tier.unitPrice)} <span className="text-xs font-sans text-slate-500">VNĐ/kWh</span>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-900 tabular-nums">
                            {formatCurrency(tier.totalAmount)} <span className="text-xs font-sans text-slate-500">VNĐ</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Invoice Summary Totals */}
              <div className="border-t border-slate-200 pt-5">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  {/* Amount in words */}
                  <div className="max-w-md text-xs sm:text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-200/80 w-full sm:w-auto flex-1">
                    <span className="font-semibold text-slate-700 block mb-1">
                      Số tiền viết bằng chữ:
                    </span>
                    <span className="italic text-slate-800 font-medium">
                      {numberToVietnameseWords(invoiceResult.totalPayment)}
                    </span>
                  </div>

                  {/* Summary Math Calculation */}
                  <div className="w-full sm:w-72 space-y-2.5">
                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>Tổng tiền điện:</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {invoiceResult.formattedSubtotal} VNĐ
                      </span>
                    </div>

                    <div className="flex justify-between items-center text-sm text-slate-600">
                      <span>VAT (8%):</span>
                      <span className="font-mono font-semibold text-slate-900 tabular-nums">
                        {invoiceResult.formattedVat} VNĐ
                      </span>
                    </div>

                    <div className="h-px bg-slate-200 my-1" />

                    {/* Grand Total - Highlighted */}
                    <div className="flex justify-between items-center p-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 text-blue-950">
                      <div>
                        <div className="text-xs font-bold uppercase tracking-wider text-blue-900">
                          TỔNG THANH TOÁN
                        </div>
                        <div className="text-[10px] text-slate-500 font-normal">
                          (Đã bao gồm VAT)
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-lg sm:text-xl font-extrabold font-mono text-blue-700 tabular-nums">
                          {invoiceResult.formattedTotal}
                        </span>
                        <span className="text-xs font-bold text-blue-900 ml-1">VNĐ</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Signatures for Print and Authentic Invoice Layout */}
              <div className="mt-10 pt-6 border-t border-dashed border-slate-300 grid grid-cols-2 text-center text-xs text-slate-600">
                <div>
                  <div className="font-bold text-slate-800 uppercase tracking-wide">
                    Người lập biểu
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-medium italic text-slate-700">
                    Bộ phận Thu ngân EVN
                  </div>
                </div>
                <div>
                  <div className="font-bold text-slate-800 uppercase tracking-wide">
                    Khách hàng
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">(Ký, ghi rõ họ tên)</div>
                  <div className="h-16 flex items-end justify-center font-medium italic text-slate-700">
                    {invoiceResult.customerName}
                  </div>
                </div>
              </div>
            </article>

            {/* Bottom Actions (Hidden on print) */}
            <div className="no-print flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={resetForm}
                className="text-xs sm:text-sm font-semibold text-slate-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-4 h-4" />
                ← Nhập lại hóa đơn khác
              </button>

              <button
                type="button"
                onClick={handlePrintInvoice}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-500/20 flex items-center gap-2 transition-all duration-150"
              >
                <Printer className="w-4 h-4" />
                🖨 In hóa đơn
              </button>
            </div>
          </div>
        )}

        {/* Footer info (Hidden on print) */}
        <footer className="no-print text-center text-xs text-slate-400 pt-6 pb-4">
          <p>© Bài tập 1: TÍNH TIỀN ĐIỆN THEO BẬC THANG LŨY TIẾN</p>
          <p className="mt-1">
            Chạy hoàn toàn trên trình duyệt (Client-side) · Không dùng backend · Chuẩn biểu giá điện EVN
          </p>
        </footer>
      </div>
    </div>
  );
}
