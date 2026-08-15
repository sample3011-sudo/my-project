import crypto from 'crypto';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { prisma } from '../config/prisma.config';
import {
  ValidationError,
  NotFoundError,
  PayloadTooLargeError,
} from '../errors';
import {
  BankPreset,
  BankPresetWrite,
  ColumnMapping,
  CommitResult,
  FileType,
  MalformedRow,
  MalformedRowsPatch,
  ParseSummary,
  UploadMalformedData,
  UploadPreview,
  Category,
  CategoryRuleSource,
} from '@repo/shared';
import { Decimal } from '@prisma/client/runtime/library';

interface NormalizedRowData {
  rowIndex: number;
  txnDate: string; // ISO string
  description: string;
  merchant: string | null;
  amount: number; // signed: debit < 0, credit > 0
  balance: number | null;
  dedupHash: string;
  isMalformed: boolean;
}

const DEFAULT_CATEGORY_KEYWORDS: Record<string, Category> = {
  SWIGGY: 'Food',
  ZOMATO: 'Food',
  MCDONALDS: 'Food',
  STARBUCKS: 'Food',
  DOMINOS: 'Food',
  UBER: 'Transport',
  OLA: 'Transport',
  RAPIDO: 'Transport',
  IRCTC: 'Transport',
  PETROL: 'Transport',
  SHELL: 'Transport',
  BLINKIT: 'Groceries',
  ZEPTO: 'Groceries',
  BIGBASKET: 'Groceries',
  DMART: 'Groceries',
  RELIANCE: 'Groceries',
  AMAZON: 'Shopping',
  FLIPKART: 'Shopping',
  MYNTRA: 'Shopping',
  ZARA: 'Shopping',
  NETFLIX: 'Subscriptions',
  SPOTIFY: 'Subscriptions',
  YOUTUBE: 'Subscriptions',
  PRIME: 'Subscriptions',
  HOTSTAR: 'Subscriptions',
  AIRTEL: 'Utilities',
  JIO: 'Utilities',
  BESCOM: 'Utilities',
  TNEB: 'Utilities',
  ELECTRICITY: 'Utilities',
  WATER: 'Utilities',
  GAS: 'Utilities',
  APOLLO: 'Health',
  PHARMEASY: 'Health',
  '1MG': 'Health',
  HOSPITAL: 'Health',
  CLINIC: 'Health',
  PVR: 'Entertainment',
  INOX: 'Entertainment',
  BOOKMYSHOW: 'Entertainment',
  SALARY: 'Income',
  PAYROLL: 'Income',
  INTEREST: 'Income',
  DIVIDEND: 'Income',
  RENT: 'Rent',
};

