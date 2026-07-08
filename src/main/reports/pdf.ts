import type Database from 'better-sqlite3'
import PDFDocument from 'pdfkit'
import { createWriteStream } from 'node:fs'
import {
  computeBalance,
  computeCategoryBreakdown,
  computeFixedCostRatio,
  computeSavingsRate,
  computeYearComparison,
  sumFixedCostExpenses
} from '@shared/calculations'
import { formatCurrencyDE, formatMonthYearDE, formatPercentDE } from '@shared/format'
import type { CategoryBreakdownEntry, MonthBalance } from '@shared/types'
import { listCategories } from '../db/repositories/categories'
import { listTransactions } from '../db/repositories/transactions'

const PAGE_MARGIN = 50
const COLOR_TEXT = '#1a1d23'
const COLOR_MUTED = '#6b7280'
const COLOR_ACCENT = '#3b6ef5'
const COLOR_POSITIVE = '#2f9e44'
const COLOR_NEGATIVE = '#e03131'

function writeHeader(doc: PDFKit.PDFDocument, title: string, subtitle: string): void {
  doc.fillColor(COLOR_ACCENT).fontSize(20).font('Helvetica-Bold').text('Finanzplaner', PAGE_MARGIN, PAGE_MARGIN)
  doc.fillColor(COLOR_TEXT).fontSize(16).font('Helvetica-Bold').text(title, PAGE_MARGIN, PAGE_MARGIN + 28)
  doc.fillColor(COLOR_MUTED).fontSize(10).font('Helvetica').text(subtitle, PAGE_MARGIN, PAGE_MARGIN + 50)
  doc
    .moveTo(PAGE_MARGIN, PAGE_MARGIN + 72)
    .lineTo(doc.page.width - PAGE_MARGIN, PAGE_MARGIN + 72)
    .strokeColor('#d0d5dd')
    .stroke()
  doc.moveDown(3)
}

function writeSectionTitle(doc: PDFKit.PDFDocument, text: string): void {
  doc.moveDown(0.5)
  doc.fillColor(COLOR_TEXT).fontSize(13).font('Helvetica-Bold').text(text)
  doc.moveDown(0.3)
}

function writeKeyValueRow(doc: PDFKit.PDFDocument, label: string, value: string, valueColor = COLOR_TEXT): void {
  const y = doc.y
  doc.fillColor(COLOR_MUTED).fontSize(11).font('Helvetica').text(label, PAGE_MARGIN, y)
  doc.fillColor(valueColor).fontSize(11).font('Helvetica-Bold').text(value, PAGE_MARGIN, y, {
    width: doc.page.width - PAGE_MARGIN * 2,
    align: 'right'
  })
  doc.moveDown(0.6)
}

function writeTable(
  doc: PDFKit.PDFDocument,
  headers: string[],
  rows: string[][],
  columnWidths: number[]
): void {
  const startX = PAGE_MARGIN
  let y = doc.y + 4
  const rowHeight = 20

  doc.fontSize(10).font('Helvetica-Bold').fillColor(COLOR_TEXT)
  let x = startX
  headers.forEach((header, i) => {
    doc.text(header, x, y, { width: columnWidths[i], align: i === 0 ? 'left' : 'right' })
    x += columnWidths[i]
  })
  y += rowHeight
  doc
    .moveTo(startX, y - 4)
    .lineTo(startX + columnWidths.reduce((a, b) => a + b, 0), y - 4)
    .strokeColor('#d0d5dd')
    .stroke()

  doc.font('Helvetica').fillColor(COLOR_TEXT)
  for (const row of rows) {
    if (y > doc.page.height - PAGE_MARGIN - rowHeight) {
      doc.addPage()
      y = PAGE_MARGIN
    }
    x = startX
    row.forEach((cell, i) => {
      doc.text(cell, x, y, { width: columnWidths[i], align: i === 0 ? 'left' : 'right' })
      x += columnWidths[i]
    })
    y += rowHeight
  }
  doc.y = y + 8
}

