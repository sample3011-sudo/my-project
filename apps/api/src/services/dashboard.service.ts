import { prisma } from '../config/prisma.config';
import {
  Category,
  CategoryBreakdownItem,
  CategoryBreakdownResponse,
  MonthOption,
  MonthSummary,
  TopMerchant,
  TopMerchantsResponse,
} from '@repo/shared';

export class DashboardService {
  private getMonthDateRange(month: string): { start: Date; end: Date } {
    const [yearStr, monthStr] = month.split('-');
    const year = parseInt(yearStr || '2026', 10);
    const monthNum = parseInt(monthStr || '1', 10); // 1-12

    const start = new Date(Date.UTC(year, monthNum - 1, 1, 0, 0, 0, 0));
    const nextMonth = monthNum === 12 ? 1 : monthNum + 1;
    const nextYear = monthNum === 12 ? year + 1 : year;
    const end = new Date(Date.UTC(nextYear, nextMonth - 1, 1, 0, 0, 0, 0));

    return { start, end };
  }

  async getMonths(userId: string): Promise<MonthOption[]> {
    const transactions = await prisma.transaction.findMany({
      where: { userId },
      select: { txnDate: true },
      orderBy: { txnDate: 'desc' },
    });

    const monthCountMap = new Map<string, number>();
    for (const t of transactions) {
      const monthStr = t.txnDate.toISOString().substring(0, 7);
      monthCountMap.set(monthStr, (monthCountMap.get(monthStr) || 0) + 1);
    }

    const result: MonthOption[] = [];
    monthCountMap.forEach((count, month) => {
      result.push({ month, transactionCount: count });
    });

    result.sort((a, b) => b.month.localeCompare(a.month));
    return result;
  }

  async getMonthSummary(userId: string, month: string): Promise<MonthSummary> {
    const { start, end } = this.getMonthDateRange(month);

    const txns = await prisma.transaction.findMany({
      where: {
        userId,
        txnDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        amount: true,
        category: true,
      },
    });

    let totalIn = 0;
    let totalOut = 0;

    for (const t of txns) {
      const amt = Number(t.amount);
      if (amt > 0 || t.category === 'Income') {
        totalIn += Math.abs(amt);
      } else if (amt < 0 || t.category !== 'Transfer') {
        totalOut += Math.abs(amt);
      }
    }

    const netSavings = totalIn - totalOut;

    return {
      month,
      totalIn: Number(totalIn.toFixed(2)),
      totalOut: Number(totalOut.toFixed(2)),
      netSavings: Number(netSavings.toFixed(2)),
      transactionCount: txns.length,
    };
  }

  async getCategoryBreakdown(
    userId: string,
    month: string
  ): Promise<CategoryBreakdownResponse> {
    const { start, end } = this.getMonthDateRange(month);

    const txns = await prisma.transaction.findMany({
      where: {
        userId,
        txnDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        category: true,
        amount: true,
      },
    });

    const catMap = new Map<Category, { total: number; count: number }>();
    let overallExpense = 0;

    for (const t of txns) {
      const cat = t.category as Category;
      // Skip Income and Transfer from expense breakdown
      if (cat === 'Income' || cat === 'Transfer') continue;

      const magnitude = Math.abs(Number(t.amount));
      overallExpense += magnitude;

      const current = catMap.get(cat) || { total: 0, count: 0 };
      catMap.set(cat, {
        total: current.total + magnitude,
        count: current.count + 1,
      });
    }

    const items: CategoryBreakdownItem[] = [];
    catMap.forEach((data, category) => {
      const percentage =
        overallExpense > 0 ? (data.total / overallExpense) * 100 : 0;
      items.push({
        category,
        totalAmount: Number(data.total.toFixed(2)),
        percentage: Number(percentage.toFixed(2)),
        transactionCount: data.count,
      });
    });

    items.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      month,
      items,
    };
  }

  async getTopMerchants(
    userId: string,
    month: string
  ): Promise<TopMerchantsResponse> {
    const { start, end } = this.getMonthDateRange(month);

    const txns = await prisma.transaction.findMany({
      where: {
        userId,
        txnDate: {
          gte: start,
          lt: end,
        },
      },
      select: {
        merchant: true,
        amount: true,
        category: true,
      },
    });

    const merchantMap = new Map<string, { netSpend: number; count: number }>();

    for (const t of txns) {
      if (!t.merchant) continue;
      const m = t.merchant.trim();
      if (!m) continue;

      // Ignore income / salary depositors from top expense merchants
      if (t.category === 'Income' || t.category === 'Transfer') continue;

      const amt = Number(t.amount);
      const current = merchantMap.get(m) || { netSpend: 0, count: 0 };

      // net spend = debits (negative numbers give positive spend) - credits/refunds (positive numbers reduce spend)
      const spendDelta = -amt;

      merchantMap.set(m, {
        netSpend: current.netSpend + spendDelta,
        count: current.count + 1,
      });
    }

    const items: TopMerchant[] = [];
    merchantMap.forEach((data, merchant) => {
      if (data.netSpend > 0) {
        items.push({
          merchant,
          totalAmount: Number(data.netSpend.toFixed(2)),
          transactionCount: data.count,
        });
      }
    });

    items.sort((a, b) => b.totalAmount - a.totalAmount);

    return {
      month,
      items: items.slice(0, 5), // Top 5
    };
  }
}

export const dashboardService = new DashboardService();
