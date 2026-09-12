import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  Cloud,
  Database,
  Eye, 
  Filter, 
  History as HistoryIcon, 
  LogIn,
  Plus, 
  Search, 
  Trash2,
  Download,
  Upload,
  FileSpreadsheet
} from 'lucide-react';
import { FoodAnalysisResult, SpoilageRisk } from '../types';
import { useAuth } from '../context/AuthContext';

interface HistoryViewProps {
  scans: FoodAnalysisResult[];
  onSelectScan: (scan: FoodAnalysisResult) => void;
  onDeleteScan: (id: string) => void;
  onClearHistory: () => void;
  onNewScan: () => void;
  onRefreshHistory?: () => void;
}

export const HistoryView: React.FC<HistoryViewProps> = ({
  scans,
  onSelectScan,
  onDeleteScan,
  onClearHistory,
  onNewScan,
  onRefreshHistory,
}) => {
  const { user, signIn, firestoreConnected } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  const handleExportCSV = () => {
    if (scans.length === 0) return;
    const headers = ['Timestamp', 'Food Name', 'Category', 'Freshness Score', 'Status', 'Risk', 'Temperature (°C)', 'Duration (Days)', 'Storage Method', 'Recommendation'];
    const rows = scans.map((s) => [
      `"${s.timestamp}"`,
      `"${s.food_name.replace(/"/g, '""')}"`,
      `"${s.food_category}"`,
      s.freshness_score,
      `"${s.status}"`,
      `"${s.spoilage_risk}"`,
      s.storage_used.temperature,
      s.storage_used.duration,
      `"${s.storage_used.method}"`,
      `"${s.recommendation.replace(/"/g, '""')}"`,
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const link = document.createElement('a');
    link.setAttribute('href', encodeURI(csvContent));
    link.setAttribute('download', `foodfresh_history_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleExportJSON = () => {
    if (scans.length === 0) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(scans, null, 2));
    const link = document.createElement('a');
    link.setAttribute('href', jsonStr);
    link.setAttribute('download', `foodfresh_scans_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        const scanItems = Array.isArray(parsed) ? parsed : parsed.scans || parsed.items;
        if (!Array.isArray(scanItems)) {
          alert('Invalid format: File should contain a JSON array of scans.');
          return;
        }

        const res = await fetch('/api/history/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ scans: scanItems }),
        });
        const data = await res.json();
        if (data.success) {
          if (onRefreshHistory) {
            onRefreshHistory();
          } else {
            window.location.reload();
          }
          alert(`Successfully imported ${data.count} scan records!`);
        }
      } catch (err) {
        alert('Could not parse JSON file. Please verify valid JSON syntax.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  // Filtered scans
  const filteredScans = scans.filter((s) => {
    const matchesSearch =
      s.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.food_category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesRisk = riskFilter === 'All' || s.spoilage_risk === riskFilter;
    const matchesCategory = categoryFilter === 'All' || s.food_category === categoryFilter;
    return matchesSearch && matchesRisk && matchesCategory;
  });

  const getScoreBadge = (score: number) => {
    if (score >= 80) return 'bg-emerald-50 text-emerald-800 border-emerald-200';
    if (score >= 60) return 'bg-teal-50 text-teal-800 border-teal-200';
    if (score >= 40) return 'bg-amber-50 text-amber-800 border-amber-200';
    if (score >= 20) return 'bg-orange-50 text-orange-800 border-orange-200';
    return 'bg-rose-50 text-rose-800 border-rose-200';
  };

  const getRiskBadge = (risk: SpoilageRisk) => {
    switch (risk) {
      case 'Low':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Medium':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'High':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'Critical':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700">
              <HistoryIcon className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Scan History Log
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Review past food scans, freshness trajectories, and safety recommendations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {scans.length > 0 && (
            <>
              <button
                id="export-history-csv-btn"
                onClick={handleExportCSV}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Download history as CSV spreadsheet"
              >
                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                <span>Export CSV</span>
              </button>

              <button
                id="export-history-json-btn"
                onClick={handleExportJSON}
                className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
                title="Download history as JSON"
              >
                <Download className="w-3.5 h-3.5 text-stone-500" />
                <span>Export JSON</span>
              </button>
            </>
          )}

          <label
            id="import-history-json-btn"
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Import past scans from a JSON backup"
          >
            <Upload className="w-3.5 h-3.5 text-stone-500" />
            <span>Import JSON</span>
            <input
              type="file"
              accept=".json,application/json"
              onChange={handleImportJSON}
              className="hidden"
            />
          </label>

          {scans.length > 0 && (
            <button
              id="clear-all-history-btn"
              onClick={() => {
                if (window.confirm('Are you sure you want to clear all scan history records?')) {
                  onClearHistory();
                }
              }}
              className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Clear Log</span>
            </button>
          )}

          <button
            id="history-new-scan-btn"
            onClick={onNewScan}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Input New Food</span>
          </button>
        </div>
      </div>

      {/* Cloud Firestore Persistence Banner */}
      <div className={`p-3.5 rounded-2xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs ${
        user 
          ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900'
          : 'bg-stone-50 border-stone-200 text-stone-700'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-7 h-7 rounded-lg flex items-center justify-center ${
            user ? 'bg-emerald-600 text-white shadow-xs' : 'bg-stone-200 text-stone-600'
          }`}>
            <Database className="w-4 h-4" />
          </div>
          <div>
            <div className="font-semibold flex items-center gap-1.5">
              <span>{user ? 'Cloud Firestore Sync Active' : 'Persistent Cloud Storage Available'}</span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            </div>
            <p className="text-[11px] text-stone-500">
              {user 
                ? `Scans and application records are securely persisted to Firestore for ${user.email}.`
                : 'Scans are currently kept locally. Sign in with Google to persistently store your records in Firebase Firestore across all devices.'
              }
            </p>
          </div>
        </div>

        {!user && (
          <button
            id="history-signin-firestore-btn"
            onClick={() => signIn()}
            className="px-3 py-1.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-medium text-xs flex items-center gap-1.5 shrink-0 transition-colors shadow-xs cursor-pointer"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-400" />
            <span>Sign In to Persist to Cloud</span>
          </button>
        )}
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-xs flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-2.5" />
          <input
            type="text"
            id="history-search-input"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by food name or category (e.g. Tomato, Salmon, Bread)..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 text-xs text-stone-500 shrink-0">
            <Filter className="w-3.5 h-3.5" />
            <span>Risk:</span>
          </div>
          <select
            id="history-risk-filter"
            value={riskFilter}
            onChange={(e) => setRiskFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Risks</option>
            <option value="Low">Low Risk</option>
            <option value="Medium">Medium Risk</option>
            <option value="High">High Risk</option>
            <option value="Critical">Critical Risk</option>
          </select>

          <select
            id="history-category-filter"
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-xl px-2.5 py-2 font-medium text-stone-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="All">All Categories</option>
            <option value="Fruits">Fruits</option>
            <option value="Vegetables">Vegetables</option>
            <option value="Meat">Meat</option>
            <option value="Fish">Fish</option>
            <option value="Dairy">Dairy</option>
            <option value="Bakery">Bakery</option>
            <option value="Cooked Food">Cooked Food</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* History Table & Cards */}
      {filteredScans.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center shadow-xs">
          <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-3">
            <HistoryIcon className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-bold text-stone-800">No scan records found</h3>
          <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
            {scans.length === 0
              ? 'Start by analyzing your first food product with camera or photo upload.'
              : 'No scans match your active search or filter criteria.'}
          </p>
          <button
            onClick={onNewScan}
            className="mt-4 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            Scan Food Now
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-xs overflow-hidden">
          {/* Desktop Table View */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                <tr>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Food</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Score</th>
                  <th className="py-3.5 px-4">Risk</th>
                  <th className="py-3.5 px-4">Recommendation</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filteredScans.map((scan) => {
                  const d = new Date(scan.timestamp);
                  const dateLabel = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
                  return (
                    <tr 
                      key={scan.id} 
                      className="hover:bg-stone-50/70 transition-colors group cursor-pointer"
                      onClick={() => onSelectScan(scan)}
                    >
                      <td className="py-3.5 px-4 text-stone-500 font-mono">
                        {dateLabel}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {scan.image_thumbnail ? (
                            <img
                              src={scan.image_thumbnail}
                              alt={scan.food_name}
                              className="w-8 h-8 rounded-lg object-cover border border-stone-200 bg-stone-100 shrink-0"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                              {scan.food_name.charAt(0)}
                            </div>
                          )}
                          <span className="font-bold text-stone-900 group-hover:text-emerald-700 transition-colors">
                            {scan.food_name}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600">
                        {scan.food_category}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2.5 py-1 rounded-md font-mono font-bold text-xs border ${getScoreBadge(scan.freshness_score)}`}>
                          {scan.freshness_score}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getRiskBadge(scan.spoilage_risk)}`}>
                          {scan.spoilage_risk}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-stone-600 max-w-xs truncate">
                        {scan.recommendation}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => onSelectScan(scan)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors"
                            title="View Full Report"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            id={`delete-scan-${scan.id}`}
                            onClick={() => onDeleteScan(scan.id)}
                            className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                            title="Delete Record"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Cards View */}
          <div className="md:hidden divide-y divide-stone-100">
            {filteredScans.map((scan) => {
              const d = new Date(scan.timestamp);
              const dateLabel = d.toLocaleDateString(undefined, { day: '2-digit', month: 'short' });
              return (
                <div
                  key={scan.id}
                  onClick={() => onSelectScan(scan)}
                  className="p-4 hover:bg-stone-50 transition-colors cursor-pointer space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-stone-400">{dateLabel}</span>
                      <span className="text-[11px] font-semibold text-stone-500 uppercase">
                        {scan.food_category}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onDeleteScan(scan.id)}
                        className="p-1.5 text-stone-400 hover:text-rose-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      {scan.image_thumbnail && (
                        <img
                          src={scan.image_thumbnail}
                          alt={scan.food_name}
                          className="w-10 h-10 rounded-lg object-cover border border-stone-200"
                        />
                      )}
                      <div>
                        <h4 className="font-bold text-stone-900 text-sm">{scan.food_name}</h4>
                        <span className="text-[11px] text-stone-500">
                          {scan.estimated_remaining_days} remaining
                        </span>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-1">
                      <span className={`px-2 py-0.5 rounded font-mono font-bold text-xs border ${getScoreBadge(scan.freshness_score)}`}>
                        {scan.freshness_score}/100
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold border ${getRiskBadge(scan.spoilage_risk)}`}>
                        {scan.spoilage_risk}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-stone-600 line-clamp-2 bg-stone-50 p-2 rounded-lg">
                    {scan.recommendation}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
