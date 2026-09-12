import React, { useState, useEffect, useRef } from 'react';
import { 
  Camera, 
  Upload, 
  X, 
  Calendar, 
  Thermometer, 
  Clock, 
  AlertCircle, 
  Sparkles, 
  Check, 
  Layers,
  ChevronRight,
  Clipboard,
  Link as LinkIcon,
  RotateCcw,
  PackageCheck,
  FileEdit,
  Info
} from 'lucide-react';
import { FoodAnalysisRequest, FoodCategory, StorageMethod } from '../types';

interface ScanFormProps {
  onSubmit: (request: FoodAnalysisRequest) => void;
  onOpenCamera: () => void;
  isLoading: boolean;
  initialValues?: Partial<FoodAnalysisRequest>;
  onSelectDemoPreset?: () => void;
}

const CATEGORIES: FoodCategory[] = [
  'Fruits',
  'Vegetables',
  'Meat',
  'Fish',
  'Dairy',
  'Bakery',
  'Cooked Food',
  'Other'
];

const STORAGE_METHODS: StorageMethod[] = [
  'Refrigerator',
  'Freezer',
  'Room Temperature',
  'Open Environment'
];

const PACKAGING_OPTIONS: Array<'Airtight / Vacuum Sealed' | 'Original Package / Loose Wrap' | 'Open / Uncovered'> = [
  'Airtight / Vacuum Sealed',
  'Original Package / Loose Wrap',
  'Open / Uncovered'
];

const COMMON_SUGGESTIONS: Record<FoodCategory, string[]> = {
  Fruits: ['Apple', 'Banana', 'Avocado', 'Strawberries', 'Mango', 'Grapes', 'Peach'],
  Vegetables: ['Lettuce', 'Spinach', 'Broccoli', 'Tomato', 'Carrot', 'Cucumber', 'Bell Pepper'],
  Meat: ['Chicken Breast', 'Ground Beef', 'Pork Chops', 'Bacon', 'Turkey Fillet', 'Steak'],
  Fish: ['Salmon Fillet', 'Cod', 'Shrimp', 'Tuna Steak', 'Tilapia', 'Smoked Salmon'],
  Dairy: ['Pasteurized Milk', 'Cheddar Cheese', 'Greek Yogurt', 'Butter', 'Cream', 'Cottage Cheese'],
  Bakery: ['Sourdough Loaf', 'White Bread', 'Croissant', 'Bagel', 'Pita', 'Muffin'],
  'Cooked Food': ['Cooked Rice', 'Pasta with Sauce', 'Chicken Soup', 'Beef Stew', 'Roast Vegetables', 'Curry'],
  Other: ['Leftovers', 'Tofu', 'Deli Sandwich', 'Prepared Salad', 'Hummus']
};

