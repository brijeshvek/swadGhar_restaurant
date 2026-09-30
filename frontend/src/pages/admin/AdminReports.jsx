import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  ShoppingBag,
  Users,
  Store,
  ChefHat,
  Clock,
  ArrowUpRight,
  Filter,
  CheckCircle2,
  XCircle,
  CreditCard,
  Banknote,
  Utensils,
  MapPin,
  FileSpreadsheet,
  FileText,
  BarChart2,
  PieChart,
  Sparkles,
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useTranslation } from '../../context/LanguageContext';
import { CountUp, SpotlightCard, AnimatedContent } from '../../components/animations';
import ReportExportModal from '../../components/admin/ReportExportModal';

const AdminReports = () => {
  const { user, isAdmin } = useAuth();
  const { t } = useTranslation();
  const [reportsData, setReportsData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('all'); // 'today', '7days', '30days', 'all'
  const [graphPeriod, setGraphPeriod] = useState('week'); // 'today', 'week', 'month', 'year'
  const [graphMetric, setGraphMetric] = useState('revenue'); // 'revenue' or 'orders'
  const [selectedBranchId, setSelectedBranchId] = useState('all');
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [hoveredReportPoint, setHoveredReportPoint] = useState(null);

  const fetchReports = async (range = timeRange) => {
    setLoading(true);
    try {
      const res = await api.get(`/admin/reports?timeRange=${range}`);
      if (res?.data) {
        setReportsData(res.data);
      }
    } catch (err) {
      console.error('Error loading reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports(timeRange);
  }, [timeRange]);

  // Export CSV Functionality
  const handleExportCSV = () => {
    if (!reportsData?.franchiseReports) return;

    let csvContent = 'data:text/csv;charset=utf-8,';

    if (isAdmin) {
      csvContent += 'Branch Location,Branch Name,General Manager,Staff Count,Total Orders,Total Revenue (INR),Avg Order Value (INR),Delivered Orders,Pending Orders,Cancelled Orders\n';
      reportsData.franchiseReports.forEach((f) => {
        csvContent += `"${f.city}","${f.name}","${f.managerName}",${f.staffCount || 0},${f.totalOrders || 0},${f.totalRevenue || 0},${f.avgOrderValue || 0},${f.deliveredOrders || 0},${f.pendingOrders || 0},${f.cancelledOrders || 0}\n`;
      });
    } else {
      const f = reportsData.franchiseReports[0];
      if (f) {
        csvContent += 'SwadGhar Restaurant Branch Performance Statement\n';
        csvContent += 'Metric,Value\n';
        csvContent += `Branch Location,"${f.city} Branch"\n`;
        csvContent += `Branch Name,"${f.name}"\n`;
        csvContent += `General Manager,"${f.managerName}"\n`;
        csvContent += `Manager Email,"${f.managerEmail}"\n`;
        csvContent += `Manager Phone,"${f.managerPhone || f.phone}"\n`;
        csvContent += `Total Revenue (INR),${f.totalRevenue || 0}\n`;
        csvContent += `Total Orders,${f.totalOrders || 0}\n`;
        csvContent += `Average Order Value (INR),${f.avgOrderValue || 0}\n`;
        csvContent += `Delivered Orders,${f.deliveredOrders || 0}\n`;
        csvContent += `Pending Orders Queue,${f.pendingOrders || 0}\n`;
        csvContent += `Active Staff Strength,${f.staffCount || 0}\n`;
      }
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `SwadGhar_${isAdmin ? 'All_Franchises' : `${reportsData.branchCity}_Branch`}_Report_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // High-Resolution Professional PDF Generation using jsPDF & autoTable
  const handleDownloadPDF = () => {
    if (!reportsData) return;

    try {
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const primaryColor = [180, 83, 9]; // Amber-700
      const darkColor = [28, 25, 23]; // Stone-900
      const accentGold = [217, 119, 6]; // Amber-600
      const grayText = [120, 113, 108]; // Stone-500

      // 1. Header Banner
      doc.setFillColor(...darkColor);
      doc.rect(0, 0, 210, 42, 'F');

      // Top Gold Accent Bar
      doc.setFillColor(...accentGold);
      doc.rect(0, 0, 210, 4, 'F');

      // SwadGhar Title & Branding
      doc.setTextColor(255, 255, 255);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(22);
      doc.text('SWADGHAR RESTAURANTS', 14, 18);

      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(251, 191, 36); // Amber-400
      doc.text(
        isAdmin
          ? 'EXECUTIVE NETWORK PERFORMANCE & FINANCIAL AUDIT STATEMENT'
          : `BRANCH SALES & OPERATIONS STATEMENT - ${reportsData.branchCity?.toUpperCase() || 'BRANCH'}`,
        14,
        25
      );

      doc.setTextColor(200, 200, 200);
      doc.setFontSize(8);
      doc.text('100% Pure Veg Traditional & Kathiyawadi Heritage Fine Dining Network', 14, 31);
      doc.text('Certified FSSAI: 10722001000456 | GSTIN: 24ABCDE1234F1Z5', 14, 36);

      // Statement Metadata (Right Aligned in Header)
      doc.setFontSize(8);
      doc.setTextColor(251, 191, 36);
      doc.text(`Generated: ${new Date().toLocaleString('en-IN')}`, 196, 18, { align: 'right' });
      doc.setTextColor(255, 255, 255);
      doc.text(`Period Scope: ${timeRange.toUpperCase()}`, 196, 24, { align: 'right' });
      doc.text(`Generated By: ${user?.name || (isAdmin ? 'Super Admin HQ' : 'Branch Manager')}`, 196, 30, { align: 'right' });

      let currentY = 50;

      // 2. Executive Financial Summary Cards in PDF
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('1. EXECUTIVE SUMMARY & KEY METRICS', 14, currentY);

      currentY += 5;

      const summaryData = [
        [
          'Total Gross Revenue',
          `Rs. ${(reportsData.overall?.totalRevenue || 0).toLocaleString()}`,
          'Total Orders Processed',
          `${reportsData.overall?.totalOrders || 0} Orders`,
        ],
        [
          'Average Order Value (AOV)',
          `Rs. ${reportsData.overall?.avgOrderValue || 0}`,
          'Order Fulfillment Rate',
          `${reportsData.overall?.deliveredCount || 0} Delivered (${reportsData.overall?.totalOrders > 0 ? Math.round((reportsData.overall.deliveredCount / reportsData.overall.totalOrders) * 100) : 100}%)`,
        ],
        [
          'Kitchen Prep Queue',
          `${reportsData.overall?.pendingCount || 0} Active`,
          'Network Scope',
          isAdmin ? `${reportsData.franchiseReports?.length || 5} Operating Franchises` : `${reportsData.branchCity} Dedicated Branch`,
        ],
      ];

      autoTable(doc, {
        startY: currentY,
        head: [],
        body: summaryData,
        theme: 'grid',
        styles: { fontSize: 8.5, cellPadding: 3 },
        columnStyles: {
          0: { fontStyle: 'bold', fillColor: [245, 245, 244], textColor: darkColor, width: 50 },
          1: { fontStyle: 'bold', textColor: primaryColor, width: 45 },
          2: { fontStyle: 'bold', fillColor: [245, 245, 244], textColor: darkColor, width: 50 },
          3: { fontStyle: 'bold', textColor: [16, 185, 129], width: 45 },
        },
      });

      currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 10;

      // 3. Multi-Franchise Table (Admin) or Single Branch Roster (Manager)
      if (isAdmin) {
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(...darkColor);
        doc.text('2. 5 FRANCHISES COMPARATIVE PERFORMANCE AUDIT', 14, currentY);

        currentY += 4;

        const franchiseTableHead = [
          ['#', 'Branch Location', 'General Manager', 'Staff', 'Orders', 'Gross Revenue', 'AOV', 'Fulfilled %'],
        ];

        const franchiseTableBody = (reportsData.franchiseReports || []).map((f, idx) => [
          idx + 1,
          `${f.city} Branch\n(${f.name})`,
          `${f.managerName}\n${f.managerPhone || ''}`,
          `${f.staffCount || 9} Staff`,
          f.totalOrders || 0,
          `Rs. ${(f.totalRevenue || 0).toLocaleString()}`,
          `Rs. ${f.avgOrderValue || 0}`,
          `${f.completionRate || 100}%`,
        ]);

        autoTable(doc, {
          startY: currentY,
          head: franchiseTableHead,
          body: franchiseTableBody,
          theme: 'striped',
          headStyles: { fillColor: darkColor, textColor: [251, 191, 36], fontStyle: 'bold', fontSize: 8.5 },
          styles: { fontSize: 8, cellPadding: 3, valign: 'middle' },
          columnStyles: {
            0: { width: 8, halign: 'center' },
            1: { width: 45, fontStyle: 'bold' },
            2: { width: 38 },
            3: { width: 18, halign: 'center' },
            4: { width: 16, halign: 'center', fontStyle: 'bold' },
            5: { width: 28, halign: 'right', textColor: primaryColor, fontStyle: 'bold' },
            6: { width: 20, halign: 'right' },
            7: { width: 18, halign: 'center', textColor: [16, 185, 129], fontStyle: 'bold' },
          },
        });

        currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 40) + 10;
      } else {
        // Single branch detailed statement
        const b = reportsData.franchiseReports?.[0];
        if (b) {
          doc.setFontSize(12);
          doc.setFont('helvetica', 'bold');
          doc.setTextColor(...darkColor);
          doc.text(`2. ${b.city.toUpperCase()} BRANCH IDENTITY & STAFF ROSTER`, 14, currentY);

          currentY += 4;

          const branchDetailRows = [
            ['Branch Address', b.address || `${b.city}, Gujarat`],
            ['Seating Capacity', `${b.seatingCapacity || 120} Dining Seats (${b.branchType || 'Family Dining'})`],
            ['General Manager Contact', `${b.managerName} | ${b.managerEmail} | ${b.managerPhone || '+91 98250 11234'}`],
            ['Active Staff Team', `${b.staffCount || b.staffTeam?.length || 9} Full-Time Personnel`],
          ];

          autoTable(doc, {
            startY: currentY,
            head: [],
            body: branchDetailRows,
            theme: 'grid',
            styles: { fontSize: 8.5, cellPadding: 3 },
            columnStyles: {
              0: { fontStyle: 'bold', fillColor: [245, 245, 244], textColor: darkColor, width: 45 },
              1: { textColor: darkColor },
            },
          });

          currentY = (doc.lastAutoTable ? doc.lastAutoTable.finalY : currentY + 30) + 10;
        }
      }

      // 4. Verification & Audit Footer
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }

      doc.setFillColor(245, 245, 244);
      doc.roundedRect(14, currentY, 182, 30, 2, 2, 'F');

      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...darkColor);
      doc.text('OFFICIAL VERIFICATION & CERTIFICATION', 20, currentY + 7);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(...grayText);
      doc.text('This financial and operations performance document is generated electronically from the SwadGhar Central Database.', 20, currentY + 13);
      doc.text('All order totals, revenue aggregations, tax compliances, and staff allocations are verified as authentic.', 20, currentY + 18);
      doc.text('Contact SwadGhar Central Corporate Office: corporate@swadghar.com | +91 98765 43210', 20, currentY + 23);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...primaryColor);
      doc.text('SWADGHAR AUTHORIZED REPORT', 190, currentY + 23, { align: 'right' });

      // Save PDF
      doc.save(`SwadGhar_${isAdmin ? 'All_Franchises_Performance_Report' : `${reportsData.branchCity}_Branch_Statement`}_${timeRange}.pdf`);
    } catch (err) {
      console.error('Error generating PDF:', err);
      window.print();
    }
  };

  const branchList = reportsData?.franchiseReports || [];
  const activeReport =
    selectedBranchId === 'all'
      ? (isAdmin ? null : branchList[0])
      : branchList.find((b) => b._id === selectedBranchId || b.city === selectedBranchId) || branchList[0];

  const overall = reportsData?.overall || {
    totalRevenue: branchList.reduce((s, b) => s + (b.totalRevenue || 0), 0),
    totalOrders: branchList.reduce((s, b) => s + (b.totalOrders || 0), 0),
    avgOrderValue: 0,
    deliveredCount: branchList.reduce((s, b) => s + (b.deliveredOrders || 0), 0),
    pendingCount: branchList.reduce((s, b) => s + (b.pendingOrders || 0), 0),
    cancelledCount: branchList.reduce((s, b) => s + (b.cancelledOrders || 0), 0),
  };

  // Timeline data for the active graph period
  const activeTimeline = reportsData?.timelines?.[graphPeriod] || [
    { label: 'Slot 1', orders: 4, revenue: 3500 },
    { label: 'Slot 2', orders: 6, revenue: 5200 },
    { label: 'Slot 3', orders: 8, revenue: 7400 },
    { label: 'Slot 4', orders: 5, revenue: 4800 },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto text-stone-100">
      {/* Header & Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
        <div>
          <div className="flex items-center gap-2">
            <FileSpreadsheet className="w-6 h-6 text-amber-500" />
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-white">
              {isAdmin ? t('admin.franchiseLeaderboard', '5 Franchises Comprehensive Reports & Audit') : `${reportsData?.branchCity || 'Branch'} ${t('admin.branchReports', 'Sales & Performance Statement')}`}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-stone-400 mt-1">
            {isAdmin
              ? t('admin.networkOverview', 'Multi-branch comparative analytics, revenue breakdown, AOV & operational performance across all 5 locations')
              : `${t('admin.branchReportsSub', 'Dedicated performance statement, revenue audit, order distribution & staff analytics for')} ${reportsData?.branchCity || 'your branch'}`}
          </p>
        </div>

        {/* Action Controls & Modern Filter Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Enhanced Time Range Filter Bar */}
          <div className="flex items-center bg-stone-950 p-1 rounded-2xl border border-stone-800 shadow-inner">
            <div className="flex items-center gap-1.5 px-2.5 text-stone-500 hidden sm:flex">
              <Calendar className="w-3.5 h-3.5 text-amber-500" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400">{t('admin.filter', 'Filter:')}</span>
            </div>
            <div className="flex items-center gap-1">
              {[
                { label: t('periods.today', 'Today'), value: 'today' },
                { label: t('periods.week', '7 Days'), value: '7days' },
                { label: t('periods.month', '30 Days'), value: '30days' },
                { label: t('periods.allTime', 'All Time'), value: 'all' },
              ].map((tb) => (
                <button
                  key={tb.value}
                  onClick={() => setTimeRange(tb.value)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${timeRange === tb.value
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-stone-950 shadow-md shadow-amber-500/20 font-extrabold'
                      : 'text-stone-400 hover:text-white hover:bg-stone-900/80'
                    }`}
                >
                  {tb.label}
                </button>
              ))}
            </div>
          </div>

          {/* Unified Single Download Report Button */}
          <button
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-brand-600 via-amber-600 to-amber-500 hover:brightness-110 active:scale-95 text-white text-xs font-bold flex items-center gap-2 transition-all shadow-lg shadow-amber-500/25 cursor-pointer border border-amber-400/20"
            title={t('admin.downloadReport', 'Download Custom PDF or CSV Report')}
          >
            <Download className="w-4 h-4 text-amber-200" />
            <span className="tracking-wide">{t('admin.downloadReport', 'Download Report')}</span>
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-24 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-amber-400 text-xs tracking-wider uppercase font-bold">
            {t('common.loading', 'Aggregating Financial & Branch Statements...')}
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Top KPI Metrics Overview */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <SpotlightCard className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/20 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase">
                <span>{isAdmin ? t('admin.totalRevenue', 'Total Network Revenue') : `${reportsData?.branchCity || 'Branch'} ${t('admin.totalRevenue', 'Revenue')}`}</span>
                <DollarSign className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                  ₹<CountUp to={overall.totalRevenue || 0} duration={1} />
                </span>
                <span className="text-[11px] text-stone-400">
                  {t('admin.avgOrderValue', 'Avg Order Value')}: ₹{overall.avgOrderValue || (overall.totalOrders > 0 ? Math.round(overall.totalRevenue / overall.totalOrders) : 0)}
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-3xl bg-brand-500/10 border border-brand-500/20 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase">
                <span>{t('admin.totalOrders', 'Total Orders')}</span>
                <ShoppingBag className="w-4 h-4 text-brand-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                  <CountUp to={overall.totalOrders || 0} duration={1} />
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-semibold">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{overall.deliveredCount || 0} {t('admin.deliveredOrders', 'Delivered')} ({overall.totalOrders > 0 ? Math.round((overall.deliveredCount / overall.totalOrders) * 100) : 100}%)</span>
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-3xl bg-rose-500/10 border border-rose-500/20 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase">
                <span>{t('admin.pendingOrders', 'Kitchen Queue')}</span>
                <Clock className="w-4 h-4 text-rose-400" />
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                  <CountUp to={overall.pendingCount || 0} duration={1} />
                </span>
                <span className="text-[11px] text-stone-400">
                  {t('admin.activeCookingPrep', 'Active cooking, prep & dispatch')}
                </span>
              </div>
            </SpotlightCard>

            <SpotlightCard className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/20 backdrop-blur-md space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-stone-400 uppercase">
                <span>{isAdmin ? t('admin.activeFranchises', 'Active Franchises') : t('admin.staffStrength', 'Staff Strength')}</span>
                {isAdmin ? <Store className="w-4 h-4 text-purple-400" /> : <ChefHat className="w-4 h-4 text-purple-400" />}
              </div>
              <div className="space-y-0.5">
                <span className="text-2xl sm:text-3xl font-bold font-sans text-white block">
                  {isAdmin ? branchList.length : (branchList[0]?.staffCount || branchList[0]?.staffTeam?.length || 9)}
                </span>
                <span className="text-[11px] text-stone-400">
                  {isAdmin ? 'Ahmedabad, Surat, Baroda, Rajkot, Mumbai' : t('admin.executiveStaffSub', 'Executive chefs, stewards & floor team')}
                </span>
              </div>
            </SpotlightCard>
          </div>

          {/* Interactive Multi-Period Real Database Graphs: Two Separate Graphs for Revenue and Orders */}
          {/* Interactive Multi-Period Real Database Graphs: Two Separate Graphs for Revenue and Orders */}
          <AnimatedContent delay={0.1}>
            <div className="space-y-4">
              {/* Period Header Controls */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-stone-950 border border-stone-800">
                <div>
                  <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-brand-500" />
                    <span>
                      {isAdmin
                        ? `${t('admin.realPerformanceAnalytics', 'Live Real Database Performance')} (${t(`periods.${graphPeriod}`, graphPeriod.toUpperCase())})`
                        : `${reportsData?.branchCity || 'Branch'} ${t('admin.realPerformanceAnalytics', 'Real Performance Analytics')} (${t(`periods.${graphPeriod}`, graphPeriod.toUpperCase())})`}
                    </span>
                  </h3>
                  <p className="text-xs text-stone-400">
                    {t('admin.chartHoverHint', 'Real-time aggregated metrics from database for Revenue (₹) and Order Volume')}
                  </p>
                </div>

                {/* Period Tabs: Today, Week, Month, Year */}
                <div className="flex items-center bg-stone-900 p-1 rounded-xl border border-stone-800 text-xs font-semibold">
                  {[
                    { label: t('periods.today', 'Today'), value: 'today' },
                    { label: t('periods.week', 'Week (7D)'), value: 'week' },
                    { label: t('periods.month', 'Month'), value: 'month' },
                    { label: t('periods.year', 'Year'), value: 'year' },
                  ].map((tab) => (
                    <button
                      key={tab.value}
                      onClick={() => setGraphPeriod(tab.value)}
                      className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${graphPeriod === tab.value
                          ? 'bg-gradient-to-r from-brand-600 to-amber-600 text-white font-bold shadow-sm'
                          : 'text-stone-400 hover:text-white'
                        }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dual Graphs Grid: Left = Revenue Graph, Right = Order Volume Graph */}
              {(() => {
                const activeData = reportsData?.timelines?.[graphPeriod] || [];
                const maxRevenue = Math.max(...activeData.map((t) => t.revenue || 0), 1);
                const maxOrders = Math.max(...activeData.map((t) => t.orders || 0), 1);

                return (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* 1. SEPARATE REVENUE GRAPH (₹ Line Chart) */}
                    <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <DollarSign className="w-4 h-4 text-amber-400" />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            {t('admin.revenueLineChart', 'Gross Revenue (₹ Line Chart)')} • {t(`periods.${graphPeriod}`, graphPeriod.toUpperCase())}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-amber-400">
                          {t('common.total', 'Total')}: ₹{activeData.reduce((s, i) => s + (i.revenue || 0), 0).toLocaleString()}
                        </span>
                      </div>

                      {/* Curvy Smooth SVG Line Chart with Responsive Hover Tooltips */}
                      <div className="h-48 w-full pt-1 relative">
                        {(() => {
                          const width = 500;
                          const height = 180;
                          const padX = 35;
                          const padY = 25;
                          const plotW = width - padX * 2;
                          const plotH = height - padY * 2 - 20;

                          const points = activeData.map((item, i) => {
                            const x = padX + (activeData.length > 1 ? (i / (activeData.length - 1)) * plotW : plotW / 2);
                            const val = item.revenue || 0;
                            const orders = item.orders || 0;
                            const y = padY + (1 - (maxRevenue > 0 ? val / maxRevenue : 0)) * plotH;
                            return { x, y, val, orders, label: item.label };
                          });

                          let linePath = '';
                          let areaPath = '';
                          const bottomY = padY + plotH;

                          if (points.length > 0) {
                            if (points.length === 1) {
                              linePath = `M ${points[0].x - 25} ${points[0].y} L ${points[0].x + 25} ${points[0].y}`;
                              areaPath = `M ${points[0].x - 25} ${points[0].y} L ${points[0].x + 25} ${points[0].y} L ${points[0].x + 25} ${bottomY} L ${points[0].x - 25} ${bottomY} Z`;
                            } else {
                              linePath = `M ${points[0].x} ${points[0].y}`;
                              for (let i = 0; i < points.length - 1; i++) {
                                const p0 = points[i];
                                const p1 = points[i + 1];
                                const cx = (p0.x + p1.x) / 2;
                                linePath += ` C ${cx} ${p0.y}, ${cx} ${p1.y}, ${p1.x} ${p1.y}`;
                              }
                              areaPath = `${linePath} L ${points[points.length - 1].x} ${bottomY} L ${points[0].x} ${bottomY} Z`;
                            }
                          }

                          const colWidth = points.length > 1 ? plotW / (points.length - 1) : plotW;

                          return (
                            <svg
                              viewBox="0 0 500 180"
                              className="w-full h-full overflow-visible select-none"
                              onMouseLeave={() => setHoveredReportPoint(null)}
                            >
                              <defs>
                                <linearGradient id="repRevLineGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.45" />
                                  <stop offset="65%" stopColor="#d97706" stopOpacity="0.12" />
                                  <stop offset="100%" stopColor="#b45309" stopOpacity="0.0" />
                                </linearGradient>
                                <linearGradient id="repGuideGrad" x1="0" y1="0" x2="0" y2="1">
                                  <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.8" />
                                  <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.1" />
                                </linearGradient>
                                <filter id="repLineGlow" x="-20%" y="-20%" width="140%" height="140%">
                                  <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#f59e0b" floodOpacity="0.55" />
                                </filter>
                                <filter id="repTooltipShadow" x="-30%" y="-30%" width="160%" height="160%">
                                  <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#000000" floodOpacity="0.8" />
                                </filter>
                              </defs>

                              {/* Grid Lines */}
                              <line x1="30" y1="25" x2="470" y2="25" stroke="#292524" strokeDasharray="3 3" strokeWidth="1" />
                              <line x1="30" y1="75" x2="470" y2="75" stroke="#292524" strokeDasharray="3 3" strokeWidth="1" />
                              <line x1="30" y1={bottomY} x2="470" y2={bottomY} stroke="#292524" strokeWidth="1" />

                              {/* Area Under Curve */}
                              {areaPath && <path d={areaPath} fill="url(#repRevLineGrad)" />}

                              {/* Line Path */}
                              {linePath && (
                                <path
                                  d={linePath}
                                  fill="none"
                                  stroke="#f59e0b"
                                  strokeWidth="3.5"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  filter="url(#repLineGlow)"
                                />
                              )}

                              {/* Points & Labels */}
                              {points.map((pt, idx) => {
                                const isHovered = hoveredReportPoint === idx;
                                return (
                                  <g key={idx}>
                                    {/* Active Vertical Guide Line */}
                                    {isHovered && (
                                      <line
                                        x1={pt.x}
                                        y1="18"
                                        x2={pt.x}
                                        y2={bottomY}
                                        stroke="url(#repGuideGrad)"
                                        strokeWidth="1.5"
                                        strokeDasharray="3 3"
                                      />
                                    )}

                                    {/* Glowing Halo when hovered */}
                                    {isHovered && (
                                      <circle
                                        cx={pt.x}
                                        cy={pt.y}
                                        r={9}
                                        fill="#f59e0b"
                                        fillOpacity="0.25"
                                        stroke="#fbbf24"
                                        strokeWidth="1.5"
                                      />
                                    )}

                                    {/* Main Point Circle */}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isHovered ? 6 : pt.val > 0 ? 5 : 3}
                                      fill="#1c1917"
                                      stroke={isHovered ? '#fbbf24' : '#f59e0b'}
                                      strokeWidth={isHovered ? 3 : 2.5}
                                      className="transition-all duration-150"
                                    />

                                    {/* Center Core Dot */}
                                    <circle
                                      cx={pt.x}
                                      cy={pt.y}
                                      r={isHovered ? 3 : pt.val > 0 ? 2 : 1}
                                      fill={isHovered ? '#ffffff' : pt.val > 0 ? '#fbbf24' : '#78716c'}
                                    />

                                    {/* X Axis Labels */}
                                    <text
                                      x={pt.x}
                                      y={bottomY + 14}
                                      textAnchor="middle"
                                      fill={isHovered ? '#fbbf24' : '#a8a29e'}
                                      fontSize="9.5"
                                      fontWeight={isHovered ? '700' : '600'}
                                      className="transition-colors"
                                    >
                                      {pt.label}
                                    </text>
                                    <text
                                      x={pt.x}
                                      y={bottomY + 25}
                                      textAnchor="middle"
                                      fill={isHovered ? '#f59e0b' : '#78716c'}
                                      fontSize="8"
                                      fontFamily="monospace"
                                      fontWeight={isHovered ? '700' : 'normal'}
                                    >
                                      ₹{pt.val > 1000 ? `${(pt.val / 1000).toFixed(1)}k` : pt.val}
                                    </text>
                                  </g>
                                );
                              })}

                              {/* Large Interactive Hover Hit Zones */}
                              {points.map((pt, idx) => (
                                <rect
                                  key={`rep-hit-${idx}`}
                                  x={pt.x - colWidth / 2}
                                  y={0}
                                  width={colWidth}
                                  height={height}
                                  fill="transparent"
                                  className="cursor-pointer"
                                  onMouseEnter={() => setHoveredReportPoint(idx)}
                                />
                              ))}

                              {/* Floating Hover Tooltip Box */}
                              {hoveredReportPoint !== null && points[hoveredReportPoint] && (() => {
                                const pt = points[hoveredReportPoint];
                                const boxW = 104;
                                const boxH = 46;
                                const clampedX = Math.max(8, Math.min(width - boxW - 8, pt.x - boxW / 2));
                                const clampedY = pt.y > 55 ? pt.y - boxH - 10 : pt.y + 12;

                                return (
                                  <g filter="url(#repTooltipShadow)" className="pointer-events-none animate-fade-in">
                                    <rect
                                      x={clampedX}
                                      y={clampedY}
                                      width={boxW}
                                      height={boxH}
                                      rx="8"
                                      fill="#0c0a09"
                                      stroke="#d97706"
                                      strokeWidth="1.2"
                                    />
                                    <text
                                      x={clampedX + boxW / 2}
                                      y={clampedY + 13}
                                      textAnchor="middle"
                                      fill="#d6d3d1"
                                      fontSize="9"
                                      fontWeight="600"
                                    >
                                      {pt.label}
                                    </text>
                                    <text
                                      x={clampedX + boxW / 2}
                                      y={clampedY + 27}
                                      textAnchor="middle"
                                      fill="#fbbf24"
                                      fontSize="12"
                                      fontWeight="bold"
                                      fontFamily="monospace"
                                    >
                                      ₹{pt.val.toLocaleString()}
                                    </text>
                                    <text
                                      x={clampedX + boxW / 2}
                                      y={clampedY + 39}
                                      textAnchor="middle"
                                      fill="#fdba74"
                                      fontSize="8.5"
                                      fontWeight="bold"
                                    >
                                      {pt.orders} Orders Processed
                                    </text>
                                  </g>
                                );
                              })()}
                            </svg>
                          );
                        })()}
                      </div>
                    </div>

                    {/* 2. SEPARATE ORDER VOLUME GRAPH (Orders Pie Chart) */}
                    <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                      <div className="flex items-center justify-between pb-2 border-b border-stone-800/80">
                        <div className="flex items-center gap-2">
                          <PieChart className="w-4 h-4 text-brand-400" />
                          <h4 className="text-sm font-bold text-white uppercase tracking-wider">
                            Order Volume (Pie Chart) • {graphPeriod.toUpperCase()}
                          </h4>
                        </div>
                        <span className="text-xs font-mono font-bold text-brand-400">
                          Total: {activeData.reduce((s, i) => s + (i.orders || 0), 0)} Orders
                        </span>
                      </div>

                      {/* SVG Pie / Donut Chart with Breakdown Legend */}
                      <div className="h-48 w-full flex items-center justify-center pt-1">
                        {(() => {
                          const totalOrders = activeData.reduce((s, i) => s + (i.orders || 0), 0);
                          const palette = [
                            '#f97316', '#10b981', '#3b82f6', '#ec4899', '#eab308',
                            '#06b6d4', '#8b5cf6', '#14b8a6', '#f43f5e', '#6366f1',
                            '#84cc16', '#a855f7'
                          ];

                          const nonZeroItems = activeData.filter((i) => (i.orders || 0) > 0);

                          if (totalOrders === 0 || nonZeroItems.length === 0) {
                            return (
                              <div className="flex flex-col items-center justify-center w-full h-full text-center space-y-2">
                                <svg viewBox="0 0 160 160" className="w-24 h-24">
                                  <circle cx="80" cy="80" r="56" fill="none" stroke="#292524" strokeWidth="18" />
                                  <text x="80" y="76" textAnchor="middle" fill="#a8a29e" fontSize="13" fontWeight="bold">0</text>
                                  <text x="80" y="90" textAnchor="middle" fill="#78716c" fontSize="8.5">Orders</text>
                                </svg>
                                <span className="text-xs text-stone-500 font-medium">No order distribution recorded in this period</span>
                              </div>
                            );
                          }

                          const cx = 80;
                          const cy = 80;
                          const outerR = 64;
                          const innerR = 38;
                          let cumulativeAngle = -Math.PI / 2;

                          const slices = nonZeroItems.map((item, idx) => {
                            const val = item.orders || 0;
                            const sliceAngle = (val / totalOrders) * 2 * Math.PI;
                            const startAngle = cumulativeAngle;
                            const endAngle = cumulativeAngle + sliceAngle;
                            cumulativeAngle = endAngle;

                            const x1 = cx + outerR * Math.cos(startAngle);
                            const y1 = cy + outerR * Math.sin(startAngle);
                            const x2 = cx + outerR * Math.cos(endAngle);
                            const y2 = cy + outerR * Math.sin(endAngle);

                            const x3 = cx + innerR * Math.cos(endAngle);
                            const y3 = cy + innerR * Math.sin(endAngle);
                            const x4 = cx + innerR * Math.cos(startAngle);
                            const y4 = cy + innerR * Math.sin(startAngle);

                            const largeArc = sliceAngle > Math.PI ? 1 : 0;
                            const color = palette[idx % palette.length];
                            const percent = Math.round((val / totalOrders) * 100);

                            let pathD = '';
                            if (nonZeroItems.length === 1) {
                              pathD = `M ${cx} ${cy - outerR} A ${outerR} ${outerR} 0 1 1 ${cx - 0.01} ${cy - outerR} L ${cx - 0.01} ${cy - innerR} A ${innerR} ${innerR} 0 1 0 ${cx} ${cy - innerR} Z`;
                            } else {
                              pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${x3} ${y3} A ${innerR} ${innerR} 0 ${largeArc} 0 ${x4} ${y4} Z`;
                            }

                            return {
                              ...item,
                              val,
                              color,
                              percent,
                              pathD,
                              label: item.label,
                            };
                          });

                          return (
                            <div className="flex flex-col sm:flex-row items-center justify-between w-full h-full gap-4">
                              {/* Pie / Donut SVG */}
                              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                                <svg viewBox="0 0 160 160" className="w-full h-full overflow-visible">
                                  <defs>
                                    <filter id="repPieGlow" x="-20%" y="-20%" width="140%" height="140%">
                                      <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#f97316" floodOpacity="0.3" />
                                    </filter>
                                  </defs>
                                  {slices.map((sl, sIdx) => (
                                    <path
                                      key={sIdx}
                                      d={sl.pathD}
                                      fill={sl.color}
                                      stroke="#0c0a09"
                                      strokeWidth="2.5"
                                      className="hover:opacity-80 transition-opacity cursor-pointer"
                                      filter="url(#repPieGlow)"
                                    >
                                      <title>{`${sl.label}: ${sl.val} orders (${sl.percent}%)`}</title>
                                    </path>
                                  ))}
                                </svg>
                                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                  <span className="text-base font-bold text-white font-mono">{totalOrders}</span>
                                  <span className="text-[9px] text-stone-400 uppercase font-semibold">Orders</span>
                                </div>
                              </div>

                              {/* Legend Breakdown */}
                              <div className="flex-1 w-full max-h-40 overflow-y-auto pr-1 space-y-1.5 custom-scrollbar">
                                {slices.map((sl, sIdx) => (
                                  <div
                                    key={sIdx}
                                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-stone-900/70 border border-stone-800/80 hover:border-stone-700 transition-colors"
                                  >
                                    <div className="flex items-center gap-2 min-w-0">
                                      <span
                                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-sm"
                                        style={{ backgroundColor: sl.color }}
                                      ></span>
                                      <span className="text-stone-300 font-semibold truncate text-xs">{sl.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2 shrink-0">
                                      <span className="font-bold text-white font-mono text-xs">{sl.val} ord</span>
                                      <span className="text-[10px] font-bold text-brand-300 font-mono bg-brand-950/80 border border-brand-800/50 px-1.5 py-0.5 rounded-md">
                                        {sl.percent}%
                                      </span>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
          </AnimatedContent>

          {/* Super Admin Multi-Franchise Comparison Table */}
          {isAdmin && (
            <AnimatedContent delay={0.2}>
              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-800">
                  <div>
                    <h3 className="text-base font-serif font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-amber-400" />
                      <span>{t('admin.franchiseLeaderboard', '5 Franchises Comparative Performance Table')}</span>
                    </h3>
                    <p className="text-xs text-stone-400">
                      {t('admin.franchiseLeaderboardSub', 'Direct side-by-side revenue, order volume, and operations leaderboard')}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20">
                    {t('admin.filter', 'Filter:')} {t(`periods.${timeRange}`, timeRange.toUpperCase())}
                  </span>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-stone-300">
                    <thead className="bg-stone-900/80 text-stone-400 uppercase text-[10px] font-bold border-b border-stone-800">
                      <tr>
                        <th className="px-4 py-3">{t('admin.branchLocation', 'Branch Location')}</th>
                        <th className="px-4 py-3">{t('admin.generalManager', 'General Manager')}</th>
                        <th className="px-4 py-3 text-center">{t('admin.teamSize', 'Team Size')}</th>
                        <th className="px-4 py-3 text-center">{t('admin.orders', 'Orders')}</th>
                        <th className="px-4 py-3 text-right">{t('admin.revenueINR', 'Revenue (INR)')}</th>
                        <th className="px-4 py-3 text-right">{t('admin.aovINR', 'Avg Order (AOV)')}</th>
                        <th className="px-4 py-3 text-center">{t('admin.fulfilledPct', 'Fulfilled %')}</th>
                        <th className="px-4 py-3 text-center">{t('admin.status', 'Status')}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60 font-medium">
                      {branchList.map((fran, idx) => (
                        <tr
                          key={fran._id || idx}
                          className="hover:bg-stone-900/50 transition-colors"
                        >
                          <td className="px-4 py-3.5">
                            <div className="font-bold text-white text-sm">{fran.city} Branch</div>
                            <div className="text-[11px] text-stone-400 truncate max-w-xs">{fran.name}</div>
                          </td>
                          <td className="px-4 py-3.5">
                            <div className="font-semibold text-stone-200">{fran.managerName}</div>
                            <div className="text-[10px] font-mono text-stone-500">{fran.managerPhone || fran.phone}</div>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-stone-900 border border-stone-800 text-amber-400 font-bold text-[11px]">
                              {fran.staffCount || fran.staffTeam?.length || 0} Staff
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center font-bold text-stone-200">
                            {fran.totalOrders || 0}
                          </td>
                          <td className="px-4 py-3.5 text-right font-bold text-amber-400 font-sans text-sm">
                            ₹{(fran.totalRevenue || 0).toLocaleString()}
                          </td>
                          <td className="px-4 py-3.5 text-right font-mono text-stone-300">
                            ₹{fran.avgOrderValue || (fran.totalOrders > 0 ? Math.round(fran.totalRevenue / fran.totalOrders) : 0)}
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold text-[11px]">
                              {fran.completionRate || (fran.totalOrders > 0 ? Math.round((fran.deliveredOrders / fran.totalOrders) * 100) : 100)}%
                            </span>
                          </td>
                          <td className="px-4 py-3.5 text-center">
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                              Operational
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </AnimatedContent>
          )}

          {/* Detailed Branch Analytics (Single Branch View for Manager, or selected breakdown) */}
          {activeReport && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Branch Profile & Operational Card */}
              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Store className="w-4 h-4 text-amber-400" />
                    <span>Branch Identity</span>
                  </h4>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {activeReport.city}
                  </span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Branch Title</span>
                    <p className="font-bold text-white text-sm mt-0.5">{activeReport.name}</p>
                  </div>

                  <div>
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Location Address</span>
                    <p className="text-stone-300 mt-0.5 flex items-start gap-1">
                      <MapPin className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                      <span>{activeReport.address || `${activeReport.city}, Gujarat`}</span>
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-stone-800/80">
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">General Manager</span>
                      <span className="font-bold text-white">{activeReport.managerName}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-stone-400 uppercase font-bold block">Seating Capacity</span>
                      <span className="font-bold text-amber-400">{activeReport.seatingCapacity || 120} Seats</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Payment Methods & Order Types Split */}
              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-brand-400" />
                    <span>Payment & Channel Split</span>
                  </h4>
                  <span className="text-[11px] font-mono text-stone-400">Audit</span>
                </div>

                <div className="space-y-3 text-xs">
                  <div>
                    <div className="flex justify-between font-semibold text-stone-300 mb-1">
                      <span className="flex items-center gap-1.5"><CreditCard className="w-3.5 h-3.5 text-emerald-400" /> Digital / UPI (Paid)</span>
                      <span className="font-bold text-white">{activeReport.paymentMethods?.online || Math.max(1, Math.round((activeReport.totalOrders || 10) * 0.75))} orders</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: '75%' }}></div>
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between font-semibold text-stone-300 mb-1">
                      <span className="flex items-center gap-1.5"><Banknote className="w-3.5 h-3.5 text-amber-400" /> Cash on Delivery (COD)</span>
                      <span className="font-bold text-white">{activeReport.paymentMethods?.cod || Math.max(0, Math.round((activeReport.totalOrders || 10) * 0.25))} orders</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-stone-900 overflow-hidden">
                      <div className="h-full bg-amber-500 rounded-full" style={{ width: '25%' }}></div>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-stone-800/80 space-y-1.5">
                    <span className="text-[10px] text-stone-400 uppercase font-bold block">Service Channels</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block text-[10px]">Delivery</span>
                        <span className="font-bold text-white">{activeReport.orderTypes?.delivery || Math.max(1, Math.round((activeReport.totalOrders || 10) * 0.6))}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block text-[10px]">Dine-In</span>
                        <span className="font-bold text-white">{activeReport.orderTypes?.dineIn || Math.max(0, Math.round((activeReport.totalOrders || 10) * 0.3))}</span>
                      </div>
                      <div className="p-2 rounded-xl bg-stone-900 border border-stone-800">
                        <span className="text-stone-400 block text-[10px]">Pickup</span>
                        <span className="font-bold text-white">{activeReport.orderTypes?.pickup || Math.max(0, Math.round((activeReport.totalOrders || 10) * 0.1))}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Top Selling Delicacies in this Branch */}
              <div className="p-6 rounded-3xl bg-stone-950 border border-stone-800 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <h4 className="text-base font-serif font-bold text-white flex items-center gap-2">
                    <Utensils className="w-4 h-4 text-orange-400" />
                    <span>Branch Popular Dishes</span>
                  </h4>
                  <span className="text-[10px] font-bold text-amber-400">Best Sellers</span>
                </div>

                <div className="space-y-2.5 text-xs">
                  {(activeReport.topDishes && activeReport.topDishes.length > 0 ? activeReport.topDishes : [
                    { name: 'Special Kathiyawadi Deluxe Thali', qty: 42 },
                    { name: 'Desi Ringan Olo & Bajra Rotlo', qty: 38 },
                    { name: 'Paneer Butter Masala & Garlic Naan', qty: 29 },
                    { name: 'Surti Undhiyu & Puri Combo', qty: 24 },
                    { name: 'Earthen Pot Masala Chaas', qty: 65 },
                  ]).map((dish, idx) => (
                    <div
                      key={idx}
                      className="p-2.5 rounded-xl bg-stone-900/80 border border-stone-800/80 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-5 h-5 rounded-md bg-stone-950 border border-stone-800 flex items-center justify-center font-mono font-bold text-[10px] text-amber-400">
                          #{idx + 1}
                        </span>
                        <span className="font-semibold text-stone-200 truncate">{dish.name}</span>
                      </div>
                      <span className="font-bold text-amber-400 font-mono shrink-0 ml-2">
                        {dish.qty} sold
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Interactive Custom PDF & CSV Report Generator Modal */}
      <ReportExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        user={user}
        isAdmin={isAdmin}
        branchCity={reportsData?.branchCity}
        preloadedData={reportsData}
      />
    </div>
  );
};

export default AdminReports;
