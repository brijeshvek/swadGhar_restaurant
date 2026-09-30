import React, { useState } from 'react';
import {
  X,
  FileText,
  FileSpreadsheet,
  Download,
  Calendar,
  DollarSign,
  ShoppingBag,
  Layers,
  CheckCircle2,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Table,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';

const ReportExportModal = ({ isOpen, onClose, user, isAdmin, branchCity, preloadedData }) => {
  if (!isOpen) return null;

  // 1. Report Type: 'revenue' | 'orders' | 'combined'
  const [reportType, setReportType] = useState('revenue');

  // 2. Period Scope: 'today' | 'week' | 'month' | 'year' | 'custom'
  const [period, setPeriod] = useState('month');

  // 3. Granularity:
  // For 'month': 'day' (Day-wise 1-31) or 'week' (Week 1-4)
  // For 'year': 'month' (Jan-Dec), 'quarter' (Q1-Q4), or 'day' (Day-wise)
  // For 'custom': 'day' (Day-wise) or 'itemized' (Order by Order)
  const [granularity, setGranularity] = useState('day');

  // 4. Custom Date Range Pickers
  const todayStr = new Date().toISOString().split('T')[0];
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const [startDate, setStartDate] = useState(thirtyDaysAgoStr);
  const [endDate, setEndDate] = useState(todayStr);

  const [generating, setGenerating] = useState(false);

  // Helper to extract rows based on user's choices
  const prepareExportData = async () => {
    let sourceData = preloadedData;

    // If custom date range or needs fresh fetch
    if (!sourceData?.timelines || period === 'custom') {
      try {
        const query = period === 'custom' ? `?startDate=${startDate}&endDate=${endDate}` : '';
        const res = await api.get(`/admin/reports${query}`);
        if (res.data?.timelines) {
          sourceData = res.data;
        } else if (res.data?.data?.timelines) {
          sourceData = res.data.data;
        }
      } catch (err) {
        console.error('Error fetching export data:', err);
      }
    }

    const timelines = sourceData?.timelines || {};
    let rows = [];
    let periodTitle = '';

    if (period === 'today') {
      periodTitle = `Today's Hourly Statement (${new Date().toLocaleDateString('en-IN')})`;
      rows = (timelines.today || []).map((slot, idx) => ({
        index: idx + 1,
        label: slot.label,
        date: todayStr,
        orders: slot.orders || 0,
        subtotal: slot.subtotal || Math.round((slot.revenue || 0) * 0.95),
        tax: slot.tax || Math.round((slot.revenue || 0) * 0.05),
        revenue: slot.revenue || 0,
        delivered: slot.delivered || (slot.orders || 0),
        pending: slot.pending || 0,
        cancelled: slot.cancelled || 0,
        aov: slot.aov || (slot.orders > 0 ? Math.round(slot.revenue / slot.orders) : 0),
        online: slot.online || 0,
        cod: slot.cod || 0,
      }));
    } else if (period === 'week') {
      periodTitle = `Last 7 Days (Day-wise Breakdown)`;
      rows = (timelines.week || []).map((day, idx) => ({
        index: idx + 1,
        label: day.label || `${day.day} (${day.date})`,
        date: day.date || '',
        orders: day.orders || 0,
        subtotal: day.subtotal || Math.round((day.revenue || 0) * 0.95),
        tax: day.tax || Math.round((day.revenue || 0) * 0.05),
        revenue: day.revenue || 0,
        delivered: day.delivered || (day.orders || 0),
        pending: day.pending || 0,
        cancelled: day.cancelled || 0,
        aov: day.aov || (day.orders > 0 ? Math.round(day.revenue / day.orders) : 0),
        online: day.online || 0,
        cod: day.cod || 0,
      }));
    } else if (period === 'month') {
      if (granularity === 'week') {
        periodTitle = `Current Month (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}) - Week-wise`;
        rows = (timelines.monthWeekly || timelines.month || []).map((w, idx) => ({
          index: idx + 1,
          label: w.label,
          date: `Week ${idx + 1}`,
          orders: w.orders || 0,
          subtotal: w.subtotal || Math.round((w.revenue || 0) * 0.95),
          tax: w.tax || Math.round((w.revenue || 0) * 0.05),
          revenue: w.revenue || 0,
          delivered: w.delivered || (w.orders || 0),
          pending: w.pending || 0,
          cancelled: w.cancelled || 0,
          aov: w.aov || (w.orders > 0 ? Math.round(w.revenue / w.orders) : 0),
          online: w.online || 0,
          cod: w.cod || 0,
        }));
      } else {
        periodTitle = `Current Month (${new Date().toLocaleString('default', { month: 'long', year: 'numeric' })}) - Day-wise (1 to 31)`;
        rows = (timelines.monthDaily || []).map((d, idx) => ({
          index: idx + 1,
          label: d.label || `Day ${d.dayNum}`,
          date: d.date || `Day ${idx + 1}`,
          orders: d.orders || 0,
          subtotal: d.subtotal || Math.round((d.revenue || 0) * 0.95),
          tax: d.tax || Math.round((d.revenue || 0) * 0.05),
          revenue: d.revenue || 0,
          delivered: d.delivered || (d.orders || 0),
          pending: d.pending || 0,
          cancelled: d.cancelled || 0,
          aov: d.aov || (d.orders > 0 ? Math.round(d.revenue / d.orders) : 0),
          online: d.online || 0,
          cod: d.cod || 0,
        }));
      }
    } else if (period === 'year') {
      if (granularity === 'quarter') {
        periodTitle = `Annual Statement (${new Date().getFullYear()}) - Quarterly Breakdown`;
        rows = (timelines.yearQuarters || []).map((q, idx) => ({
          index: idx + 1,
          label: q.label,
          date: q.label,
          orders: q.orders || 0,
          subtotal: q.subtotal || Math.round((q.revenue || 0) * 0.95),
          tax: q.tax || Math.round((q.revenue || 0) * 0.05),
          revenue: q.revenue || 0,
          delivered: q.delivered || (q.orders || 0),
          pending: q.pending || 0,
          cancelled: q.cancelled || 0,
          aov: q.aov || (q.orders > 0 ? Math.round(q.revenue / q.orders) : 0),
          online: q.online || 0,
          cod: q.cod || 0,
        }));
      } else {
        periodTitle = `Annual Statement (${new Date().getFullYear()}) - Month-wise (Jan to Dec)`;
        rows = (timelines.yearMonthly || timelines.year || []).map((m, idx) => ({
          index: idx + 1,
          label: m.monthName || m.label,
          date: m.label,
          orders: m.orders || 0,
          subtotal: m.subtotal || Math.round((m.revenue || 0) * 0.95),
          tax: m.tax || Math.round((m.revenue || 0) * 0.05),
          revenue: m.revenue || 0,
          delivered: m.delivered || (m.orders || 0),
          pending: m.pending || 0,
          cancelled: m.cancelled || 0,
          aov: m.aov || (m.orders > 0 ? Math.round(m.revenue / m.orders) : 0),
          online: m.online || 0,
          cod: m.cod || 0,
        }));
      }
    } else if (period === 'custom') {
      periodTitle = `Custom Date Range: ${startDate} to ${endDate}`;
      if (granularity === 'itemized' && sourceData?.allOrders && sourceData.allOrders.length > 0) {
        rows = sourceData.allOrders.map((ord, idx) => ({
          index: idx + 1,
          label: `#${ord.orderNumber}`,
          date: ord.date,
          customer: ord.customerName,
          orders: 1,
          subtotal: ord.subtotal || Math.round(ord.total * 0.95),
          tax: ord.tax || Math.round(ord.total * 0.05),
          revenue: ord.total || 0,
          status: ord.orderStatus,
          payment: `${ord.paymentMethod.toUpperCase()} (${ord.paymentStatus})`,
          items: ord.itemsSummary,
          aov: ord.total || 0,
        }));
      } else {
        const customRows = sourceData?.customBreakdown?.dailyRows || [];
        rows = customRows.map((d, idx) => ({
          index: idx + 1,
          label: d.label,
          date: d.date,
          orders: d.orders || 0,
          subtotal: d.subtotal || Math.round((d.revenue || 0) * 0.95),
          tax: d.tax || Math.round((d.revenue || 0) * 0.05),
          revenue: d.revenue || 0,
          delivered: d.delivered || 0,
          pending: d.pending || 0,
          cancelled: d.cancelled || 0,
          aov: d.aov || 0,
          online: d.online || 0,
          cod: d.cod || 0,
        }));
      }
    }

    const totalRev = rows.reduce((s, r) => s + (r.revenue || 0), 0);
    const totalOrders = rows.reduce((s, r) => s + (r.orders || 0), 0);
    const overallAOV = totalOrders > 0 ? Math.round(totalRev / totalOrders) : 0;
    const totalDelivered = rows.reduce((s, r) => s + (r.delivered || 0), 0);
    const totalCancelled = rows.reduce((s, r) => s + (r.cancelled || 0), 0);

    return {
      periodTitle,
      rows,
      summary: {
        totalRevenue: totalRev,
        totalOrders,
        overallAOV,
        totalDelivered,
        totalCancelled,
      },
    };
  };

  // Generate & Download PDF
  const handleDownloadPDF = async () => {
    setGenerating(true);
    try {
      const { periodTitle, rows, summary } = await prepareExportData();

      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [180, 83, 9]; // Amber-700
      const darkColor = [28, 25, 23]; // Stone-900
      const accentGold = [217, 119, 6]; // Amber-600

      // 1. Clean Letterhead Header
      doc.setFillColor(...darkColor);
      doc.rect(0, 0, 210, 36, 'F');

      doc.setFillColor(...accentGold);
      doc.rect(0, 0, 210, 3.5, 'F');

      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(20);
      doc.text('SWADGHAR RESTAURANT', 14, 16);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(251, 191, 36);

      let docReportName = 'COMBINED FINANCIAL & OPERATIONS AUDIT STATEMENT';
      if (reportType === 'revenue') {
        docReportName = 'GROSS REVENUE & FINANCIAL AUDIT STATEMENT';
      } else if (reportType === 'orders') {
        docReportName = 'ORDER VOLUME & FULFILLMENT AUDIT STATEMENT';
      }

      doc.text(
        `${docReportName} • ${isAdmin ? 'CENTRAL HQ (ALL BRANCHES)' : `${branchCity?.toUpperCase() || 'BRANCH'} LOCATION`}`,
        14,
        23
      );

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(7.5);
      doc.text('Certified FSSAI: 10722001000456 | GSTIN: 24ABCDE1234F1Z5 | Pure Veg Heritage Dining', 14, 30);

      // Metadata right aligned
      doc.setFontSize(7.5);
      doc.setTextColor(251, 191, 36);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 196, 16, { align: 'right' });
      doc.setTextColor(255, 255, 255);
      doc.text(`Scope: ${periodTitle}`, 196, 22, { align: 'right' });
      doc.text(`Authorized By: ${user?.name || (isAdmin ? 'Central Admin' : 'Branch Manager')}`, 196, 28, { align: 'right' });

      let currentY = 44;

      // 2. Executive KPI Summary Cards Box
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('EXECUTIVE AUDIT SUMMARY', 14, currentY);

      currentY += 4;

      let summaryTableHead = [];
      let summaryTableBody = [];

      if (reportType === 'revenue') {
        summaryTableHead = [['Total Gross Revenue', 'Total Invoiced Orders', 'Average Order Value (AOV)', 'Report Scope']];
        summaryTableBody = [
          [
            `Rs. ${summary.totalRevenue.toLocaleString()}`,
            `${summary.totalOrders} Orders`,
            `Rs. ${summary.overallAOV}`,
            periodTitle,
          ],
        ];
      } else if (reportType === 'orders') {
        summaryTableHead = [['Total Orders', 'Fulfilled (Delivered)', 'Cancelled Orders', 'Fulfillment Rate']];
        const rate = summary.totalOrders > 0 ? Math.round((summary.totalDelivered / summary.totalOrders) * 100) : 100;
        summaryTableBody = [
          [
            `${summary.totalOrders} Orders`,
            `${summary.totalDelivered} Delivered`,
            `${summary.totalCancelled} Cancelled`,
            `${rate}% Success`,
          ],
        ];
      } else {
        summaryTableHead = [['Total Gross Revenue', 'Total Orders', 'Average Order Value', 'Delivered %']];
        const rate = summary.totalOrders > 0 ? Math.round((summary.totalDelivered / summary.totalOrders) * 100) : 100;
        summaryTableBody = [
          [
            `Rs. ${summary.totalRevenue.toLocaleString()}`,
            `${summary.totalOrders} Orders`,
            `Rs. ${summary.overallAOV}`,
            `${rate}% (${summary.totalDelivered} ord)`,
          ],
        ];
      }

      autoTable(doc, {
        startY: currentY,
        head: summaryTableHead,
        body: summaryTableBody,
        theme: 'grid',
        headStyles: { fillColor: darkColor, textColor: [251, 191, 36], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 8.5, fontStyle: 'bold', cellPadding: 3, halign: 'center' },
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 8;

      // 3. Core Report Table based on Report Type
      doc.setFontSize(10.5);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text(
        reportType === 'revenue'
          ? 'DETAILED REVENUE AUDIT BREAKDOWN'
          : reportType === 'orders'
          ? 'DETAILED ORDER FULFILLMENT BREAKDOWN'
          : 'COMBINED FINANCIAL & VOLUME BREAKDOWN',
        14,
        currentY
      );

      currentY += 4;

      let tableHead = [];
      let tableBody = [];

      if (reportType === 'revenue') {
        tableHead = [['#', 'Timeline / Slot', 'Date', 'Orders', 'Subtotal', 'GST/Tax', 'Gross Revenue', 'AOV']];
        tableBody = rows.map((r) => [
          r.index,
          r.label,
          r.date,
          r.orders,
          `Rs. ${(r.subtotal || 0).toLocaleString()}`,
          `Rs. ${(r.tax || 0).toLocaleString()}`,
          `Rs. ${(r.revenue || 0).toLocaleString()}`,
          `Rs. ${r.aov || 0}`,
        ]);

        // Totals Row
        tableBody.push([
          'TOTAL',
          'ALL SLOTS SUMMARY',
          '-',
          summary.totalOrders,
          `Rs. ${rows.reduce((s, r) => s + (r.subtotal || 0), 0).toLocaleString()}`,
          `Rs. ${rows.reduce((s, r) => s + (r.tax || 0), 0).toLocaleString()}`,
          `Rs. ${summary.totalRevenue.toLocaleString()}`,
          `Rs. ${summary.overallAOV}`,
        ]);
      } else if (reportType === 'orders') {
        tableHead = [['#', 'Timeline / Slot', 'Date', 'Total Orders', 'Delivered', 'Pending', 'Cancelled', 'Fulfilled %']];
        tableBody = rows.map((r) => {
          const pct = r.orders > 0 ? Math.round((r.delivered / r.orders) * 100) : 100;
          return [
            r.index,
            r.label,
            r.date,
            r.orders,
            r.delivered,
            r.pending,
            r.cancelled,
            `${pct}%`,
          ];
        });

        tableBody.push([
          'TOTAL',
          'ALL SLOTS SUMMARY',
          '-',
          summary.totalOrders,
          summary.totalDelivered,
          rows.reduce((s, r) => s + (r.pending || 0), 0),
          summary.totalCancelled,
          `${summary.totalOrders > 0 ? Math.round((summary.totalDelivered / summary.totalOrders) * 100) : 100}%`,
        ]);
      } else {
        // Combined
        tableHead = [['#', 'Timeline / Slot', 'Date', 'Orders', 'Delivered', 'Gross Revenue', 'AOV', 'Fulfilled %']];
        tableBody = rows.map((r) => {
          const pct = r.orders > 0 ? Math.round((r.delivered / r.orders) * 100) : 100;
          return [
            r.index,
            r.label,
            r.date,
            r.orders,
            r.delivered,
            `Rs. ${(r.revenue || 0).toLocaleString()}`,
            `Rs. ${r.aov || 0}`,
            `${pct}%`,
          ];
        });

        tableBody.push([
          'TOTAL',
          'ALL SLOTS SUMMARY',
          '-',
          summary.totalOrders,
          summary.totalDelivered,
          `Rs. ${summary.totalRevenue.toLocaleString()}`,
          `Rs. ${summary.overallAOV}`,
          `${summary.totalOrders > 0 ? Math.round((summary.totalDelivered / summary.totalOrders) * 100) : 100}%`,
        ]);
      }

      autoTable(doc, {
        startY: currentY,
        head: tableHead,
        body: tableBody,
        theme: 'striped',
        headStyles: { fillColor: darkColor, textColor: [251, 191, 36], fontStyle: 'bold', fontSize: 8 },
        styles: { fontSize: 7.5, cellPadding: 2.8, valign: 'middle' },
        columnStyles: {
          0: { width: 8, halign: 'center' },
          1: { fontStyle: 'bold' },
          3: { halign: 'center', fontStyle: 'bold' },
          4: { halign: 'right' },
          5: { halign: 'right' },
          6: { halign: 'right', fontStyle: 'bold', textColor: primaryColor },
          7: { halign: 'center' },
        },
      });

      // 4. Professional Certification Footer
      const totalPages = doc.internal.getNumberOfPages();
      for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFontSize(7);
        doc.setTextColor(150, 150, 150);
        doc.text(
          `SwadGhar Official Statement • Page ${i} of ${totalPages} • Confidential Restaurant Records`,
          14,
          290
        );
        doc.text('System Certified Document', 196, 290, { align: 'right' });
      }

      const fileName = `SwadGhar_${reportType.toUpperCase()}_Report_${period}_${todayStr}.pdf`;
      doc.save(fileName);
      onClose();
    } catch (err) {
      console.error('PDF generation error:', err);
      alert('Failed to generate PDF. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  // Generate & Download CSV
  const handleDownloadCSV = async () => {
    setGenerating(true);
    try {
      const { periodTitle, rows, summary } = await prepareExportData();

      let headers = [];
      let csvRows = [];

      if (reportType === 'revenue') {
        headers = ['Index', 'Timeline_Slot', 'Date', 'Orders_Count', 'Subtotal_INR', 'Tax_INR', 'Gross_Revenue_INR', 'AOV_INR', 'Online_Count', 'COD_Count'];
        csvRows = rows.map((r) => [
          r.index,
          `"${r.label}"`,
          `"${r.date}"`,
          r.orders,
          r.subtotal,
          r.tax,
          r.revenue,
          r.aov,
          r.online,
          r.cod,
        ]);
        csvRows.push(['TOTAL', '"ALL SUMMARY"', '"-"', summary.totalOrders, '', '', summary.totalRevenue, summary.overallAOV, '', '']);
      } else if (reportType === 'orders') {
        headers = ['Index', 'Timeline_Slot', 'Date', 'Total_Orders', 'Delivered_Count', 'Pending_Count', 'Cancelled_Count', 'Fulfillment_Rate_Pct', 'Online_Count', 'COD_Count'];
        csvRows = rows.map((r) => {
          const pct = r.orders > 0 ? Math.round((r.delivered / r.orders) * 100) : 100;
          return [
            r.index,
            `"${r.label}"`,
            `"${r.date}"`,
            r.orders,
            r.delivered,
            r.pending,
            r.cancelled,
            `${pct}%`,
            r.online,
            r.cod,
          ];
        });
        csvRows.push(['TOTAL', '"ALL SUMMARY"', '"-"', summary.totalOrders, summary.totalDelivered, '', summary.totalCancelled, '', '', '']);
      } else {
        headers = ['Index', 'Timeline_Slot', 'Date', 'Total_Orders', 'Delivered_Count', 'Gross_Revenue_INR', 'AOV_INR', 'Fulfilled_Rate_Pct'];
        csvRows = rows.map((r) => {
          const pct = r.orders > 0 ? Math.round((r.delivered / r.orders) * 100) : 100;
          return [
            r.index,
            `"${r.label}"`,
            `"${r.date}"`,
            r.orders,
            r.delivered,
            r.revenue,
            r.aov,
            `${pct}%`,
          ];
        });
        csvRows.push(['TOTAL', '"ALL SUMMARY"', '"-"', summary.totalOrders, summary.totalDelivered, summary.totalRevenue, summary.overallAOV, '']);
      }

      const csvContent = [
        `# SwadGhar Restaurant - ${reportType.toUpperCase()} STATEMENT`,
        `# Scope: ${periodTitle}`,
        `# Generated: ${new Date().toISOString()}`,
        headers.join(','),
        ...csvRows.map((e) => e.join(',')),
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `SwadGhar_${reportType.toUpperCase()}_Report_${period}_${todayStr}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      onClose();
    } catch (err) {
      console.error('CSV generation error:', err);
      alert('Failed to export CSV. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-stone-950 border border-stone-800 w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto custom-scrollbar">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-stone-900 hover:bg-stone-800 text-stone-400 hover:text-white transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30">
              Custom Report Generator
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-white">
            Export Financial & Operations Statement
          </h2>
          <p className="text-xs sm:text-sm text-stone-400">
            Select the report category and time period scope to generate your statement.
          </p>
        </div>

        {/* Step 1: Report Type Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-amber-400" />
            <span>1. Select Report Type</span>
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              {
                id: 'revenue',
                title: 'Revenue Report',
                desc: 'Gross sales, subtotal, GST/tax, AOV & payment modes',
                icon: DollarSign,
                color: 'text-amber-400',
              },
              {
                id: 'orders',
                title: 'Orders Report',
                desc: 'Order counts, delivered, preparing, cancelled & status',
                icon: ShoppingBag,
                color: 'text-brand-400',
              },
              {
                id: 'combined',
                title: 'Combined Report',
                desc: 'Complete Revenue + Order volume combined audit',
                icon: TrendingUp,
                color: 'text-emerald-400',
              },
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = reportType === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setReportType(t.id)}
                  className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'bg-amber-500/10 border-amber-500/80 shadow-glow'
                      : 'bg-stone-900/80 border-stone-800 hover:border-stone-700'
                  }`}
                >
                  <div className="flex items-center justify-between w-full mb-1.5">
                    <Icon className={`w-4 h-4 ${t.color}`} />
                    {isSelected && <CheckCircle2 className="w-4 h-4 text-amber-400" />}
                  </div>
                  <span className="text-xs font-bold text-white block">{t.title}</span>
                  <span className="text-[10px] text-stone-400 block mt-0.5">{t.desc}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Time Period Scope Selection */}
        <div className="space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-stone-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-brand-400" />
            <span>2. Select Period Scope</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {[
              { id: 'today', label: 'Today', sub: 'Hourly Slots' },
              { id: 'week', label: 'Week', sub: 'Last 7 Days' },
              { id: 'month', label: 'Month', sub: 'Day / Week Wise' },
              { id: 'year', label: 'Year', sub: 'Month / Quarter' },
              { id: 'custom', label: 'Custom Date', sub: 'Select Range' },
            ].map((p) => {
              const isSelected = period === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setPeriod(p.id);
                    if (p.id === 'month') setGranularity('day');
                    if (p.id === 'year') setGranularity('month');
                    if (p.id === 'custom') setGranularity('day');
                  }}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white border-transparent font-bold shadow-sm'
                      : 'bg-stone-900 border-stone-800 text-stone-300 hover:text-white hover:border-stone-700'
                  }`}
                >
                  <span className="text-xs block font-semibold">{p.label}</span>
                  <span className="text-[9.5px] text-stone-300/80 block mt-0.5">{p.sub}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 3: Granularity Sub-options */}
        {period === 'month' && (
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
            <span className="text-[11px] font-bold text-stone-300 block">
              Month Breakdown Format:
            </span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setGranularity('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'day'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                📅 Day-wise (All 1-31 Days Table)
              </button>
              <button
                type="button"
                onClick={() => setGranularity('week')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'week'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                🗓️ Week-wise (Week 1, 2, 3, 4)
              </button>
            </div>
          </div>
        )}

        {period === 'year' && (
          <div className="p-3.5 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-2">
            <span className="text-[11px] font-bold text-stone-300 block">
              Annual Breakdown Format:
            </span>
            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setGranularity('month')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'month'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                📆 Month-wise (Jan to Dec - 12 Months)
              </button>
              <button
                type="button"
                onClick={() => setGranularity('quarter')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'quarter'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                📊 Quarter-wise (Q1, Q2, Q3, Q4)
              </button>
            </div>
          </div>
        )}

        {period === 'custom' && (
          <div className="p-4 rounded-2xl bg-stone-900/60 border border-stone-800/80 space-y-3">
            <span className="text-[11px] font-bold text-stone-300 block">
              Select Custom Date Range:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[10px] text-stone-400 font-bold uppercase block mb-1">From Date:</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>
              <div>
                <label className="text-[10px] text-stone-400 font-bold uppercase block mb-1">To Date:</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-stone-950 border border-stone-800 text-white text-xs focus:border-amber-500 outline-none"
                />
              </div>
            </div>
            <div className="flex gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setGranularity('day')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'day'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                📅 Day-by-Day Summary Table
              </button>
              <button
                type="button"
                onClick={() => setGranularity('itemized')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                  granularity === 'itemized'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 font-bold'
                    : 'bg-stone-900 text-stone-400 border-stone-800 hover:text-white'
                }`}
              >
                🧾 Itemized Order-by-Order Log
              </button>
            </div>
          </div>
        )}

        {/* Action Buttons: PDF vs CSV */}
        <div className="pt-3 border-t border-stone-800/80 flex flex-col sm:flex-row items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-stone-300 text-xs font-semibold border border-stone-800 transition-colors cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleDownloadCSV}
            disabled={generating}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV Spreadsheet</span>
          </button>

          <button
            type="button"
            onClick={handleDownloadPDF}
            disabled={generating}
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-amber-600 hover:from-brand-500 hover:to-amber-500 text-white text-xs font-bold shadow-lg shadow-brand-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{generating ? 'Generating PDF...' : 'Download PDF Report'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportExportModal;
