/**
 * Electricity bill calculation logic by progressive tiers (Bậc thang lũy tiến)
 */

export interface TierConfig {
  tierNumber: number;
  name: string;
  rangeDescription: string;
  unitPrice: number; // VNĐ / kWh
  maxUnits: number | null; // max units in this tier, or null if unlimited
}

export const TIER_CONFIGS: TierConfig[] = [
  { tierNumber: 1, name: 'Bậc 1', rangeDescription: '0 - 50 kWh', unitPrice: 1678, maxUnits: 50 },
  { tierNumber: 2, name: 'Bậc 2', rangeDescription: '51 - 100 kWh', unitPrice: 1734, maxUnits: 50 },
  { tierNumber: 3, name: 'Bậc 3', rangeDescription: '101 - 200 kWh', unitPrice: 2014, maxUnits: 100 },
  { tierNumber: 4, name: 'Bậc 4', rangeDescription: '201 - 300 kWh', unitPrice: 2536, maxUnits: 100 },
  { tierNumber: 5, name: 'Bậc 5', rangeDescription: '301 - 400 kWh', unitPrice: 2834, maxUnits: 100 },
  { tierNumber: 6, name: 'Bậc 6', rangeDescription: 'Từ 401 kWh trở lên', unitPrice: 2927, maxUnits: null },
];

export interface TierResult {
  tierNumber: number;
  name: string;
  rangeDescription: string;
  consumedKwh: number;
  unitPrice: number;
  totalAmount: number;
}

export interface CalculationResult {
  customerCode: string;
  customerName: string;
  oldIndex: number;
  newIndex: number;
  consumedKwh: number;
  tierDetails: TierResult[];
  subtotal: number;
  vatRate: number; // e.g. 0.08
  vatAmount: number;
  totalPayment: number;
  formattedSubtotal: string;
  formattedVat: string;
  formattedTotal: string;
  calculationDate: string;
  invoiceId: string;
}

/**
 * Format integer or rounded number with dot (.) thousand separators
 * e.g. 1678 -> "1.678", 83900 -> "83.900", 2653200 -> "2.653.200"
 */
export function formatCurrency(amount: number): string {
  const rounded = Math.round(amount);
  return rounded.toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

/**
 * Calculates consumption for each progressive tier
 * Returns only tiers that have actual consumption (> 0), or Tier 1 with 0 if consumption is 0
 */
export function calculateTier(totalKwh: number): TierResult[] {
  if (totalKwh === 0) {
    return [
      {
        tierNumber: 1,
        name: 'Bậc 1',
        rangeDescription: '0 - 50 kWh',
        consumedKwh: 0,
        unitPrice: 1678,
        totalAmount: 0,
      },
    ];
  }

  let remainingKwh = Math.max(0, totalKwh);
  const results: TierResult[] = [];

  for (const config of TIER_CONFIGS) {
    if (remainingKwh <= 0) break;

    let kwhInTier = 0;
    if (config.maxUnits !== null) {
      kwhInTier = Math.min(remainingKwh, config.maxUnits);
    } else {
      kwhInTier = remainingKwh;
    }

    if (kwhInTier > 0) {
      const tierTotal = kwhInTier * config.unitPrice;
      results.push({
        tierNumber: config.tierNumber,
        name: config.name,
        rangeDescription: config.rangeDescription,
        consumedKwh: kwhInTier,
        unitPrice: config.unitPrice,
        totalAmount: tierTotal,
      });
      remainingKwh -= kwhInTier;
    }
  }

  return results;
}

/**
 * Main electricity calculation function
 */
export function calculateElectricity(
  customerCode: string,
  customerName: string,
  oldIndex: number,
  newIndex: number
): CalculationResult {
  const consumedKwh = newIndex - oldIndex;
  const tierDetails = calculateTier(consumedKwh);

  const subtotal = tierDetails.reduce((sum, item) => sum + item.totalAmount, 0);
  const vatRate = 0.08; // 8% VAT
  const vatAmount = Math.round(subtotal * vatRate);
  const totalPayment = subtotal + vatAmount;

  const now = new Date();
  const pad = (n: number) => n.toString().padStart(2, '0');
  const calculationDate = `${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const invoiceId = `HD-${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${Math.floor(1000 + Math.random() * 9000)}`;

  return {
    customerCode: customerCode.trim(),
    customerName: customerName.trim(),
    oldIndex,
    newIndex,
    consumedKwh,
    tierDetails,
    subtotal,
    vatRate,
    vatAmount,
    totalPayment,
    formattedSubtotal: formatCurrency(subtotal),
    formattedVat: formatCurrency(vatAmount),
    formattedTotal: formatCurrency(totalPayment),
    calculationDate,
    invoiceId,
  };
}

/**
 * Helper to convert numbers to Vietnamese words for official invoice display
 */
export function numberToVietnameseWords(n: number): string {
  const num = Math.round(n);
  if (num === 0) return 'Không đồng';

  const defaultUnits = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const digits = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];

  function readThreeDigits(three: number, hasHigher: boolean): string {
    const hundreds = Math.floor(three / 100);
    const tens = Math.floor((three % 100) / 10);
    const ones = three % 10;
    let res = '';

    if (hundreds > 0 || hasHigher) {
      res += `${digits[hundreds]} trăm `;
    }

    if (tens === 0 && ones !== 0) {
      if (hundreds > 0 || hasHigher) res += 'lẻ ';
      res += digits[ones];
    } else if (tens === 1) {
      res += 'mười ';
      if (ones === 1) res += 'một';
      else if (ones === 5) res += 'lăm';
      else if (ones > 0) res += digits[ones];
    } else if (tens > 1) {
      res += `${digits[tens]} mươi `;
      if (ones === 1) res += 'mốt';
      else if (ones === 5) res += 'lăm';
      else if (ones > 0) res += digits[ones];
    }

    return res.trim();
  }

  let temp = num;
  const groups: number[] = [];
  while (temp > 0) {
    groups.push(temp % 1000);
    temp = Math.floor(temp / 1000);
  }

  let words = '';
  for (let i = groups.length - 1; i >= 0; i--) {
    const groupVal = groups[i];
    if (groupVal > 0) {
      const groupText = readThreeDigits(groupVal, i < groups.length - 1);
      words += `${groupText} ${defaultUnits[i]} `;
    }
  }

  words = words.trim().replace(/\s+/g, ' ');
  if (!words) return 'Không đồng';
  return words.charAt(0).toUpperCase() + words.slice(1) + ' đồng chẵn.';
}
