import { prisma } from '../config/prisma.config';
import { NotFoundError } from '../errors';
import {
  Category,
  LedgerFilters,
  Transaction,
  TransactionDetail,
  TransactionUpdate,
} from '@repo/shared';

export class LedgerService {
  async getTransactions(userId: string, filters: LedgerFilters) {
    const where: any = { userId };

    if (filters.search && filters.search.trim()) {
      const q = filters.search.trim();
      where.OR = [
        { description: { contains: q } },
        { merchant: { contains: q } },
        { note: { contains: q } },
      ];
    }

    if (filters.dateFrom || filters.dateTo) {
      where.txnDate = {};
      if (filters.dateFrom) {
        where.txnDate.gte = new Date(filters.dateFrom);
      }
      if (filters.dateTo) {
        where.txnDate.lte = new Date(filters.dateTo);
      }
    }

    if (filters.categories && filters.categories.length > 0) {
      where.category = { in: filters.categories };
    }

    if (filters.merchants && filters.merchants.length > 0) {
      where.merchant = { in: filters.merchants };
    }

    if (filters.importId) {
      where.importId = filters.importId;
    }

    if (filters.txnType === 'expense') {
      where.amount = { lt: 0 };
    } else if (filters.txnType === 'income') {
      where.amount = { gt: 0 };
    }

    const page = filters.page || 1;
    const pageSize = Math.min(filters.pageSize || 50, 100);
    const skip = (page - 1) * pageSize;

    // Fetch all matching for summary & filtered count
    const allMatching = await prisma.transaction.findMany({
      where,
      select: {
        id: true,
        amount: true,
      },
    });

    // Handle amountMin & amountMax client-side/in-memory if needed or directly in where
    let filteredIds: string[] | null = null;
    if (filters.amountMin !== undefined || filters.amountMax !== undefined) {
      const min = filters.amountMin !== undefined ? filters.amountMin : -Infinity;
      const max = filters.amountMax !== undefined ? filters.amountMax : Infinity;
      const filtered = allMatching.filter((t) => {
        const mag = Math.abs(Number(t.amount));
        return mag >= min && mag <= max;
      });
      filteredIds = filtered.map((t) => t.id);
      where.id = { in: filteredIds };
    }

    const total = filteredIds !== null ? filteredIds.length : allMatching.length;
    const totalAmount = (filteredIds !== null
      ? allMatching.filter((t) => filteredIds!.includes(t.id))
      : allMatching
    ).reduce((sum, t) => sum + Number(t.amount), 0);

    const totalPages = Math.ceil(total / pageSize) || 1;

    const items = await prisma.transaction.findMany({
      where,
      include: {
        import: true,
      },
      orderBy: { txnDate: 'desc' },
      skip,
      take: pageSize,
    });

    const mappedItems: TransactionDetail[] = items.map((t) => ({
      id: t.id,
      userId: t.userId,
      importId: t.importId,
      txnDate: t.txnDate.toISOString(),
      description: t.description,
      merchant: t.merchant,
      amount: Number(t.amount),
      balance: t.balance !== null ? Number(t.balance) : null,
      category: t.category as Category,
      isRecurring: t.isRecurring,
      isMalformed: t.isMalformed,
      dedupHash: t.dedupHash,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
      import: t.import
        ? {
            id: t.import.id,
            userId: t.import.userId,
            filename: t.import.filename,
            bankName: t.import.bankName,
            periodStart: t.import.periodStart ? t.import.periodStart.toISOString() : null,
            periodEnd: t.import.periodEnd ? t.import.periodEnd.toISOString() : null,
            rowsTotal: t.import.rowsTotal,
            rowsImported: t.import.rowsImported,
            rowsDuplicate: t.import.rowsDuplicate,
            createdAt: t.import.createdAt.toISOString(),
          }
        : undefined,
    }));

    return {
      items: mappedItems,
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
      summary: {
        count: total,
        totalAmount: Number(totalAmount.toFixed(2)),
      },
    };
  }

  async getTransaction(userId: string, transactionId: string): Promise<TransactionDetail> {
    const t = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
      include: { import: true },
    });

    if (!t) {
      throw new NotFoundError('Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    return {
      id: t.id,
      userId: t.userId,
      importId: t.importId,
      txnDate: t.txnDate.toISOString(),
      description: t.description,
      merchant: t.merchant,
      amount: Number(t.amount),
      balance: t.balance !== null ? Number(t.balance) : null,
      category: t.category as Category,
      isRecurring: t.isRecurring,
      isMalformed: t.isMalformed,
      dedupHash: t.dedupHash,
      note: t.note,
      createdAt: t.createdAt.toISOString(),
      import: t.import
        ? {
            id: t.import.id,
            userId: t.import.userId,
            filename: t.import.filename,
            bankName: t.import.bankName,
            periodStart: t.import.periodStart ? t.import.periodStart.toISOString() : null,
            periodEnd: t.import.periodEnd ? t.import.periodEnd.toISOString() : null,
            rowsTotal: t.import.rowsTotal,
            rowsImported: t.import.rowsImported,
            rowsDuplicate: t.import.rowsDuplicate,
            createdAt: t.import.createdAt.toISOString(),
          }
        : undefined,
    };
  }

  async updateTransaction(
    userId: string,
    transactionId: string,
    updates: TransactionUpdate
  ): Promise<Transaction> {
    const existing = await prisma.transaction.findFirst({
      where: { id: transactionId, userId },
    });

    if (!existing) {
      throw new NotFoundError('Transaction not found', 'TRANSACTION_NOT_FOUND');
    }

    const categoryChanged = updates.category && updates.category !== existing.category;

    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.transaction.update({
        where: { id: transactionId },
        data: {
          category: updates.category ? (updates.category as any) : undefined,
          note: updates.note !== undefined ? updates.note : undefined,
        },
      });

      // ST-013 Feedback loop: If category changed and merchant is present,
      // update CategoryRule cache (source='user') and propagate to all transactions
      // for this merchant
      if (categoryChanged && existing.merchant) {
        const pattern = existing.merchant.toUpperCase().trim();
        await tx.categoryRule.upsert({
          where: {
            userId_merchantPattern: {
              userId,
              merchantPattern: pattern,
            },
          },
          update: {
            category: updates.category as any,
            source: 'user',
          },
          create: {
            userId,
            merchantPattern: pattern,
            category: updates.category as any,
            source: 'user',
          },
        });

        // Re-categorize all past transactions for that merchant
        await tx.transaction.updateMany({
          where: {
            userId,
            merchant: existing.merchant,
          },
          data: {
            category: updates.category as any,
          },
        });
      }

      return updated;
    });

    return {
      id: result.id,
      userId: result.userId,
      importId: result.importId,
      txnDate: result.txnDate.toISOString(),
      description: result.description,
      merchant: result.merchant,
      amount: Number(result.amount),
      balance: result.balance !== null ? Number(result.balance) : null,
      category: result.category as Category,
      isRecurring: result.isRecurring,
      isMalformed: result.isMalformed,
      dedupHash: result.dedupHash,
      note: result.note,
      createdAt: result.createdAt.toISOString(),
    };
  }
}

export const ledgerService = new LedgerService();