export const ScanForm: React.FC<ScanFormProps> = ({
  onSubmit,
  onOpenCamera,
  isLoading,
  initialValues,
  onSelectDemoPreset,
}) => {
  const [foodCategory, setFoodCategory] = useState<FoodCategory>(initialValues?.food_category || 'Fruits');
  const [foodName, setFoodName] = useState<string>(initialValues?.food_name || '');
  const [image, setImage] = useState<string | undefined>(initialValues?.image);
  const [skipImage, setSkipImage] = useState<boolean>(false);
  const [imageUrlInput, setImageUrlInput] = useState<string>('');
  const [showUrlInput, setShowUrlInput] = useState<boolean>(false);
  const [urlError, setUrlError] = useState<string | null>(null);

  // Storage metrics
  const [tempUnit, setTempUnit] = useState<'C' | 'F'>('C');
  const [storageTempC, setStorageTempC] = useState<number>(
    initialValues?.storage_temperature ?? 4
  );
  const [storageMethod, setStorageMethod] = useState<StorageMethod>(
    initialValues?.storage_method || 'Refrigerator'
  );
  const [storagePackaging, setStoragePackaging] = useState<'Airtight / Vacuum Sealed' | 'Original Package / Loose Wrap' | 'Open / Uncovered'>(
    initialValues?.storage_packaging || 'Original Package / Loose Wrap'
  );

  // Duration
  const [durationUnit, setDurationUnit] = useState<'days' | 'hours'>('days');
  const [storageDurationValue, setStorageDurationValue] = useState<number>(
    initialValues?.storage_duration !== undefined
      ? initialValues.storage_duration < 1
        ? Math.round(initialValues.storage_duration * 24)
        : initialValues.storage_duration
      : 2
  );
  const [purchaseDate, setPurchaseDate] = useState<string>(
    initialValues?.purchase_date || new Date().toISOString().split('T')[0]
  );

  // Observations
  const [unusualSmell, setUnusualSmell] = useState<boolean>(
    initialValues?.observations?.unusual_smell || false
  );
  const [slimyTexture, setSlimyTexture] = useState<boolean>(
    initialValues?.observations?.slimy_texture || false
  );
  const [visibleMold, setVisibleMold] = useState<boolean>(
    initialValues?.observations?.visible_mold || false
  );
  const [colorChange, setColorChange] = useState<boolean>(
    initialValues?.observations?.color_change || false
  );
  const [customNotes, setCustomNotes] = useState<string>(
    initialValues?.custom_notes || ''
  );

  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const [pasteNotice, setPasteNotice] = useState<string | null>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Sync initial duration unit if given fraction
  useEffect(() => {
    if (initialValues?.storage_duration !== undefined && initialValues.storage_duration < 1) {
      setDurationUnit('hours');
      setStorageDurationValue(Math.max(1, Math.round(initialValues.storage_duration * 24)));
    }
  }, [initialValues]);

  // Global Clipboard paste support: allows users to simply press Ctrl+V / Cmd+V anywhere to paste an image!
  useEffect(() => {
    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.indexOf('image') !== -1) {
          const blob = items[i].getAsFile();
          if (blob) {
            readBlobAsDataUrl(blob);
            setPasteNotice('Image pasted from clipboard!');
            setTimeout(() => setPasteNotice(null), 3000);
            e.preventDefault();
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, []);

  const readBlobAsDataUrl = (file: Blob) => {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) {
        setImage(result);
        setSkipImage(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      readBlobAsDataUrl(file);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      readBlobAsDataUrl(file);
    }
  };

  const handleLoadImageUrl = () => {
    setUrlError(null);
    const url = imageUrlInput.trim();
    if (!url) return;

    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      setUrlError('Please enter a valid URL starting with https:// or http://');
      return;
    }

    const testImg = new Image();
    testImg.onload = () => {
      setImage(url);
      setSkipImage(false);
      setShowUrlInput(false);
      setImageUrlInput('');
    };
    testImg.onerror = () => {
      // Still set it so the server can attempt fetching if CORS blocks browser loading
      setImage(url);
      setSkipImage(false);
      setShowUrlInput(false);
      setImageUrlInput('');
    };
    testImg.src = url;
  };

  const handleClearForm = () => {
    setFoodName('');
    setImage(undefined);
    setSkipImage(false);
    setCustomNotes('');
    setStorageDurationValue(2);
    setDurationUnit('days');
    setStorageTempC(4);
    setStorageMethod('Refrigerator');
    setStoragePackaging('Original Package / Loose Wrap');
    setUnusualSmell(false);
    setSlimyTexture(false);
    setVisibleMold(false);
    setColorChange(false);
  };

  // Convert temperature display
  const displayTemp = tempUnit === 'C' ? storageTempC : Math.round((storageTempC * 9) / 5 + 32);

  const handleTempChange = (val: number, isFahrenheit: boolean) => {
    if (isFahrenheit) {
      const inC = Math.round(((val - 32) * 5) / 9);
      setStorageTempC(inC);
    } else {
      setStorageTempC(val);
    }
  };

  // Danger zone in Celsius is 4°C to 60°C for perishables
  const isInDangerZone = ['Meat', 'Fish', 'Dairy', 'Cooked Food'].includes(foodCategory) && storageTempC > 4 && storageTempC < 60;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate duration in days for rules engine
    const computedDays = durationUnit === 'days' 
      ? storageDurationValue 
      : Math.max(0.05, Number((storageDurationValue / 24).toFixed(2)));

    onSubmit({
      image: skipImage ? undefined : image,
      food_name: foodName.trim() || `${foodCategory} Item`,
      food_category: foodCategory,
      storage_temperature: storageTempC,
      storage_duration: computedDays,
      storage_method: storageMethod,
      storage_packaging: storagePackaging,
      purchase_date: purchaseDate,
      observations: {
        unusual_smell: unusualSmell,
        slimy_texture: slimyTexture,
        visible_mold: visibleMold,
        color_change: colorChange,
      },
      custom_notes: customNotes.trim() || undefined,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl mx-auto">
      {/* Top Banner with Clear & Custom Mode Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 bg-white border border-stone-200 rounded-2xl shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
            <FileEdit className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-bold text-stone-900">Custom Food Data Entry & Inspection</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                User Input Active
              </span>
            </div>
            <p className="text-xs text-stone-500">
              Input your own food items, photo, temperatures, storage timeline, and sensory observations.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            type="button"
            id="clear-form-btn"
            onClick={handleClearForm}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold transition-colors"
            title="Clear all fields and start fresh"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Clear / Blank Form</span>
          </button>

          {onSelectDemoPreset && (
            <button
              type="button"
              id="scan-form-demo-picker-btn"
              onClick={onSelectDemoPreset}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Sample Presets</span>
            </button>
          )}
        </div>
      </div>

      {pasteNotice && (
        <div className="p-3 bg-emerald-100 text-emerald-900 rounded-xl text-xs font-semibold flex items-center gap-2 border border-emerald-300 animate-in fade-in">
          <Check className="w-4 h-4" />
          <span>{pasteNotice}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Column: Image Upload / Capture (5 cols) */}
        <div className="md:col-span-5 space-y-4">
          <div className="bg-white rounded-2xl border border-stone-200 p-4 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <Camera className="w-4 h-4 text-emerald-600" />
                Food Visual (Photo)
              </label>
              <button
                type="button"
                onClick={() => setSkipImage(!skipImage)}
                className={`text-[11px] font-semibold transition-colors ${
                  skipImage ? 'text-amber-700 underline font-bold' : 'text-stone-500 hover:text-stone-800'
                }`}
              >
                {skipImage ? '✓ No photo mode' : 'No photo? Click here'}
              </button>
            </div>

            {skipImage ? (
              <div className="p-5 rounded-xl border border-amber-200 bg-amber-50/60 text-amber-950 text-xs space-y-2 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center mx-auto">
                  <Info className="w-5 h-5" />
                </div>
                <h4 className="font-bold">Analyzing Without Photo</h4>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  FoodFresh AI will calculate freshness based on your entered food category, storage temperatures, duration, and sensory cues.
                </p>
                <button
                  type="button"
                  onClick={() => setSkipImage(false)}
                  className="mt-2 px-3 py-1 rounded-lg bg-white border border-amber-300 text-amber-900 text-xs font-semibold hover:bg-amber-100"
                >
                  Attach a photo instead
                </button>
              </div>
            ) : (
              <>
                {/* Image Drop Zone */}
                <div
                  ref={dropZoneRef}
                  id="image-drop-zone"
                  onDragOver={(e) => {
                    e.preventDefault();
                    setIsDragOver(true);
                  }}
                  onDragLeave={() => setIsDragOver(false)}
                  onDrop={handleFileDrop}
                  className={`relative aspect-4/3 w-full rounded-xl border-2 border-dashed flex flex-col items-center justify-center overflow-hidden transition-all ${
                    isDragOver
                      ? 'border-emerald-500 bg-emerald-50/60 scale-[0.99]'
                      : image
                      ? 'border-stone-200 bg-stone-900'
                      : 'border-stone-300 bg-stone-50 hover:bg-stone-100/80'
                  }`}
                >
                  {image ? (
                    <>
                      <img
                        src={image}
                        alt="Food preview"
                        className="w-full h-full object-contain"
                      />
                      <button
                        type="button"
                        id="remove-image-btn"
                        onClick={() => setImage(undefined)}
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 hover:bg-black/90 text-white transition-colors shadow-sm"
                        title="Remove photo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <div className="p-4 text-center space-y-2">
                      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-stone-800">
                          Drag & drop your food photo here
                        </p>
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          or browse from your device • or paste from clipboard (Ctrl+V)
                        </p>
                      </div>

                      <label
                        id="browse-file-btn"
                        className="inline-block px-3.5 py-1.5 bg-white border border-stone-300 hover:border-stone-400 rounded-lg text-xs font-semibold text-stone-800 cursor-pointer shadow-xs transition-colors"
                      >
                        Choose Photo File
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleFileInput}
                          className="hidden"
                        />
                      </label>
                    </div>
                  )}
                </div>

                {/* Auxiliary Visual Actions */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    type="button"
                    id="open-live-camera-btn"
                    onClick={onOpenCamera}
                    className="py-2 px-3 rounded-xl bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                  >
                    <Camera className="w-4 h-4 text-emerald-400" />
                    <span>Live Camera</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowUrlInput(!showUrlInput)}
                    className="py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 border border-stone-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <LinkIcon className="w-3.5 h-3.5 text-stone-600" />
                    <span>Paste Image URL</span>
                  </button>
                </div>

                {/* Image URL Input Form */}
                {showUrlInput && (
                  <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs">
                    <label className="font-semibold text-stone-700 block">
                      Web Image Address (URL):
                    </label>
                    <div className="flex gap-1.5">
                      <input
                        type="url"
                        value={imageUrlInput}
                        onChange={(e) => {
                          setImageUrlInput(e.target.value);
                          setUrlError(null);
                        }}
                        placeholder="https://example.com/my-food-photo.jpg"
                        className="flex-1 px-2.5 py-1.5 bg-white border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                      />
                      <button
                        type="button"
                        onClick={handleLoadImageUrl}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs"
                      >
                        Load
                      </button>
                    </div>
                    {urlError && <p className="text-[11px] text-rose-600 font-medium">{urlError}</p>}
                  </div>
                )}
              </>
            )}

            <div className="p-3 bg-stone-50 border border-stone-200 rounded-xl text-[11px] text-stone-600 space-y-1">
              <span className="font-bold text-stone-800 flex items-center gap-1">
                <Clipboard className="w-3.5 h-3.5 text-emerald-600" />
                Input Tip
              </span>
              <p className="leading-relaxed">
                You can capture a photo with your smartphone, take a screenshot, or copy any picture to your clipboard and hit <strong>Ctrl+V</strong> to paste it right into this form.
              </p>
            </div>
          </div>
        </div>

        {/* Right Column: Food Name, Category, Storage Metrics & Observations (7 cols) */}
        <div className="md:col-span-7 space-y-5">
          {/* 1. Category & Specific Food Name */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div>
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider block mb-2">
                1. Food Category
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    id={`cat-btn-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => {
                      setFoodCategory(cat);
                      // Do NOT overwrite user's custom food name if they already typed something!
                    }}
                    className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-center transition-all ${
                      foodCategory === cat
                        ? 'bg-emerald-600 text-white shadow-xs font-bold'
                        : 'bg-stone-50 text-stone-700 hover:bg-stone-100 border border-stone-200/80'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-stone-900 uppercase tracking-wider">
                  Specific Food Name
                </label>
                <span className="text-[11px] text-stone-500">Type any custom food</span>
              </div>
              <input
                type="text"
                id="food-name-input"
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                placeholder="e.g. Fresh Mango, Leftover Chicken Tikka, Honeycrisp Apple, Mozzarella"
                className="w-full px-3.5 py-2.5 text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900 font-medium placeholder:text-stone-400"
                required
              />

              {/* Optional Quick Suggestions */}
              <div className="flex flex-wrap items-center gap-1.5 mt-2">
                <span className="text-[11px] text-stone-500 font-medium">Quick suggestions:</span>
                {COMMON_SUGGESTIONS[foodCategory].map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => setFoodName(suggestion)}
                    className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                      foodName.toLowerCase() === suggestion.toLowerCase()
                        ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold'
                        : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Storage Conditions & Timeline */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <h3 className="text-xs font-bold text-stone-900 uppercase tracking-wider">
              2. Storage Conditions & Timeline
            </h3>

            {/* Storage Environment Method */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5">
                Storage Method
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {STORAGE_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    id={`method-btn-${method.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setStorageMethod(method)}
                    className={`p-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                      storageMethod === method
                        ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </div>

            {/* Packaging / Containment */}
            <div>
              <label className="text-xs font-medium text-stone-700 block mb-1.5 flex items-center gap-1">
                <PackageCheck className="w-3.5 h-3.5 text-stone-500" />
                Packaging / Seal
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                {PACKAGING_OPTIONS.map((pkg) => (
                  <button
                    key={pkg}
                    type="button"
                    onClick={() => setStoragePackaging(pkg)}
                    className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-center border transition-all ${
                      storagePackaging === pkg
                        ? 'bg-emerald-50 border-emerald-400 text-emerald-900 font-bold'
                        : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                    }`}
                  >
                    {pkg}
                  </button>
                ))}
              </div>
            </div>

            {/* Storage Temperature with °C and °F Toggle */}
            <div className="pt-1">
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-medium text-stone-700 flex items-center gap-1">
                  <Thermometer className="w-3.5 h-3.5 text-sky-600" />
                  Storage Temperature
                </label>

                <div className="flex items-center gap-2">
                  {/* Unit Toggle */}
                  <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-[11px]">
                    <button
                      type="button"
                      onClick={() => setTempUnit('C')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        tempUnit === 'C' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      °C
                    </button>
                    <button
                      type="button"
                      onClick={() => setTempUnit('F')}
                      className={`px-2 py-0.5 rounded-md font-bold transition-colors ${
                        tempUnit === 'F' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      °F
                    </button>
                  </div>

                  {/* Exact Number Input */}
                  <div className="flex items-center gap-1">
                    <input
                      type="number"
                      id="exact-temp-input"
                      value={displayTemp}
                      onChange={(e) => {
                        const val = parseFloat(e.target.value);
                        if (!isNaN(val)) {
                          handleTempChange(val, tempUnit === 'F');
                        }
                      }}
                      className="w-16 px-2 py-0.5 text-center font-mono font-bold text-sm bg-stone-50 border border-stone-300 rounded-lg text-stone-900 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    />
                    <span className="font-bold text-xs text-stone-700">°{tempUnit}</span>
                  </div>

                  {isInDangerZone && (
                    <span className="text-[10px] font-bold text-amber-800 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-md">
                      Danger Zone
                    </span>
                  )}
                </div>
              </div>

              {/* Temperature Slider */}
              <input
                type="range"
                id="storage-temp-slider"
                min={tempUnit === 'C' ? -25 : -13}
                max={tempUnit === 'C' ? 45 : 113}
                step="1"
                value={displayTemp}
                onChange={(e) => handleTempChange(parseInt(e.target.value, 10), tempUnit === 'F')}
                className="w-full accent-emerald-600 h-2 bg-stone-200 rounded-lg cursor-pointer"
              />

              {/* Convenient Presets */}
              <div className="flex flex-wrap gap-1.5 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setStorageTempC(-18);
                    setStorageMethod('Freezer');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    storageTempC === -18 ? 'bg-sky-100 text-sky-900 border-sky-300 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Freezer (-18°C / 0°F)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStorageTempC(4);
                    setStorageMethod('Refrigerator');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    storageTempC === 4 ? 'bg-emerald-100 text-emerald-900 border-emerald-300 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Fridge (4°C / 39°F)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStorageTempC(15);
                    setStorageMethod('Room Temperature');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    storageTempC === 15 ? 'bg-stone-200 text-stone-900 border-stone-300 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Pantry (15°C / 59°F)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStorageTempC(21);
                    setStorageMethod('Room Temperature');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    storageTempC === 21 ? 'bg-amber-100 text-amber-900 border-amber-300 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Room (21°C / 70°F)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStorageTempC(30);
                    setStorageMethod('Open Environment');
                  }}
                  className={`text-[11px] px-2 py-0.5 rounded-md border transition-colors ${
                    storageTempC === 30 ? 'bg-rose-100 text-rose-900 border-rose-300 font-bold' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  Warm (30°C / 86°F)
                </button>
              </div>
            </div>

            {/* Storage Duration: Days or Hours */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="text-xs font-medium text-stone-700 block mb-1 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-stone-500" />
                  Date Acquired / Stored
                </label>
                <input
                  type="date"
                  id="purchase-date-input"
                  value={purchaseDate}
                  onChange={(e) => setPurchaseDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-stone-800"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs font-medium text-stone-700 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    Storage Duration
                  </label>
                  {/* Unit Toggle: Days vs Hours */}
                  <div className="inline-flex rounded-lg border border-stone-300 p-0.5 bg-stone-100 text-[10px]">
                    <button
                      type="button"
                      onClick={() => {
                        if (durationUnit === 'hours') {
                          setStorageDurationValue(Math.max(1, Math.round(storageDurationValue / 24)));
                          setDurationUnit('days');
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded-md font-bold ${
                        durationUnit === 'days' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Days
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (durationUnit === 'days') {
                          setStorageDurationValue(Math.max(1, storageDurationValue * 24));
                          setDurationUnit('hours');
                        }
                      }}
                      className={`px-1.5 py-0.5 rounded-md font-bold ${
                        durationUnit === 'hours' ? 'bg-white text-emerald-800 shadow-xs' : 'text-stone-500'
                      }`}
                    >
                      Hours
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setStorageDurationValue((d) => Math.max(0, d - 1))}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-sm text-stone-700 border border-stone-200"
                  >
                    -
                  </button>
                  <input
                    type="number"
                    id="storage-duration-input"
                    min="0"
                    max={durationUnit === 'days' ? 365 : 8760}
                    value={storageDurationValue}
                    onChange={(e) => setStorageDurationValue(Math.max(0, parseInt(e.target.value || '0', 10)))}
                    className="flex-1 text-center py-2 text-sm bg-stone-50 border border-stone-300 rounded-xl font-mono font-bold text-stone-900"
                  />
                  <button
                    type="button"
                    onClick={() => setStorageDurationValue((d) => d + 1)}
                    className="w-9 h-9 rounded-xl bg-stone-100 hover:bg-stone-200 font-bold text-sm text-stone-700 border border-stone-200"
                  >
                    +
                  </button>
                  <span className="text-xs font-semibold text-stone-600 min-w-10">
                    {durationUnit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Sensory Observations & Custom Freeform Notes */}
          <div className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-900 uppercase tracking-wider flex items-center gap-1.5">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                3. Physical Sensory Cues (Optional)
              </label>
              <span className="text-[11px] text-stone-500">Improves safety accuracy</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
              {/* Unusual smell */}
              <div 
                onClick={() => setUnusualSmell(!unusualSmell)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  unusualSmell ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <span className="font-semibold block">Unusual / sour smell</span>
                  <span className="text-[10px] text-stone-500">Off-putting or fermenting odor</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  unusualSmell ? 'bg-rose-600 justify-end' : 'bg-stone-300 justify-start'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>

              {/* Slimy texture */}
              <div 
                onClick={() => setSlimyTexture(!slimyTexture)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  slimyTexture ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <span className="font-semibold block">Slimy or tacky texture</span>
                  <span className="text-[10px] text-stone-500">Surface biofilm or slickness</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  slimyTexture ? 'bg-rose-600 justify-end' : 'bg-stone-300 justify-start'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>

              {/* Visible mold */}
              <div 
                onClick={() => setVisibleMold(!visibleMold)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  visibleMold ? 'bg-rose-50 border-rose-300 text-rose-900' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <span className="font-semibold block">Visible mold growth</span>
                  <span className="text-[10px] text-stone-500">Fuzzy white, green or dark spots</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  visibleMold ? 'bg-rose-600 justify-end' : 'bg-stone-300 justify-start'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>

              {/* Color departure */}
              <div 
                onClick={() => setColorChange(!colorChange)}
                className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                  colorChange ? 'bg-amber-50 border-amber-300 text-amber-900' : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                }`}
              >
                <div>
                  <span className="font-semibold block">Discoloration / browning</span>
                  <span className="text-[10px] text-stone-500">Oxidation or unnatural graying</span>
                </div>
                <div className={`w-9 h-5 rounded-full transition-colors flex items-center px-0.5 ${
                  colorChange ? 'bg-amber-600 justify-end' : 'bg-stone-300 justify-start'
                }`}>
                  <div className="w-4 h-4 rounded-full bg-white shadow-xs"></div>
                </div>
              </div>
            </div>

            {/* Custom Freeform Notes */}
            <div className="pt-2">
              <label className="text-xs font-semibold text-stone-700 block mb-1">
                Custom Observation Notes & Packaging Details (Optional):
              </label>
              <textarea
                id="custom-notes-input"
                rows={2}
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g. Purchased at farmers market 2 days ago; expiration label says best before tomorrow; stored in crisper drawer..."
                className="w-full px-3.5 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white text-stone-900 placeholder:text-stone-400"
              />
            </div>
          </div>

          {/* Submit Action Bar */}
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              id="submit-food-analysis-btn"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-2xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-emerald-950/20 flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Analyzing Your Food Data...</span>
                </>
              ) : (
                <>
                  <span>Analyze Freshness & Spoilage Risk</span>
                  <ChevronRight className="w-4 h-4" />
                </>
              )}
            </button>
            <p className="text-[11px] text-stone-500 text-center">
              Evaluated with Gemini multimodal vision & USDA bacterial danger zone algorithms.
            </p>
          </div>
        </div>
      </div>
    </form>
  );
};
