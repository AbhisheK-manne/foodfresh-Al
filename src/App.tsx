import React, { useState, useEffect } from 'react';
import { Header, NavTab } from './components/Header';
import { HomeView } from './components/HomeView';
import { ScanForm } from './components/ScanForm';
import { ResultView } from './components/ResultView';
import { HistoryView } from './components/HistoryView';
import { DashboardView } from './components/DashboardView';
import { DatasetBenchmarkView } from './components/DatasetBenchmarkView';
import { AboutView } from './components/AboutView';
import { CameraCaptureModal } from './components/CameraCaptureModal';
import { DemoPickerModal } from './components/DemoPickerModal';
import { LoadingAnalysis } from './components/LoadingAnalysis';
import { FoodAnalysisRequest, FoodAnalysisResult, ScoreWeights, DatasetItem } from './types';
import { DemoPreset } from './data/demoPresets';
import { useAuth } from './context/AuthContext';
import { 
  subscribeUserScans, 
  saveScanToFirestore, 
  deleteScanFromFirestore, 
  clearAllUserScans, 
  addDatasetItemToFirestore 
} from './firebase';

export default function App() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  const [currentResult, setCurrentResult] = useState<FoodAnalysisResult | null>(null);
  const [lastRequest, setLastRequest] = useState<FoodAnalysisRequest | null>(null);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [pendingFoodName, setPendingFoodName] = useState('Food Item');
  const [scanHistory, setScanHistory] = useState<FoodAnalysisResult[]>([]);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isDemoPickerOpen, setIsDemoPickerOpen] = useState(false);
  const [scanFormPrefill, setScanFormPrefill] = useState<Partial<FoodAnalysisRequest> | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Synchronize scan history: listen to Firestore when logged in, or fetch from API when guest
  useEffect(() => {
    if (!user) {
      fetchHistory();
      return;
    }

    // Subscribe in real-time to persistent Firestore scans
    const unsubscribe = subscribeUserScans(
      user.uid,
      (firestoreScans) => {
        if (firestoreScans && firestoreScans.length > 0) {
          setScanHistory(firestoreScans);
        } else if (scanHistory.length > 0) {
          // Seed existing scans to newly authenticated user's Firestore store
          scanHistory.forEach((scan) => {
            saveScanToFirestore(user.uid, scan).catch(() => {});
          });
        }
      },
      (err) => {
        console.warn('Firestore subscription fallback:', err);
        fetchHistory();
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/history');
      if (res.ok) {
        const data = await res.json();
        setScanHistory(data.scans || []);
      }
    } catch (err) {
      console.warn('Could not fetch history:', err);
    }
  };

  const handleScanSubmit = async (request: FoodAnalysisRequest) => {
    setIsLoadingAnalysis(true);
    setPendingFoodName(request.food_name);
    setLastRequest(request);

    try {
      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const result: FoodAnalysisResult = await response.json();
      setCurrentResult(result);

      // Persist to Cloud Firestore if authenticated
      if (user) {
        try {
          await saveScanToFirestore(user.uid, result);
          showToast(`Freshness analysis ready & stored in Firestore for ${result.food_name}`);
        } catch (dbErr) {
          console.error('Failed to save scan to Firestore:', dbErr);
          setScanHistory((prev) => [result, ...prev]);
          showToast(`Analysis ready for ${result.food_name}`);
        }
      } else {
        setScanHistory((prev) => [result, ...prev]);
        showToast(`Freshness analysis ready for ${result.food_name}`);
      }

      setActiveTab('result');
    } catch (err) {
      console.error('Analysis failed:', err);
      showToast('Error during freshness analysis. Please retry.');
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleRecalculateWithWeights = async (newWeights: ScoreWeights) => {
    if (!lastRequest) return;
    setIsLoadingAnalysis(true);

    try {
      const updatedReq: FoodAnalysisRequest = {
        ...lastRequest,
        custom_weights: newWeights,
      };

      const response = await fetch('/api/analyze-food', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedReq),
      });

      if (response.ok) {
        const result: FoodAnalysisResult = await response.json();
        setCurrentResult(result);
        setLastRequest(updatedReq);
        showToast('Freshness score recomputed with custom weights!');
      }
    } catch (err) {
      console.error('Failed to recalculate weights:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  };

  const handleSelectPreset = (preset: DemoPreset) => {
    setScanFormPrefill({
      ...preset.request,
      image: preset.sampleImageSvg,
    });
    setActiveTab('scan');
    showToast(`Loaded preset: ${preset.title}`);
  };

  const handleCameraCapture = (base64Image: string) => {
    setScanFormPrefill((prev) => ({
      ...prev,
      image: base64Image,
    }));
    setActiveTab('scan');
    showToast('Camera photo captured and attached to scan form');
  };

  const handleDeleteScan = async (id: string) => {
    try {
      if (user) {
        await deleteScanFromFirestore(user.uid, id).catch((e) => console.warn('Firestore delete error:', e));
      }
      await fetch(`/api/history/${id}`, { method: 'DELETE' }).catch(() => {});
      setScanHistory((prev) => prev.filter((s) => s.id !== id));
      if (currentResult?.id === id) {
        setCurrentResult(null);
      }
      showToast('Scan record deleted from persistent store');
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  const handleClearHistory = async () => {
    try {
      if (user) {
        await clearAllUserScans(user.uid).catch((e) => console.warn('Firestore clear error:', e));
      }
      await fetch('/api/history', { method: 'DELETE' }).catch(() => {});
      setScanHistory([]);
      setCurrentResult(null);
      showToast('Scan log history cleared from persistent database');
    } catch (err) {
      console.error('Clear failed:', err);
    }
  };

  const handleSaveToDataset = async (result: FoodAnalysisResult) => {
    try {
      let freshnessLabel: 'Fresh' | 'Slightly deteriorated' | 'Spoiled' = 'Fresh';
      if (result.status === 'Likely Spoiled' || result.status === 'High Spoilage Risk') {
        freshnessLabel = 'Spoiled';
      } else if (result.status === 'Aging / Use Soon') {
        freshnessLabel = 'Slightly deteriorated';
      }

      const payload = {
        food_name: result.food_name,
        food_category: result.food_category,
        freshness_label: freshnessLabel,
        storage_temperature: result.storage_used.temperature,
        storage_duration: result.storage_used.duration,
        storage_method: result.storage_used.method,
        spoilage_indicators: result.detected_indicators,
        split: 'train' as const,
        source: 'user_contributed' as const,
        notes: `Contributed from scan ${result.id.slice(0, 8)} (${result.status}, score ${result.freshness_score})`,
        image_thumbnail: result.image_thumbnail,
      };

      if (user) {
        await addDatasetItemToFirestore(user.uid, payload).catch((e) => console.warn('Firestore dataset save error:', e));
      }
      await fetch('/api/dataset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }).catch(() => {});

      showToast('Scan contributed to internal ground-truth dataset in Firestore!');
    } catch (err) {
      console.error('Failed to contribute to dataset:', err);
    }
  };

  const handleRunTestSample = (item: DatasetItem) => {
    setScanFormPrefill({
      food_name: item.food_name,
      food_category: item.food_category,
      storage_temperature: item.storage_temperature,
      storage_duration: item.storage_duration,
      storage_method: item.storage_method as any,
      image: item.image || item.image_thumbnail,
      observations: {
        unusual_smell: item.spoilage_indicators.includes('unusual_smell'),
        slimy_texture: item.spoilage_indicators.includes('slimy_texture'),
        visible_mold: item.spoilage_indicators.includes('visible_mold'),
        color_change: item.spoilage_indicators.includes('color_change'),
      }
    });
    setActiveTab('scan');
    showToast(`Loaded dataset sample: ${item.food_name}`);
  };

  return (
    <div className="min-h-screen bg-stone-100/60 text-stone-900 flex flex-col font-sans selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-stone-900 text-white px-4 py-2.5 rounded-xl shadow-lg text-xs font-medium border border-stone-700 animate-in fade-in slide-in-from-bottom-2">
          {toastMessage}
        </div>
      )}

      {/* Global Header */}
      <Header
        activeTab={activeTab}
        onSelectTab={setActiveTab}
        hasCurrentResult={Boolean(currentResult)}
        onOpenDemoPicker={() => setIsDemoPickerOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoadingAnalysis ? (
          <LoadingAnalysis foodName={pendingFoodName} />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeView
                onStartScan={() => {
                  setScanFormPrefill(null);
                  setActiveTab('scan');
                }}
                onOpenDemoPicker={() => setIsDemoPickerOpen(true)}
                onSelectPreset={handleSelectPreset}
              />
            )}

            {activeTab === 'scan' && (
              <ScanForm
                key={scanFormPrefill ? JSON.stringify(scanFormPrefill) : 'fresh-scan-form'}
                onSubmit={handleScanSubmit}
                onOpenCamera={() => setIsCameraOpen(true)}
                isLoading={isLoadingAnalysis}
                initialValues={scanFormPrefill || undefined}
                onSelectDemoPreset={() => setIsDemoPickerOpen(true)}
              />
            )}

            {activeTab === 'result' && (
              currentResult ? (
                <ResultView
                  result={currentResult}
                  onScanAnother={() => {
                    setScanFormPrefill(null);
                    setActiveTab('scan');
                  }}
                  onRecalculateWithWeights={handleRecalculateWithWeights}
                  onSaveToDataset={handleSaveToDataset}
                />
              ) : (
                <div className="text-center py-16">
                  <p className="text-sm text-stone-500 mb-4">No analysis completed yet.</p>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                  >
                    Go to Food Scanner
                  </button>
                </div>
              )
            )}

            {activeTab === 'history' && (
              <HistoryView
                scans={scanHistory}
                onSelectScan={(scan) => {
                  setCurrentResult(scan);
                  setLastRequest({
                    food_name: scan.food_name,
                    food_category: scan.food_category,
                    storage_temperature: scan.storage_used.temperature,
                    storage_duration: scan.storage_used.duration,
                    storage_method: scan.storage_used.method,
                    storage_packaging: scan.storage_used.packaging as any,
                    custom_notes: scan.storage_used.custom_notes,
                    observations: scan.storage_used.observations,
                    image: scan.image_thumbnail,
                  });
                  setActiveTab('result');
                }}
                onDeleteScan={handleDeleteScan}
                onClearHistory={handleClearHistory}
                onRefreshHistory={fetchHistory}
                onNewScan={() => {
                  setScanFormPrefill(null);
                  setActiveTab('scan');
                }}
              />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView
                scans={scanHistory}
                onNewScan={() => {
                  setScanFormPrefill(null);
                  setActiveTab('scan');
                }}
              />
            )}

            {activeTab === 'dataset' && (
              <DatasetBenchmarkView
                onRunTestSample={handleRunTestSample}
              />
            )}

            {activeTab === 'about' && (
              <AboutView />
            )}
          </>
        )}
      </main>

      {/* Camera Capture Modal */}
      <CameraCaptureModal
        isOpen={isCameraOpen}
        onClose={() => setIsCameraOpen(false)}
        onCapture={handleCameraCapture}
      />

      {/* Prototype Demo Presets Modal */}
      <DemoPickerModal
        isOpen={isDemoPickerOpen}
        onClose={() => setIsDemoPickerOpen(false)}
        onSelectPreset={handleSelectPreset}
      />

      {/* Global Footer */}
      <footer className="border-t border-stone-200 bg-white/70 backdrop-blur-xs py-6 text-stone-500 text-xs mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-bold text-stone-800">FoodFresh AI</span>
            <span>—</span>
            <span>Food Freshness & Spoilage Detector</span>
          </div>
          <p className="text-[11px] text-stone-400 text-center sm:text-right">
            Deterministic 5-pillar scoring • USDA Danger Zone heuristics • Gemini vision API integration
          </p>
        </div>
      </footer>
    </div>
  );
}