export class UploadService {
  private parseDateString(dateStr: string): Date | null {
    if (!dateStr || typeof dateStr !== 'string') return null;
    const clean = dateStr.trim();
    if (!clean) return null;

    // Direct ISO / YYYY-MM-DD
    const isoDate = new Date(clean);
    if (!isNaN(isoDate.getTime()) && /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(clean)) {
      return isoDate;
    }

    // DD/MM/YYYY or DD-MM-YYYY
    const dmyMatch = clean.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{2,4})/);
    if (dmyMatch && dmyMatch[1] && dmyMatch[2] && dmyMatch[3]) {
      const day = parseInt(dmyMatch[1], 10);
      const month = parseInt(dmyMatch[2], 10) - 1;
      let year = parseInt(dmyMatch[3], 10);
      if (year < 100) year += 2000;
      const parsed = new Date(Date.UTC(year, month, day));
      if (!isNaN(parsed.getTime())) return parsed;
    }

    // MM/DD/YYYY
    const parsedGeneric = new Date(clean);
    if (!isNaN(parsedGeneric.getTime())) {
      return parsedGeneric;
    }

    return null;
  }

  private parseAmountString(amtStr: unknown): number | null {
    if (amtStr === null || amtStr === undefined || amtStr === '') return null;
    if (typeof amtStr === 'number') return isNaN(amtStr) ? null : amtStr;
    const str = String(amtStr).replace(/₹|,|\$|\s/g, '').trim();
    if (!str) return null;
    const num = parseFloat(str);
    return isNaN(num) ? null : num;
  }

  public deriveMerchant(description: string): string | null {
    if (!description) return null;

    const raw = description.replace(/\r?\n|\r/g, ' ').trim();

    // 1. UPI pattern: UPI/(DR|CR)/<ref>/<Beneficiary>/...
    const upiMatch = raw.match(/UPI\/(?:DR|CR)\/[0-9]+\/([^/]+)/i);
    if (upiMatch && upiMatch[1]) {
      const name = upiMatch[1].trim();
      if (name) return name.toUpperCase();
    }

    // 2. NEFT / IMPS pattern: NEFT*<IFSC>*<REF>*<Beneficiary>
    const neftMatch = raw.match(/NEFT\*[^*]+\*[^*]+\*([A-Za-z0-9\s._-]+)/i);
    if (neftMatch && neftMatch[1]) {
      const name = neftMatch[1].trim().split(/\s+/).slice(0, 3).join(' ');
      if (name) return name.toUpperCase();
    }

    // 3. Card payment pattern
    if (/SBI CREDIT CARD|CREDIT CARD/i.test(raw)) {
      return 'SBI CREDIT CARD';
    }

    // 4. Strip common bank transaction prefixes
    const clean = raw
      .replace(/^(?:WDL\s+TFR|DEP\s+TFR|POS\s+TFR|UPI\s+TFR|TRF\s+TFR|NEFT\s+TFR|IMPS\s+TFR|DEBIT|CREDIT|TRANSFER|WDL|DEP|INF|CHQ)\s+/i, '')
      .replace(/UPI\/(?:DR|CR)\/[0-9A-Za-z/._-]+/gi, '')
      .replace(/\b(?:AT\s+[0-9]+\s+[A-Za-z0-9\s()]+)\b/gi, '')
      .replace(/[^A-Za-z0-9\s.-]/g, ' ')
      .trim();

    const parts = clean.split(/\s+/).filter((p) => p.length > 1 && !/^[0-9]+$/.test(p));
    if (parts.length > 0) {
      return parts.slice(0, 2).join(' ').toUpperCase();
    }

    const fallback = raw.split(/\s+/)[0];
    return fallback ? fallback.toUpperCase() : null;
  }

  private computeDedupHash(
    userId: string,
    txnDate: string,
    amount: number,
    normalizedDescription: string
  ): string {
    const raw = `${userId}|${txnDate}|${amount.toFixed(2)}|${normalizedDescription}`;
    return crypto.createHash('sha256').update(raw).digest('hex');
  }

  async createSession(
    userId: string,
    fileBuffer: Buffer,
    originalFilename: string,
    bankName?: string
  ): Promise<UploadPreview> {
    if (!fileBuffer || fileBuffer.length === 0) {
      throw new ValidationError('The selected file appears to be empty.', 'UPLOAD_EMPTY_FILE');
    }

    if (fileBuffer.length > 10 * 1024 * 1024) {
      throw new PayloadTooLargeError('File is too large. Maximum size is 10 MB.', 'UPLOAD_FILE_TOO_LARGE');
    }

    const lowerExt = originalFilename.toLowerCase();
    let fileType: FileType;
    if (lowerExt.endsWith('.csv')) {
      fileType = 'CSV';
    } else if (lowerExt.endsWith('.xlsx')) {
      fileType = 'XLSX';
    } else if (lowerExt.endsWith('.xls')) {
      fileType = 'XLS';
    } else {
      throw new ValidationError(
        'Unsupported file type. Please upload a CSV or Excel file.',
        'UPLOAD_INVALID_FILE_TYPE'
      );
    }

    let headers: string[] = [];
    let rawRows: Array<Record<string, string>> = [];

    try {
      if (fileType === 'CSV') {
        const text = fileBuffer.toString('utf-8');
        const parsed = Papa.parse<Record<string, string>>(text, {
          header: true,
          skipEmptyLines: true,
        });

        if (parsed.errors && parsed.errors.length > 0 && (!parsed.data || parsed.data.length === 0)) {
          throw new ValidationError('We could not parse this CSV file.', 'UPLOAD_PARSE_ERROR');
        }

        headers = parsed.meta.fields || [];
        rawRows = parsed.data;
      } else {
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
          throw new ValidationError('Excel file contains no sheets.', 'UPLOAD_PARSE_ERROR');
        }
        const sheet = workbook.Sheets[sheetName];
        if (!sheet) {
          throw new ValidationError('Excel sheet could not be read.', 'UPLOAD_PARSE_ERROR');
        }
        const jsonData = XLSX.utils.sheet_to_json<Record<string, any>>(sheet, {
          defval: '',
        });

        if (jsonData.length === 0) {
          throw new ValidationError('The selected file appears to be empty.', 'UPLOAD_EMPTY_FILE');
        }

        headers = Object.keys(jsonData[0] || {});
        rawRows = jsonData.map((row) => {
          const stringRow: Record<string, string> = {};
          for (const key of Object.keys(row)) {
            stringRow[key] = String(row[key] ?? '');
          }
          return stringRow;
        });
      }
    } catch (err: any) {
      if (err instanceof ValidationError) throw err;
      throw new ValidationError(
        fileType === 'CSV'
          ? 'We could not parse this CSV file.'
          : 'We could not read this Excel file.',
        'UPLOAD_PARSE_ERROR'
      );
    }

    if (headers.length < 2) {
      throw new ValidationError(
        'This file does not appear to be a valid bank statement (too few columns).',
        'MAPPING_INSUFFICIENT_COLUMNS'
      );
    }

    // Auto-detect preset if bankName is provided or saved preset exists
    let mapping: ColumnMapping | undefined;
    if (bankName) {
      const preset = await prisma.columnMapping.findUnique({
        where: {
          userId_bankName: {
            userId,
            bankName,
          },
        },
      });
      if (preset) {
        mapping = preset.mapping as unknown as ColumnMapping;
      }
    }

    // If no preset, attempt simple heuristic match
    if (!mapping) {
      const autoDate = headers.find((h) => /date|txn.?date|trans.?date|value.?date/i.test(h));
      const autoDesc = headers.find((h) => /desc|narration|particulars|remark|details/i.test(h));
      const autoDebit = headers.find((h) => /debit|withdrawal|dr|paid/i.test(h));
      const autoCredit = headers.find((h) => /credit|deposit|cr|received/i.test(h));
      const autoBalance = headers.find((h) => /balance|bal/i.test(h));
      const autoRef = headers.find((h) => /ref|chq|cheque|utr|id/i.test(h));

      if (autoDate && autoDesc && (autoDebit || autoCredit)) {
        mapping = {
          date: autoDate,
          description: autoDesc,
          debit: autoDebit || null,
          credit: autoCredit || null,
          balance: autoBalance || null,
          ref: autoRef || null,
        };
      }
    }

    const session = await prisma.uploadSession.create({
      data: {
        userId,
        filename: originalFilename,
        fileType,
        bankName: bankName || null,
        headers: headers as any,
        rawRows: rawRows as any,
        normalizedRows: [] as any,
        malformedRows: [] as any,
        mapping: (mapping as any) || null,
        status: mapping ? 'mapped' : 'uploaded',
      },
    });

    return {
      uploadId: session.id,
      filename: session.filename,
      fileType: session.fileType as FileType,
      bankName: session.bankName || undefined,
      headers,
      sampleRows: rawRows.slice(0, 5),
      mapping,
    };
  }

  async getPreview(userId: string, uploadId: string): Promise<UploadPreview> {
    const session = await prisma.uploadSession.findFirst({
      where: { id: uploadId, userId },
    });

    if (!session) {
      throw new NotFoundError('Upload session not found', 'UPLOAD_SESSION_NOT_FOUND');
    }

    const headers = (session.headers as string[]) || [];
    const rawRows = (session.rawRows as Array<Record<string, string>>) || [];

    return {
      uploadId: session.id,
      filename: session.filename,
      fileType: session.fileType as FileType,
      bankName: session.bankName || undefined,
      headers,
      sampleRows: rawRows.slice(0, 5),
      mapping: (session.mapping as unknown as ColumnMapping) || undefined,
    };
  }

  async saveMapping(userId: string, uploadId: string, mapping: ColumnMapping): Promise<UploadPreview> {
    const session = await prisma.uploadSession.findFirst({
      where: { id: uploadId, userId },
    });

    if (!session) {
      throw new NotFoundError('Upload session not found', 'UPLOAD_SESSION_NOT_FOUND');
    }

    if (!mapping.date || !mapping.description || (!mapping.debit && !mapping.credit)) {
      throw new ValidationError(
        'Please map the Date, Description, and at least one of Debit or Credit columns.',
        'MAPPING_INCOMPLETE'
      );
    }

    // Check duplicate column mapping
    const mappedValues = [
      mapping.date,
      mapping.description,
      mapping.debit,
      mapping.credit,
      mapping.balance,
      mapping.ref,
    ].filter(Boolean);

    const uniqueValues = new Set(mappedValues);
    if (uniqueValues.size !== mappedValues.length) {
      throw new ValidationError('Each column can only be mapped to one field.', 'MAPPING_DUPLICATE');
    }

    const updated = await prisma.uploadSession.update({
      where: { id: uploadId },
      data: {
        mapping: mapping as any,
        status: 'mapped',
      },
    });

    const headers = (updated.headers as string[]) || [];
    const rawRows = (updated.rawRows as Array<Record<string, string>>) || [];

    return {
      uploadId: updated.id,
      filename: updated.filename,
      fileType: updated.fileType as FileType,
      bankName: updated.bankName || undefined,
      headers,
      sampleRows: rawRows.slice(0, 5),
      mapping,
    };
  }

  async getBankPresets(userId: string, bankName?: string): Promise<BankPreset[] | BankPreset> {
    if (bankName) {
      const preset = await prisma.columnMapping.findUnique({
        where: {
          userId_bankName: {
            userId,
            bankName,
          },
        },
      });

      if (!preset) {
        throw new NotFoundError(`Bank preset for '${bankName}' not found`, 'BANK_PRESET_NOT_FOUND');
      }

      return {
        id: preset.id,
        userId: preset.userId,
        bankName: preset.bankName,
        mapping: preset.mapping as unknown as ColumnMapping,
        createdAt: preset.createdAt.toISOString(),
        updatedAt: preset.updatedAt.toISOString(),
      };
    }

    const presets = await prisma.columnMapping.findMany({
      where: { userId },
      orderBy: { bankName: 'asc' },
    });

    return presets.map((p) => ({
      id: p.id,
      userId: p.userId,
      bankName: p.bankName,
      mapping: p.mapping as unknown as ColumnMapping,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
    }));
  }

  async saveBankPreset(userId: string, data: BankPresetWrite): Promise<BankPreset> {
    const upserted = await prisma.columnMapping.upsert({
      where: {
        userId_bankName: {
          userId,
          bankName: data.bankName,
        },
      },
      update: {
        mapping: data.mapping as any,
      },
      create: {
        userId,
        bankName: data.bankName,
        mapping: data.mapping as any,
      },
    });

    return {
      id: upserted.id,
      userId: upserted.userId,
      bankName: upserted.bankName,
      mapping: upserted.mapping as unknown as ColumnMapping,
      createdAt: upserted.createdAt.toISOString(),
      updatedAt: upserted.updatedAt.toISOString(),
    };
  }

  async parseSession(userId: string, uploadId: string): Promise<UploadMalformedData> {
    const session = await prisma.uploadSession.findFirst({
      where: { id: uploadId, userId },
    });

    if (!session) {
      throw new NotFoundError('Upload session not found', 'UPLOAD_SESSION_NOT_FOUND');
    }

    if (!session.mapping) {
      throw new ValidationError('Please complete the column mapping step.', 'PARSE_FAILED');
    }

    const mapping = session.mapping as unknown as ColumnMapping;
    const rawRows = (session.rawRows as Array<Record<string, string>>) || [];

    const normalizedRows: NormalizedRowData[] = [];
    const malformedRows: MalformedRow[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      const raw = rawRows[index] || {};
      const reasons: string[] = [];

      // 1. Date
      const dateVal = raw[mapping.date] || '';
      const parsedDate = this.parseDateString(dateVal);
      if (!parsedDate) {
        reasons.push(`Could not parse date: '${dateVal}'`);
      }

      // 2. Description
      const descVal = (raw[mapping.description] || '').trim();
      if (!descVal) {
        reasons.push('Missing description');
      }

      // 3. Amount
      const debitStr = mapping.debit ? raw[mapping.debit] : undefined;
      const creditStr = mapping.credit ? raw[mapping.credit] : undefined;
      const debitNum = this.parseAmountString(debitStr);
      const creditNum = this.parseAmountString(creditStr);

      let finalAmount: number | null = null;
      if (debitNum !== null && debitNum > 0) {
        finalAmount = -Math.abs(debitNum); // debit is negative
      } else if (creditNum !== null && creditNum > 0) {
        finalAmount = Math.abs(creditNum); // credit is positive
      } else if (debitNum !== null && debitNum === 0 && creditNum !== null) {
        finalAmount = creditNum;
      } else if (creditNum !== null && creditNum === 0 && debitNum !== null) {
        finalAmount = -Math.abs(debitNum);
      }

      if (finalAmount === null) {
        reasons.push('Invalid or missing amount');
      }

      const balanceStr = mapping.balance ? raw[mapping.balance] : undefined;
      const balance = this.parseAmountString(balanceStr);

      const isMalformed = reasons.length > 0;
      const normalizedDesc = descVal.toUpperCase();
      const merchant = this.deriveMerchant(normalizedDesc);
      const effectiveDateStr = parsedDate ? parsedDate.toISOString() : new Date().toISOString();
      const effectiveAmount = finalAmount !== null ? finalAmount : 0;

      const dedupHash = this.computeDedupHash(
        userId,
        effectiveDateStr,
        effectiveAmount,
        normalizedDesc
      );

      if (isMalformed) {
        malformedRows.push({
          rowIndex: index,
          rawData: raw,
          reasons,
          excluded: false, // by default included for review
        });
      }

      normalizedRows.push({
        rowIndex: index,
        txnDate: effectiveDateStr,
        description: descVal || 'UNKNOWN TRANSACTION',
        merchant,
        amount: effectiveAmount,
        balance,
        dedupHash,
        isMalformed,
      });
    }

    const cleanCount = normalizedRows.filter((r) => !r.isMalformed).length;
    const summary: ParseSummary = {
      totalRows: rawRows.length,
      cleanRows: cleanCount,
      malformedRows: malformedRows.length,
    };

    await prisma.uploadSession.update({
      where: { id: uploadId },
      data: {
        normalizedRows: normalizedRows as any,
        malformedRows: malformedRows as any,
        status: 'parsed',
      },
    });

    return {
      uploadId: session.id,
      summary,
      malformedRows,
    };
  }

  async updateMalformedRows(
    userId: string,
    uploadId: string,
    patch: MalformedRowsPatch
  ): Promise<UploadMalformedData> {
    const session = await prisma.uploadSession.findFirst({
      where: { id: uploadId, userId },
    });

    if (!session) {
      throw new NotFoundError('Upload session not found', 'UPLOAD_SESSION_NOT_FOUND');
    }

    const malformedRows = (session.malformedRows as unknown as MalformedRow[]) || [];
    const patchMap = new Map(patch.map((p) => [p.rowIndex, p.excluded]));

    const updatedMalformed = malformedRows.map((row) => {
      if (patchMap.has(row.rowIndex)) {
        return { ...row, excluded: !!patchMap.get(row.rowIndex) };
      }
      return row;
    });

    const rawRows = (session.rawRows as Array<Record<string, string>>) || [];
    const totalRows = rawRows.length;
    const malformedCount = updatedMalformed.length;
    const cleanCount = totalRows - malformedCount;

    const summary: ParseSummary = {
      totalRows,
      cleanRows: cleanCount,
      malformedRows: malformedCount,
    };

    await prisma.uploadSession.update({
      where: { id: uploadId },
      data: {
        malformedRows: updatedMalformed as any,
        status: 'malformed_review',
      },
    });

    return {
      uploadId: session.id,
      summary,
      malformedRows: updatedMalformed,
    };
  }

  async commitSession(userId: string, uploadId: string): Promise<CommitResult> {
    const session = await prisma.uploadSession.findFirst({
      where: { id: uploadId, userId },
    });

    if (!session) {
      throw new NotFoundError('Upload session not found', 'UPLOAD_SESSION_NOT_FOUND');
    }

    const normalizedRows = (session.normalizedRows as unknown as NormalizedRowData[]) || [];
    const malformedRows = (session.malformedRows as unknown as MalformedRow[]) || [];
    const excludedIndices = new Set(
      malformedRows.filter((m) => m.excluded).map((m) => m.rowIndex)
    );

    // Eligible rows = rows not excluded
    const candidateRows = normalizedRows.filter((r) => !excludedIndices.has(r.rowIndex));

    if (candidateRows.length === 0) {
      throw new ValidationError(
        'No valid rows found in this file. Please review the mapping or try a different file.',
        'IMPORT_EMPTY'
      );
    }

    // Deduplication check
    const dedupHashes = candidateRows.map((r) => r.dedupHash);
    const existingTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        dedupHash: { in: dedupHashes },
      },
      select: { dedupHash: true },
    });

    const existingHashSet = new Set(existingTransactions.map((t) => t.dedupHash));

    const newRows: NormalizedRowData[] = [];
    let duplicateCount = 0;

    for (const row of candidateRows) {
      if (existingHashSet.has(row.dedupHash)) {
        duplicateCount++;
      } else {
        newRows.push(row);
        existingHashSet.add(row.dedupHash); // prevent duplicates within the same batch
      }
    }

    // AI Categorization / Rule cache
    const existingRules = await prisma.categoryRule.findMany({
      where: { userId },
    });
    const ruleMap = new Map<string, { category: Category; source: CategoryRuleSource }>();
    for (const rule of existingRules) {
      ruleMap.set(rule.merchantPattern.toUpperCase(), {
        category: rule.category as Category,
        source: rule.source as CategoryRuleSource,
      });
    }

    let cacheHits = 0;
    let aiCategorized = 0;
    let llmCalls = 0;
    const newRulesToInsert: Array<{
      userId: string;
      merchantPattern: string;
      category: Category;
      source: CategoryRuleSource;
    }> = [];

    const uncachedMerchants = new Set<string>();

    const categorizedRows = newRows.map((row) => {
      const merchantKey = row.merchant ? row.merchant.toUpperCase() : null;
      let category: Category = 'Other';

      if (merchantKey && ruleMap.has(merchantKey)) {
        const cached = ruleMap.get(merchantKey)!;
        category = cached.category;
        cacheHits++;
      } else if (merchantKey) {
        uncachedMerchants.add(merchantKey);
        // Default keyword heuristic / simulated LLM batching
        const keywordMatch = DEFAULT_CATEGORY_KEYWORDS[merchantKey];
        if (keywordMatch) {
          category = keywordMatch;
        } else {
          category = 'Other';
        }
        aiCategorized++;
      } else {
        category = 'Other';
      }

      return {
        ...row,
        category,
      };
    });

    if (uncachedMerchants.size > 0) {
      llmCalls = 1; // Single batch call per D-5
      for (const merchant of uncachedMerchants) {
        const assignedCat = DEFAULT_CATEGORY_KEYWORDS[merchant] || 'Other';
        newRulesToInsert.push({
          userId,
          merchantPattern: merchant,
          category: assignedCat,
          source: 'ai',
        });
      }
    }

    // Determine period range
    let periodStart: Date | null = null;
    let periodEnd: Date | null = null;

    if (newRows.length > 0) {
      const dates = newRows.map((r) => new Date(r.txnDate).getTime()).filter((t) => !isNaN(t));
      if (dates.length > 0) {
        periodStart = new Date(Math.min(...dates));
        periodEnd = new Date(Math.max(...dates));
      }
    }

    const totalRawRows = (session.rawRows as Array<any>)?.length || candidateRows.length;
    const malformedCount = malformedRows.length;

    const commitResult = await prisma.$transaction(async (tx) => {
      const importRecord = await tx.import.create({
        data: {
          userId,
          filename: session.filename,
          bankName: session.bankName,
          periodStart,
          periodEnd,
          rowsTotal: totalRawRows,
          rowsImported: categorizedRows.length,
          rowsDuplicate: duplicateCount,
        },
      });

      if (categorizedRows.length > 0) {
        await tx.transaction.createMany({
          data: categorizedRows.map((r) => ({
            userId,
            importId: importRecord.id,
            txnDate: new Date(r.txnDate),
            description: r.description,
            merchant: r.merchant,
            amount: new Decimal(r.amount),
            balance: r.balance !== null ? new Decimal(r.balance) : null,
            category: r.category as any,
            isRecurring: false,
            isMalformed: r.isMalformed,
            dedupHash: r.dedupHash,
          })),
        });
      }

      for (const rule of newRulesToInsert) {
        await tx.categoryRule.upsert({
          where: {
            userId_merchantPattern: {
              userId: rule.userId,
              merchantPattern: rule.merchantPattern,
            },
          },
          update: {
            category: rule.category as any,
            source: rule.source as any,
          },
          create: {
            userId: rule.userId,
            merchantPattern: rule.merchantPattern,
            category: rule.category as any,
            source: rule.source as any,
          },
        });
      }

      await tx.uploadSession.delete({
        where: { id: uploadId },
      });

      return {
        importId: importRecord.id,
        rowsTotal: totalRawRows,
        rowsImported: categorizedRows.length,
        rowsDuplicate: duplicateCount,
        rowsMalformed: malformedCount,
        aiCategorized,
        cacheHits,
        llmCalls,
      };
    });

    return commitResult;
  }

  async getImports(userId: string, page = 1, pageSize = 50) {
    const skip = (page - 1) * pageSize;
    const [total, imports] = await Promise.all([
      prisma.import.count({ where: { userId } }),
      prisma.import.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: pageSize,
      }),
    ]);

    const totalPages = Math.ceil(total / pageSize) || 1;

    return {
      items: imports.map((imp) => ({
        id: imp.id,
        userId: imp.userId,
        filename: imp.filename,
        bankName: imp.bankName,
        periodStart: imp.periodStart ? imp.periodStart.toISOString() : null,
        periodEnd: imp.periodEnd ? imp.periodEnd.toISOString() : null,
        rowsTotal: imp.rowsTotal,
        rowsImported: imp.rowsImported,
        rowsDuplicate: imp.rowsDuplicate,
        createdAt: imp.createdAt.toISOString(),
      })),
      meta: {
        page,
        pageSize,
        total,
        totalPages,
      },
    };
  }

  async getImportDetail(userId: string, importId: string) {
    const imp = await prisma.import.findFirst({
      where: { id: importId, userId },
    });

    if (!imp) {
      throw new NotFoundError('Import record not found', 'IMPORT_NOT_FOUND');
    }

    return {
      id: imp.id,
      userId: imp.userId,
      filename: imp.filename,
      bankName: imp.bankName,
      periodStart: imp.periodStart ? imp.periodStart.toISOString() : null,
      periodEnd: imp.periodEnd ? imp.periodEnd.toISOString() : null,
      rowsTotal: imp.rowsTotal,
      rowsImported: imp.rowsImported,
      rowsDuplicate: imp.rowsDuplicate,
      createdAt: imp.createdAt.toISOString(),
    };
  }

  async rollbackImport(userId: string, importId: string): Promise<{ success: true }> {
    const imp = await prisma.import.findFirst({
      where: { id: importId, userId },
    });

    if (!imp) {
      throw new NotFoundError('Import record not found', 'IMPORT_NOT_FOUND');
    }

    await prisma.$transaction([
      prisma.transaction.deleteMany({
        where: { importId, userId },
      }),
      prisma.import.delete({
        where: { id: importId },
      }),
    ]);

    return { success: true };
  }
}

export const uploadService = new UploadService();
