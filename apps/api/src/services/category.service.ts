import { prisma } from '../config/prisma.config';
import { Category, CategoryRuleSource } from '@repo/shared';

export class CategoryService {
  async getCategoryRules(
    userId: string,
    source?: CategoryRuleSource,
    page = 1,
    pageSize = 50
  ) {
    const where: any = { userId };
    if (source) {
      where.source = source;
    }

    const skip = (page - 1) * pageSize;
    const [total, rules] = await Promise.all([
      prisma.categoryRule.count({ where }),
      prisma.categoryRule.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: rules.map((r) => ({
        id: r.id,
        userId: r.userId,
        merchantPattern: r.merchantPattern,
        category: r.category as Category,
        source: r.source as CategoryRuleSource,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async saveRule(
    userId: string,
    merchantPattern: string,
    category: Category,
    source: CategoryRuleSource = 'user'
  ) {
    const pattern = merchantPattern.toUpperCase().trim();
    const rule = await prisma.categoryRule.upsert({
      where: {
        userId_merchantPattern: {
          userId,
          merchantPattern: pattern,
        },
      },
      update: {
        category: category as any,
        source: source as any,
      },
      create: {
        userId,
        merchantPattern: pattern,
        category: category as any,
        source: source as any,
      },
    });

    return {
      id: rule.id,
      userId: rule.userId,
      merchantPattern: rule.merchantPattern,
      category: rule.category as Category,
      source: rule.source as CategoryRuleSource,
      createdAt: rule.createdAt.toISOString(),
      updatedAt: rule.updatedAt.toISOString(),
    };
  }
}

export const categoryService = new CategoryService();