export function generateMonthlyReportPdf(db: Database.Database, year: number, month: number, destPath: string): Promise<void> {
  const categories = listCategories(db)
  const transactions = listTransactions(db, { year, month })
  const { incomeCents, expenseCents, balanceCents } = computeBalance(transactions)
  const fixedCents = sumFixedCostExpenses(transactions, categories)
  const savingsRate = computeSavingsRate(incomeCents, expenseCents)
  const fixedCostRatio = computeFixedCostRatio(fixedCents, incomeCents)
  const breakdown = computeCategoryBreakdown(transactions, categories)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN })
    const stream = createWriteStream(destPath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    writeHeader(doc, `Monatsbericht – ${formatMonthYearDE(year, month)}`, `Erstellt am ${formatMonthYearDE(year, month)}`)

    writeSectionTitle(doc, 'Bilanz')
    writeKeyValueRow(doc, 'Einnahmen', formatCurrencyDE(incomeCents), COLOR_POSITIVE)
    writeKeyValueRow(doc, 'Ausgaben', formatCurrencyDE(expenseCents), COLOR_NEGATIVE)
    writeKeyValueRow(doc, 'Saldo', formatCurrencyDE(balanceCents), balanceCents >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE)

    writeSectionTitle(doc, 'Kennzahlen')
    writeKeyValueRow(doc, 'Sparquote', formatPercentDE(savingsRate))
    writeKeyValueRow(doc, 'Fixkostenquote', formatPercentDE(fixedCostRatio))

    writeSectionTitle(doc, 'Kategorien')
    writeTable(
      doc,
      ['Kategorie', 'Typ', 'Betrag'],
      breakdown.map((b: CategoryBreakdownEntry) => [
        b.categoryName,
        b.type === 'income' ? 'Einnahme' : 'Ausgabe',
        formatCurrencyDE(b.amountCents)
      ]),
      [260, 100, 135]
    )

    doc.end()
  })
}

export function generateYearlyReportPdf(db: Database.Database, year: number, destPath: string): Promise<void> {
  const categories = listCategories(db)
  const transactions = listTransactions(db, { year })
  const { incomeCents, expenseCents, balanceCents } = computeBalance(transactions)
  const fixedCents = sumFixedCostExpenses(transactions, categories)
  const savingsRate = computeSavingsRate(incomeCents, expenseCents)
  const fixedCostRatio = computeFixedCostRatio(fixedCents, incomeCents)
  const breakdown = computeCategoryBreakdown(transactions, categories)
  const months = computeYearComparison(transactions, year)

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: PAGE_MARGIN })
    const stream = createWriteStream(destPath)
    doc.pipe(stream)
    stream.on('finish', resolve)
    stream.on('error', reject)

    writeHeader(doc, `Jahresbericht – ${year}`, `Erstellt für das Kalenderjahr ${year}`)

    writeSectionTitle(doc, 'Jahresbilanz')
    writeKeyValueRow(doc, 'Einnahmen', formatCurrencyDE(incomeCents), COLOR_POSITIVE)
    writeKeyValueRow(doc, 'Ausgaben', formatCurrencyDE(expenseCents), COLOR_NEGATIVE)
    writeKeyValueRow(doc, 'Saldo', formatCurrencyDE(balanceCents), balanceCents >= 0 ? COLOR_POSITIVE : COLOR_NEGATIVE)

    writeSectionTitle(doc, 'Kennzahlen')
    writeKeyValueRow(doc, 'Sparquote', formatPercentDE(savingsRate))
    writeKeyValueRow(doc, 'Fixkostenquote', formatPercentDE(fixedCostRatio))

    writeSectionTitle(doc, 'Monatsübersicht')
    writeTable(
      doc,
      ['Monat', 'Einnahmen', 'Ausgaben', 'Saldo'],
      months.map((m: MonthBalance) => [
        formatMonthYearDE(m.year, m.month),
        formatCurrencyDE(m.incomeCents),
        formatCurrencyDE(m.expenseCents),
        formatCurrencyDE(m.balanceCents)
      ]),
      [160, 115, 115, 145]
    )

    if (doc.y > doc.page.height - PAGE_MARGIN - 150) {
      doc.addPage()
    }
    writeSectionTitle(doc, 'Kategorien (Jahr)')
    writeTable(
      doc,
      ['Kategorie', 'Typ', 'Betrag'],
      breakdown.map((b: CategoryBreakdownEntry) => [
        b.categoryName,
        b.type === 'income' ? 'Einnahme' : 'Ausgabe',
        formatCurrencyDE(b.amountCents)
      ]),
      [260, 100, 135]
    )

    doc.end()
  })
}
