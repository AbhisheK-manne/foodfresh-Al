import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  CheckCircle2, 
  Database, 
  Download, 
  Eye, 
  Filter, 
  Layers, 
  Play, 
  Plus, 
  RotateCcw, 
  Search, 
  Sparkles, 
  Tag, 
  Trash2, 
  Upload, 
  X 
} from 'lucide-react';
import { DatasetItem, ModelEvaluationStats, FoodCategory, FreshnessLabel } from '../types';

interface DatasetBenchmarkViewProps {
  onRunTestSample?: (item: DatasetItem) => void;
}

export const DatasetBenchmarkView: React.FC<DatasetBenchmarkViewProps> = ({
  onRunTestSample,
}) => {
  const [dataset, setDataset] = useState<DatasetItem[]>([]);
  const [evaluation, setEvaluation] = useState<ModelEvaluationStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [labelFilter, setLabelFilter] = useState<string>('All');
  const [showAddModal, setShowAddModal] = useState(false);

  // New item form state
  const [newFoodName, setNewFoodName] = useState('');
  const [newCategory, setNewCategory] = useState<FoodCategory>('Fruits');
  const [newFreshnessLabel, setNewFreshnessLabel] = useState<FreshnessLabel>('Fresh');
  const [newTemp, setNewTemp] = useState<number>(4);
  const [newDuration, setNewDuration] = useState<number>(2);
  const [newMethod, setNewMethod] = useState<'Refrigerator' | 'Freezer' | 'Room Temperature' | 'Open Environment'>('Refrigerator');
  const [newSmell, setNewSmell] = useState(false);
  const [newSlimy, setNewSlimy] = useState(false);
  const [newMold, setNewMold] = useState(false);
  const [newColor, setNewColor] = useState(false);
  const [newNotes, setNewNotes] = useState('');
  const [newImage, setNewImage] = useState<string>('');

  useEffect(() => {
    fetchDatasetAndEval();
  }, []);

  const fetchDatasetAndEval = async () => {
    try {
      setIsLoading(true);
      const [resData, resEval] = await Promise.all([
        fetch('/api/dataset').then((r) => r.json()),
        fetch('/api/dataset/evaluation').then((r) => r.json()),
      ]);
      setDataset(resData.dataset || []);
      setEvaluation(resEval);
    } catch (err) {
      console.error('Failed to load dataset:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunEvaluation = async () => {
    setIsEvaluating(true);
    try {
      const res = await fetch('/api/dataset/evaluate', { method: 'POST' });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to run benchmark:', err);
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleResetEvaluation = async () => {
    try {
      const res = await fetch('/api/dataset/reset-evaluation', { method: 'POST' });
      const data = await res.json();
      setEvaluation(data);
    } catch (err) {
      console.error('Failed to reset evaluation:', err);
    }
  };

  const handleDeleteItem = async (id: string) => {
    if (!window.confirm('Delete this ground truth sample?')) return;
    try {
      await fetch(`/api/dataset/${id}`, { method: 'DELETE' });
      setDataset((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error('Failed to delete item:', err);
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFoodName.trim()) return;

    const indicators: string[] = [];
    if (newMold) indicators.push('visible_mold');
    if (newSmell) indicators.push('unusual_smell');
    if (newSlimy) indicators.push('slimy_texture');
    if (newColor) indicators.push('color_change');

    const payload = {
      food_name: newFoodName.trim(),
      food_category: newCategory,
      freshness_label: newFreshnessLabel,
      storage_temperature: newTemp,
      storage_duration: newDuration,
      storage_method: newMethod,
      spoilage_indicators: indicators,
      confirmed_ground_truth: newFreshnessLabel,
      expert_notes: newNotes.trim() || 'Laboratory visual inspection verification.',
      image_thumbnail: newImage || undefined,
    };

    try {
      const res = await fetch('/api/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.item) {
        setDataset((prev) => [data.item, ...prev]);
        setShowAddModal(false);
        // Reset inputs
        setNewFoodName('');
        setNewNotes('');
        setNewImage('');
      }
    } catch (err) {
      console.error('Failed to create sample:', err);
    }
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(dataset, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `foodfresh_dataset_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (ev) => {
      try {
        const text = ev.target?.result as string;
        const parsed = JSON.parse(text);
        const items = Array.isArray(parsed) ? parsed : parsed.dataset || parsed.items;
        if (!Array.isArray(items)) {
          alert('Invalid format: File should contain a JSON array of dataset items.');
          return;
        }

        const res = await fetch('/api/dataset/import', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items }),
        });
        const data = await res.json();
        if (data.success) {
          fetchDatasetAndEval();
          alert(`Successfully imported ${data.count} custom dataset items!`);
        }
      } catch (err) {
        alert('Could not parse JSON file. Please verify valid JSON syntax.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filteredDataset = dataset.filter((item) => {
    const matchesSearch =
      item.food_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.food_category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.expert_notes.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesLabel = labelFilter === 'All' || item.freshness_label === labelFilter;
    return matchesSearch && matchesLabel;
  });

  const getLabelBadge = (label: FreshnessLabel) => {
    switch (label) {
      case 'Fresh':
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
      case 'Slightly deteriorated':
        return 'bg-amber-100 text-amber-800 border-amber-300';
      case 'Spoiled':
        return 'bg-rose-100 text-rose-800 border-rose-300';
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
              <Database className="w-4 h-4" />
            </div>
            <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
              Dataset & Model Evaluation System
            </h1>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Ground-truth training/test samples, cross-validation metrics, and multi-class confusion matrix.
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <label
            id="import-dataset-btn"
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            title="Import custom dataset items from JSON file"
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

          <button
            id="export-dataset-btn"
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded-xl border border-stone-200 text-stone-700 hover:bg-stone-50 text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-stone-500" />
            <span>Export JSON</span>
          </button>

          <button
            id="add-dataset-sample-btn"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Labeled Sample</span>
          </button>
        </div>
      </div>

      {/* Model Training & Evaluation Section (Item 8 Requirement) */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-stone-100">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-stone-900">
                Model Performance & Validation Benchmark
              </h2>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200">
                3-Class Classification
              </span>
            </div>
            <p className="text-xs text-stone-500 mt-0.5">
              Evaluated against laboratory-confirmed ground truth records: Fresh vs Slightly Deteriorated vs Spoiled.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {evaluation?.status === 'evaluated' && (
              <button
                id="reset-eval-btn"
                onClick={handleResetEvaluation}
                className="text-xs font-medium text-stone-500 hover:text-stone-800 flex items-center gap-1 underline mr-2"
              >
                <RotateCcw className="w-3 h-3" />
                Reset Evaluation
              </button>
            )}

            <button
              id="run-benchmark-btn"
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold flex items-center gap-2 shadow-xs transition-colors disabled:opacity-60"
            >
              {isEvaluating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Running Benchmark...</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>{evaluation?.status === 'evaluated' ? 'Re-run Evaluation' : 'Run Benchmark Evaluation'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Not Evaluated Yet State or Real Calculated Metrics */}
        {evaluation?.status === 'not_evaluated' ? (
          <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300">
            <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-stone-900">
              Not evaluated yet
            </h3>
            <p className="text-xs text-stone-500 mt-1 max-w-md mx-auto">
              Per requirements, statistical metrics are withheld until you run the validation benchmark against verified test samples. Click below to execute the scoring engine across the test cohort.
            </p>
            <button
              onClick={handleRunEvaluation}
              disabled={isEvaluating}
              className="mt-4 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold shadow-xs transition-colors inline-flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Execute Evaluation Suite
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* 4 Core Scientific KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Accuracy
                </span>
                <span className="text-3xl font-black text-emerald-600 font-mono">
                  {evaluation?.accuracy !== null ? `${((evaluation?.accuracy || 0) * 100).toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Overall test cohort match
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Precision (Macro)
                </span>
                <span className="text-3xl font-black text-indigo-600 font-mono">
                  {evaluation?.precision !== null ? `${((evaluation?.precision || 0) * 100).toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Low false-positive rate
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  Recall (Sensitivity)
                </span>
                <span className="text-3xl font-black text-sky-600 font-mono">
                  {evaluation?.recall !== null ? `${((evaluation?.recall || 0) * 100).toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Spoilage safety capture
                </span>
              </div>

              <div className="p-4 rounded-xl bg-stone-50 border border-stone-200">
                <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-1">
                  F1-Score
                </span>
                <span className="text-3xl font-black text-purple-600 font-mono">
                  {evaluation?.f1_score !== null ? `${((evaluation?.f1_score || 0) * 100).toFixed(1)}%` : 'N/A'}
                </span>
                <span className="text-[11px] text-stone-500 block mt-1">
                  Harmonic precision-recall mean
                </span>
              </div>
            </div>

            {/* Evaluation Cohort Stats */}
            <div className="flex flex-wrap items-center justify-between gap-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-950">
              <div className="flex items-center gap-4">
                <span>
                  <strong>Total Dataset:</strong> {evaluation?.total_samples} samples
                </span>
                <span>
                  <strong>Training Set:</strong> {evaluation?.train_samples} records
                </span>
                <span>
                  <strong>Testing / Benchmark Set:</strong> {evaluation?.test_samples} records
                </span>
              </div>
              <span className="text-[11px] text-indigo-800">
                Evaluated: {evaluation?.last_evaluated_at ? new Date(evaluation.last_evaluated_at).toLocaleTimeString() : 'Recent'}
              </span>
            </div>

            {/* Multi-Class Confusion Matrix (3x3) */}
            {evaluation?.confusion_matrix?.matrix && (
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-stone-800 uppercase tracking-wider">
                  3×3 Multi-Class Confusion Matrix
                </h4>
                <p className="text-[11px] text-stone-500">
                  Rows represent actual ground-truth classes; columns represent model predictions.
                </p>

                <div className="overflow-x-auto border border-stone-200 rounded-xl">
                  <table className="w-full text-xs text-center">
                    <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold">
                      <tr>
                        <th className="p-3 text-left bg-stone-100 border-r border-stone-200 font-bold">
                          Actual \ Predicted
                        </th>
                        <th className="p-3">Predicted: Fresh</th>
                        <th className="p-3">Predicted: Deteriorating</th>
                        <th className="p-3">Predicted: Spoiled</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {/* Actual Fresh */}
                      <tr>
                        <td className="p-3 text-left font-semibold text-stone-800 bg-stone-50 border-r border-stone-200">
                          Actual Fresh
                        </td>
                        <td className="p-3 font-mono font-bold bg-emerald-50 text-emerald-800">
                          {evaluation.confusion_matrix.matrix[0][0]} (Correct)
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {evaluation.confusion_matrix.matrix[0][1]}
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {evaluation.confusion_matrix.matrix[0][2]}
                        </td>
                      </tr>

                      {/* Actual Deteriorating */}
                      <tr>
                        <td className="p-3 text-left font-semibold text-stone-800 bg-stone-50 border-r border-stone-200">
                          Actual Slightly Deteriorated
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {evaluation.confusion_matrix.matrix[1][0]}
                        </td>
                        <td className="p-3 font-mono font-bold bg-amber-50 text-amber-800">
                          {evaluation.confusion_matrix.matrix[1][1]} (Correct)
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {evaluation.confusion_matrix.matrix[1][2]}
                        </td>
                      </tr>

                      {/* Actual Spoiled */}
                      <tr>
                        <td className="p-3 text-left font-semibold text-stone-800 bg-stone-50 border-r border-stone-200">
                          Actual Spoiled
                        </td>
                        <td className="p-3 font-mono text-rose-600 font-medium">
                          {evaluation.confusion_matrix.matrix[2][0]}
                        </td>
                        <td className="p-3 font-mono text-stone-500">
                          {evaluation.confusion_matrix.matrix[2][1]}
                        </td>
                        <td className="p-3 font-mono font-bold bg-rose-50 text-rose-800">
                          {evaluation.confusion_matrix.matrix[2][2]} (Correct)
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Dataset Table Section */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-stone-900">
              Internal Food Freshness Dataset ({dataset.length} Samples)
            </h3>
            <p className="text-xs text-stone-500">
              Labeled reference data storing image, storage telemetry, physical indicators, and verified ground-truth.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-stone-400 absolute left-2.5 top-2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search food or notes..."
                className="pl-8 pr-3 py-1.5 text-xs bg-stone-50 border border-stone-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <select
              value={labelFilter}
              onChange={(e) => setLabelFilter(e.target.value)}
              className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2 py-1.5 font-medium text-stone-700"
            >
              <option value="All">All Labels</option>
              <option value="Fresh">Fresh</option>
              <option value="Slightly deteriorated">Slightly deteriorated</option>
              <option value="Spoiled">Spoiled</option>
            </select>
          </div>
        </div>

        {/* Dataset Table */}
        <div className="overflow-x-auto border border-stone-200 rounded-xl">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
              <tr>
                <th className="py-3 px-4">Sample / Food</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Freshness Label</th>
                <th className="py-3 px-4">Storage Info</th>
                <th className="py-3 px-4">Spoilage Indicators</th>
                <th className="py-3 px-4">Confirmed Ground Truth & Notes</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {filteredDataset.map((item) => (
                <tr key={item.id} className="hover:bg-stone-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      {item.image_thumbnail ? (
                        <img
                          src={item.image_thumbnail}
                          alt={item.food_name}
                          className="w-9 h-9 rounded-lg object-cover border border-stone-200 bg-stone-100 shrink-0"
                        />
                      ) : (
                        <div className="w-9 h-9 rounded-lg bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-xs shrink-0">
                          {item.food_name.charAt(0)}
                        </div>
                      )}
                      <div>
                        <span className="font-bold text-stone-900 block">{item.food_name}</span>
                        <span className="text-[10px] text-stone-400 font-mono">{item.id}</span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-medium">
                    {item.food_category}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold border ${getLabelBadge(item.freshness_label)}`}>
                      {item.freshness_label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-stone-600 font-mono">
                    <div>{item.storage_temperature}°C / {item.storage_duration}d</div>
                    <div className="text-[10px] text-stone-400 font-sans">{item.storage_method}</div>
                  </td>
                  <td className="py-3 px-4">
                    {item.spoilage_indicators.length > 0 ? (
                      <div className="flex flex-wrap gap-1">
                        {item.spoilage_indicators.map((ind, i) => (
                          <span
                            key={i}
                            className="px-1.5 py-0.2 rounded text-[10px] font-medium bg-rose-50 text-rose-700 border border-rose-200"
                          >
                            {ind.replace('_', ' ')}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[11px] text-stone-400">None</span>
                    )}
                  </td>
                  <td className="py-3 px-4 max-w-xs">
                    <span className="font-bold text-stone-800 text-[11px] block">
                      Confirmed: {item.confirmed_ground_truth}
                    </span>
                    <p className="text-[11px] text-stone-500 truncate">
                      {item.expert_notes}
                    </p>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onRunTestSample && (
                        <button
                          onClick={() => onRunTestSample(item)}
                          className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors"
                          title="Run Sample Through Freshness Scanner"
                        >
                          <Play className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        title="Delete Sample"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Sample Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl border border-stone-200 shadow-2xl max-w-lg w-full p-6 space-y-4 my-8">
            <div className="flex items-center justify-between pb-3 border-b border-stone-200">
              <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5">
                <Plus className="w-4 h-4 text-indigo-600" />
                Add Labeled Dataset Sample
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="p-1 text-stone-400 hover:text-stone-700"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateItem} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-stone-700 block mb-1">Food Name *</label>
                <input
                  type="text"
                  value={newFoodName}
                  onChange={(e) => setNewFoodName(e.target.value)}
                  placeholder="e.g. Bartlett Pear, Atlantic Cod, Greek Yogurt"
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-stone-700 block mb-1">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as FoodCategory)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl"
                  >
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

                <div>
                  <label className="font-bold text-stone-700 block mb-1">Ground Truth Label</label>
                  <select
                    value={newFreshnessLabel}
                    onChange={(e) => setNewFreshnessLabel(e.target.value as FreshnessLabel)}
                    className="w-full px-2.5 py-2 bg-stone-50 border border-stone-300 rounded-xl font-bold"
                  >
                    <option value="Fresh">Fresh</option>
                    <option value="Slightly deteriorated">Slightly deteriorated</option>
                    <option value="Spoiled">Spoiled</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="font-medium text-stone-700 block mb-1">Temp (°C)</label>
                  <input
                    type="number"
                    value={newTemp}
                    onChange={(e) => setNewTemp(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 block mb-1">Days Stored</label>
                  <input
                    type="number"
                    value={newDuration}
                    onChange={(e) => setNewDuration(parseInt(e.target.value, 10))}
                    className="w-full px-2.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="font-medium text-stone-700 block mb-1">Method</label>
                  <select
                    value={newMethod}
                    onChange={(e) => setNewMethod(e.target.value as any)}
                    className="w-full px-1.5 py-1.5 bg-stone-50 border border-stone-300 rounded-xl"
                  >
                    <option value="Refrigerator">Fridge</option>
                    <option value="Freezer">Freezer</option>
                    <option value="Room Temperature">Room</option>
                    <option value="Open Environment">Open</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-stone-700 block mb-1.5">Spoilage Indicators</label>
                <div className="grid grid-cols-2 gap-2">
                  <label className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={newMold}
                      onChange={(e) => setNewMold(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>Visible Mold</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={newSmell}
                      onChange={(e) => setNewSmell(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>Unusual Smell</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={newSlimy}
                      onChange={(e) => setNewSlimy(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>Slimy Texture</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 border border-stone-200 rounded-lg cursor-pointer hover:bg-stone-50">
                    <input
                      type="checkbox"
                      checked={newColor}
                      onChange={(e) => setNewColor(e.target.checked)}
                      className="rounded accent-indigo-600"
                    />
                    <span>Color Change</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="font-medium text-stone-700 block mb-1">
                  Expert Verification Notes
                </label>
                <textarea
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
                  placeholder="e.g. Lab confirmed aerobic plate count within acceptable range; no enterotoxins detected."
                  rows={2}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold shadow-xs"
                >
                  Save Sample
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
