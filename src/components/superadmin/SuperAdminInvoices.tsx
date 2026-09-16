import React, { useState } from 'react';
import { SaaSInvoice, SaaSInvoiceItem, Tenant } from '../../types';
import { 
  Receipt, 
  Search, 
  Plus, 
  Download, 
  DollarSign, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  RotateCcw, 
  Printer, 
  Eye, 
  Send, 
  Trash2, 
  CreditCard, 
  Filter, 
  TrendingUp, 
  ShieldCheck,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';

interface SuperAdminInvoicesProps {
  invoices: SaaSInvoice[];
  tenants: Tenant[];
  onAddInvoice: (newInvoice: SaaSInvoice) => void;
  onUpdateInvoice: (updatedInvoice: SaaSInvoice) => void;
  onDeleteInvoice: (invoiceId: string) => void;
  onShowNotice: (msg: string) => void;
}

export const SuperAdminInvoices: React.FC<SuperAdminInvoicesProps> = ({
  invoices,
  tenants,
  onAddInvoice,
  onUpdateInvoice,
  onDeleteInvoice,
  onShowNotice,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [viewingInvoice, setViewingInvoice] = useState<SaaSInvoice | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // New invoice state
  const [selectedTenantId, setSelectedTenantId] = useState(tenants[0]?.id || '');
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('2026-09-30');
  const [paymentMethod, setPaymentMethod] = useState<'Stripe' | 'Wire Transfer' | 'PayPal' | 'Crypto USDT' | 'Midtrans'>('Stripe');
  const [itemDescription, setItemDescription] = useState('Business Pro Subscription + Tour Dispatch Addon');
  const [itemAmount, setItemAmount] = useState<number>(89);
  const [taxRate, setTaxRate] = useState<number>(10);
  const [invoiceNotes, setInvoiceNotes] = useState('Net 14 payment terms. Invoiced to corporate account.');

  // Financial calculations
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.total, 0);
  const totalCollected = invoices.filter(inv => inv.status === 'paid').reduce((acc, inv) => acc + inv.total, 0);
  const totalPending = invoices.filter(inv => inv.status === 'pending' || inv.status === 'overdue').reduce((acc, inv) => acc + inv.total, 0);
  const collectionRate = totalInvoiced > 0 ? Math.round((totalCollected / totalInvoiced) * 100) : 100;
  const overdueCount = invoices.filter(inv => inv.status === 'overdue').length;

  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      (inv.invoiceNumber || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.tenantName || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.customerEmail || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (inv.planName || '').toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'all' || inv.status === statusFilter;
    const matchesMethod = methodFilter === 'all' || inv.paymentMethod === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleCreateInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    const tenant = tenants.find(t => t.id === selectedTenantId) || tenants[0];
    const subtotal = Number(itemAmount);
    const tax = Math.round((subtotal * (taxRate / 100)) * 10) / 10;
    const total = subtotal + tax;

    const newInvoiceNumber = `INV-2026-${(invoices.length + 101).toString().padStart(4, '0')}`;

    const newInv: SaaSInvoice = {
      id: `inv-${Date.now()}`,
      invoiceNumber: newInvoiceNumber,
      tenantId: tenant.id,
      tenantName: tenant.name,
      customerEmail: tenant.email || 'billing@customer.com',
      planName: `${tenant.plan} Gateway Tier`,
      billingPeriod: `${issueDate} – ${dueDate}`,
      amount: subtotal,
      tax: tax,
      total: total,
      status: 'pending',
      issueDate: issueDate,
      dueDate: dueDate,
      paymentMethod: paymentMethod,
      items: [
        {
          id: `item-${Date.now()}`,
          description: itemDescription,
          quantity: 1,
          unitPrice: subtotal,
          total: subtotal,
        }
      ],
      notes: invoiceNotes,
    };

    onAddInvoice(newInv);
    setIsCreateModalOpen(false);
    onShowNotice(`Invoice ${newInv.invoiceNumber} created for ${newInv.tenantName} ($${newInv.total.toFixed(2)})`);
  };

  const handleMarkAsPaid = (invoice: SaaSInvoice) => {
    const updated: SaaSInvoice = {
      ...invoice,
      status: 'paid',
      paidAt: new Date().toISOString().replace('T', ' ').slice(0, 19) + ' UTC',
      transactionRef: `tx_admin_manual_${Math.random().toString(36).substring(2, 9)}`,
    };
    onUpdateInvoice(updated);
    onShowNotice(`Invoice ${invoice.invoiceNumber} marked as PAID ($${invoice.total.toFixed(2)})`);
  };

  const handleSendReminder = (invoice: SaaSInvoice) => {
    onShowNotice(`Payment reminder dispatched via WhatsApp & Email to ${invoice.customerEmail} for invoice ${invoice.invoiceNumber}`);
  };

  const handleRefundInvoice = (invoice: SaaSInvoice) => {
    if (confirm(`Issue full refund for invoice ${invoice.invoiceNumber} ($${invoice.total.toFixed(2)})?`)) {
      const updated: SaaSInvoice = {
        ...invoice,
        status: 'refunded',
      };
      onUpdateInvoice(updated);
      onShowNotice(`Invoice ${invoice.invoiceNumber} marked as REFUNDED`);
    }
  };

  const handleDeleteInvoice = (invoice: SaaSInvoice) => {
    if (confirm(`Permanently delete invoice record ${invoice.invoiceNumber}?`)) {
      onDeleteInvoice(invoice.id);
      onShowNotice(`Invoice ${invoice.invoiceNumber} deleted.`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header and Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-neutral-900/70 p-5 rounded-2xl border border-neutral-800">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>Invoice & Subscription Billing Ledger</span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-purple-950 text-purple-300 border border-purple-800">
              {invoices.length} Invoices
            </span>
          </h2>
          <p className="text-xs text-neutral-400 mt-0.5">
            Real-time accounts receivable, automated subscription collections, tax receipts, and payment reminders.
          </p>
        </div>

        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-4 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 shadow-md shadow-purple-900/30"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Create Manual Invoice</span>
        </button>
      </div>

      {/* Financial Overview Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Total Billed (Platform)</span>
          <div className="text-xl font-bold text-white font-mono">${totalInvoiced.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-neutral-400">{invoices.length} issued invoices</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Collected Revenue</span>
          <div className="text-xl font-bold text-emerald-400 font-mono">${totalCollected.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-emerald-400 font-semibold">{collectionRate}% collection rate</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Pending / Outstanding</span>
          <div className="text-xl font-bold text-amber-400 font-mono">${totalPending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
          <span className="text-[11px] text-amber-400">{overdueCount} overdue accounts</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Gross Churn Rate</span>
          <div className="text-xl font-bold text-white font-mono">1.2%</div>
          <span className="text-[11px] text-emerald-400 font-medium">Top quartile SaaS health</span>
        </div>

        <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 space-y-1">
          <span className="text-xs text-neutral-400 font-medium">Average LTV (Subscribers)</span>
          <div className="text-xl font-bold text-purple-400 font-mono">$1,840</div>
          <span className="text-[11px] text-neutral-400">14.2 mo retention avg</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search invoice number, client company, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-purple-600 focus:ring-1 focus:ring-purple-600 transition"
          />
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-neutral-400">
            <Filter className="w-3.5 h-3.5 text-neutral-500" />
            <span>Status:</span>
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="overdue">Overdue</option>
            <option value="refunded">Refunded</option>
            <option value="draft">Draft</option>
          </select>

          <div className="flex items-center gap-1.5 text-xs text-neutral-400 ml-2">
            <span>Gateway:</span>
          </div>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600 cursor-pointer"
          >
            <option value="all">All Gateways</option>
            <option value="Stripe">Stripe</option>
            <option value="Midtrans">Midtrans</option>
            <option value="PayPal">PayPal</option>
            <option value="Wire Transfer">Wire Transfer</option>
            <option value="Crypto USDT">Crypto USDT</option>
          </select>
        </div>
      </div>

      {/* Invoices Table */}
      <div className="bg-neutral-900 rounded-2xl border border-neutral-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Invoice #</th>
                <th className="py-3.5 px-4 font-semibold">Subscriber / Client</th>
                <th className="py-3.5 px-4 font-semibold">Billing Period</th>
                <th className="py-3.5 px-4 font-semibold">Total Amount</th>
                <th className="py-3.5 px-4 font-semibold">Payment Method</th>
                <th className="py-3.5 px-4 font-semibold">Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-800 text-neutral-300">
              {filteredInvoices.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-neutral-500">
                    <Receipt className="w-8 h-8 mx-auto mb-2 opacity-40" />
                    <p className="text-sm font-medium">No invoices match your filter</p>
                  </td>
                </tr>
              ) : (
                filteredInvoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-neutral-800/40 transition">
                    <td className="py-3.5 px-4">
                      <div
                        onClick={() => setViewingInvoice(inv)}
                        className="font-mono font-bold text-white text-xs hover:text-purple-400 transition cursor-pointer flex items-center gap-1.5"
                      >
                        <Receipt className="w-3.5 h-3.5 text-purple-400" />
                        <span>{inv.invoiceNumber}</span>
                      </div>
                      <div className="text-[10px] text-neutral-500 mt-0.5">Due {inv.dueDate}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-bold text-white text-xs">{inv.tenantName}</div>
                      <div className="text-[11px] text-neutral-400">{inv.customerEmail}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-neutral-300 text-xs">{inv.planName}</div>
                      <div className="text-[10px] text-neutral-500 font-mono">{inv.billingPeriod}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="font-mono font-bold text-sm text-white">
                        ${inv.total.toFixed(2)}
                      </div>
                      <div className="text-[10px] text-neutral-500 font-mono">
                        Tax: ${inv.tax.toFixed(2)}
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-neutral-800 text-neutral-300 border border-neutral-700">
                        {inv.paymentMethod}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 border ${
                        inv.status === 'paid'
                          ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                          : inv.status === 'overdue'
                          ? 'bg-red-950 text-red-300 border-red-800 animate-pulse'
                          : inv.status === 'refunded'
                          ? 'bg-purple-950 text-purple-300 border-purple-800'
                          : 'bg-amber-950 text-amber-300 border-amber-800'
                      }`}>
                        {inv.status === 'paid' && <CheckCircle2 className="w-2.5 h-2.5" />}
                        {inv.status === 'overdue' && <AlertCircle className="w-2.5 h-2.5" />}
                        {inv.status === 'pending' && <Clock className="w-2.5 h-2.5" />}
                        <span>{inv.status.toUpperCase()}</span>
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {/* View Receipt */}
                        <button
                          onClick={() => setViewingInvoice(inv)}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg transition cursor-pointer"
                          title="View Official Tax Receipt"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>

                        {/* Mark Paid if not paid */}
                        {inv.status !== 'paid' && inv.status !== 'refunded' && (
                          <button
                            onClick={() => handleMarkAsPaid(inv)}
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-lg text-[10px] transition cursor-pointer"
                            title="Mark as Paid"
                          >
                            Mark Paid
                          </button>
                        )}

                        {/* Send Reminder */}
                        {inv.status === 'overdue' || inv.status === 'pending' ? (
                          <button
                            onClick={() => handleSendReminder(inv)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-amber-400 rounded-lg transition cursor-pointer"
                            title="Send WhatsApp Payment Reminder"
                          >
                            <Send className="w-3.5 h-3.5" />
                          </button>
                        ) : null}

                        {/* Refund */}
                        {inv.status === 'paid' && (
                          <button
                            onClick={() => handleRefundInvoice(inv)}
                            className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-400 hover:text-purple-300 rounded-lg transition cursor-pointer"
                            title="Issue Refund"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        )}

                        {/* Delete */}
                        <button
                          onClick={() => handleDeleteInvoice(inv)}
                          className="p-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-500 hover:text-red-400 rounded-lg transition cursor-pointer"
                          title="Delete Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE MANUAL INVOICE MODAL */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-xl p-6 space-y-5 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-purple-600 text-white flex items-center justify-center">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Generate Manual Invoice</h3>
                  <p className="text-xs text-neutral-400">Issue custom charges, enterprise add-ons, or overage billing</p>
                </div>
              </div>
              <button
                onClick={() => setIsCreateModalOpen(false)}
                className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2 py-1 bg-neutral-800 rounded-lg"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateInvoice} className="space-y-4">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Subscriber / Organization *</label>
                <select
                  value={selectedTenantId}
                  onChange={(e) => setSelectedTenantId(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                >
                  {tenants.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name} ({t.id}) – {t.email}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Issue Date</label>
                  <input
                    type="date"
                    required
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Due Date</label>
                  <input
                    type="date"
                    required
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Payment Gateway / Method</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  >
                    <option value="Stripe">Stripe (Card / Apple Pay)</option>
                    <option value="Midtrans">Midtrans (BCA / Mandiri VA / QRIS)</option>
                    <option value="PayPal">PayPal</option>
                    <option value="Wire Transfer">Direct Bank Wire</option>
                    <option value="Crypto USDT">Crypto USDT (TRC-20)</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-neutral-300">Tax Rate (% VAT)</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={taxRate}
                    onChange={(e) => setTaxRate(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-neutral-800 space-y-3">
                <span className="text-xs font-semibold text-neutral-400">Line Item Detail</span>
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2 space-y-1">
                    <label className="text-[11px] text-neutral-400">Item Description</label>
                    <input
                      type="text"
                      required
                      value={itemDescription}
                      onChange={(e) => setItemDescription(e.target.value)}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[11px] text-neutral-400">Amount ($ USD)</label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={itemAmount}
                      onChange={(e) => setItemAmount(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-neutral-300">Invoice Notes / Payment Instructions</label>
                <textarea
                  rows={2}
                  value={invoiceNotes}
                  onChange={(e) => setInvoiceNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-neutral-950 border border-neutral-800 rounded-xl text-xs text-white focus:outline-none focus:border-purple-600"
                />
              </div>

              <div className="p-3 bg-neutral-950 rounded-xl border border-neutral-800 flex items-center justify-between text-xs font-mono">
                <span className="text-neutral-400">Estimated Total (with {taxRate}% tax):</span>
                <span className="font-bold text-base text-emerald-400">
                  ${(Number(itemAmount) + Number(itemAmount) * (taxRate / 100)).toFixed(2)}
                </span>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-800">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold transition cursor-pointer shadow-lg shadow-purple-900/30"
                >
                  Issue Invoice
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIEW PRINTABLE OFFICIAL INVOICE RECEIPT MODAL */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 bg-neutral-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl w-full max-w-2xl p-6 space-y-6 shadow-2xl animate-fade-in max-h-[90vh] overflow-y-auto text-neutral-200">
            {/* Modal Topbar Actions */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-purple-400" />
                <span className="font-bold text-white text-sm">Official Tax Invoice & Receipt</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white rounded-lg text-xs font-medium transition cursor-pointer flex items-center gap-1.5"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print</span>
                </button>

                <button
                  onClick={() => setViewingInvoice(null)}
                  className="text-neutral-500 hover:text-white text-xs cursor-pointer px-2.5 py-1.5 bg-neutral-800 rounded-lg"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Printable Paper Canvas */}
            <div className="bg-white text-neutral-900 p-8 rounded-xl shadow-lg space-y-6 font-sans">
              {/* Receipt Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xl font-black text-purple-700 tracking-tight flex items-center gap-2">
                    <span>WhatsCRM Cloud</span>
                  </div>
                  <p className="text-xs text-neutral-500 mt-1">Enterprise WhatsApp Gateway & CRM Platform</p>
                  <p className="text-[11px] text-neutral-500">Tax ID: ID-VAT-88992014-WAC</p>
                  <p className="text-[11px] text-neutral-500">Jl. Sunset Road No. 88, Kuta, Bali</p>
                </div>

                <div className="text-right">
                  <div className="text-xl font-mono font-black text-neutral-900">{viewingInvoice.invoiceNumber}</div>
                  <div className="text-xs text-neutral-500 mt-1">Date: {viewingInvoice.issueDate}</div>
                  <div className="text-xs text-neutral-500">Due: {viewingInvoice.dueDate}</div>

                  {/* Payment status stamp */}
                  <div className="mt-3">
                    <span className={`inline-block px-3 py-1 rounded font-mono font-black text-xs uppercase tracking-wider border-2 ${
                      viewingInvoice.status === 'paid'
                        ? 'text-emerald-700 border-emerald-600 bg-emerald-50'
                        : viewingInvoice.status === 'overdue'
                        ? 'text-red-700 border-red-600 bg-red-50'
                        : 'text-amber-700 border-amber-600 bg-amber-50'
                    }`}>
                      {viewingInvoice.status === 'paid' ? 'PAID IN FULL' : viewingInvoice.status.toUpperCase()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Bill to Info */}
              <div className="border-t border-b border-neutral-200 py-4 grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Billed To:</span>
                  <div className="font-bold text-sm text-neutral-900">{viewingInvoice.tenantName}</div>
                  <div className="text-neutral-600 mt-0.5">{viewingInvoice.customerEmail}</div>
                  <div className="text-neutral-500 font-mono text-[11px] mt-0.5">ID: {viewingInvoice.tenantId}</div>
                </div>

                <div className="text-right">
                  <span className="font-bold text-neutral-500 uppercase text-[10px] tracking-wider block mb-1">Payment Method:</span>
                  <div className="font-bold text-neutral-900">{viewingInvoice.paymentMethod}</div>
                  {viewingInvoice.transactionRef && (
                    <div className="text-neutral-500 font-mono text-[10px] mt-0.5">Ref: {viewingInvoice.transactionRef}</div>
                  )}
                  {viewingInvoice.paidAt && (
                    <div className="text-emerald-700 text-[11px] mt-0.5">Settled on {viewingInvoice.paidAt}</div>
                  )}
                </div>
              </div>

              {/* Itemized Table */}
              <div>
                <table className="w-full text-xs text-left">
                  <thead className="bg-neutral-100 text-neutral-600 uppercase text-[10px] tracking-wider border-b border-neutral-200">
                    <tr>
                      <th className="py-2.5 px-3">Description</th>
                      <th className="py-2.5 px-3 text-center">Qty</th>
                      <th className="py-2.5 px-3 text-right">Unit Price</th>
                      <th className="py-2.5 px-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100">
                    {viewingInvoice.items.map((it, idx) => (
                      <tr key={idx}>
                        <td className="py-3 px-3 font-medium text-neutral-800">{it.description}</td>
                        <td className="py-3 px-3 text-center font-mono text-neutral-600">{it.quantity}</td>
                        <td className="py-3 px-3 text-right font-mono text-neutral-600">${it.unitPrice.toFixed(2)}</td>
                        <td className="py-3 px-3 text-right font-mono font-bold text-neutral-900">${it.total.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Totals Summary */}
              <div className="flex justify-end pt-2">
                <div className="w-64 space-y-1.5 text-xs font-mono">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal:</span>
                    <span>${viewingInvoice.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>VAT / Tax (10%):</span>
                    <span>${viewingInvoice.tax.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-neutral-900 border-t border-neutral-300 pt-2">
                    <span>Total Due:</span>
                    <span>${viewingInvoice.total.toFixed(2)} USD</span>
                  </div>
                </div>
              </div>

              {/* Footer Notes */}
              {viewingInvoice.notes && (
                <div className="border-t border-neutral-200 pt-4 text-[11px] text-neutral-500">
                  <span className="font-semibold text-neutral-700">Notes: </span>
                  <span>{viewingInvoice.notes}</span>
                </div>
              )}
            </div>

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-neutral-800 text-xs">
              <div className="text-neutral-400">
                Invoice Status: <span className="font-bold text-white uppercase">{viewingInvoice.status}</span>
              </div>

              <div className="flex items-center gap-2">
                {viewingInvoice.status !== 'paid' && (
                  <button
                    onClick={() => {
                      handleMarkAsPaid(viewingInvoice);
                      setViewingInvoice({ ...viewingInvoice, status: 'paid', paidAt: 'Just now' });
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-neutral-950 font-bold rounded-xl transition cursor-pointer"
                  >
                    Mark as Paid
                  </button>
                )}
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl transition cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
