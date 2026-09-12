import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { FoodAnalysisRequest, FoodCategory, StorageMethod } from './src/types';
import { dataStore } from './server/dataStore';
import { analyzeFoodImageWithGemini } from './server/geminiVision';
import { calculateFreshness } from './server/scoringEngine';

dotenv.config();

const PORT = 3000;

async function startServer() {
  const app = express();

  // Support base64 image uploads from camera / drag & drop (up to 25MB)
  app.use(express.json({ limit: '25mb' }));
  app.use(express.urlencoded({ extended: true, limit: '25mb' }));

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'FoodFresh AI Backend',
      hasGeminiKey: Boolean(process.env.GEMINI_API_KEY)
    });
  });

  // POST /api/analyze-food - Main analysis endpoint
  app.post('/api/analyze-food', async (req, res) => {
    try {
      const body = req.body || {};

      const foodName = (body.food_name || body.food_type || 'Unknown Food').trim();
      const foodCategory = (body.food_category || 'Other') as FoodCategory;
      const storageTemp = typeof body.storage_temperature === 'number' ? body.storage_temperature : 4;
      const storageDuration = typeof body.storage_duration === 'number' ? body.storage_duration : 1;
      const storageMethod = (body.storage_method || 'Refrigerator') as StorageMethod;

      const rawObs = body.observations || {};
      const observations = {
        unusual_smell: Boolean(rawObs.unusual_smell),
        slimy_texture: Boolean(rawObs.slimy_texture),
        visible_mold: Boolean(rawObs.visible_mold),
        color_change: Boolean(rawObs.color_change),
      };

      const analysisReq: FoodAnalysisRequest = {
        image: body.image,
        food_name: foodName,
        food_category: foodCategory,
        storage_temperature: storageTemp,
        storage_duration: storageDuration,
        storage_method: storageMethod,
        storage_packaging: body.storage_packaging,
        purchase_date: body.purchase_date,
        observations,
        custom_notes: body.custom_notes,
        custom_weights: body.custom_weights,
        is_demo: Boolean(body.is_demo),
      };

      // 1. Run computer vision analysis
      const visionResult = await analyzeFoodImageWithGemini(
        analysisReq.image,
        foodName,
        foodCategory,
        observations,
        analysisReq.custom_notes
      );

      // 2. Run deterministic food-specific scoring engine
      const analysisResult = calculateFreshness(analysisReq, visionResult);

      // 3. Save to history
      dataStore.addScan(analysisResult);

      // Return comprehensive result
      res.json({
        food_type: analysisResult.food_name,
        food_name: analysisResult.food_name,
        food_category: analysisResult.food_category,
        freshness_score: analysisResult.freshness_score,
        status: analysisResult.status,
        spoilage_risk: analysisResult.spoilage_risk,
        confidence: analysisResult.confidence,
        detected_indicators: analysisResult.detected_indicators,
        recommendation: analysisResult.recommendation,
        safety_warning: analysisResult.safety_warning,
        estimated_remaining_days: analysisResult.estimated_remaining_days,
        sub_scores: analysisResult.sub_scores,
        weights_used: analysisResult.weights_used,
        score_breakdown: analysisResult.score_breakdown,
        visual_indicators_detail: analysisResult.visual_indicators_detail,
        storage_evaluation: analysisResult.storage_evaluation,
        storage_used: analysisResult.storage_used,
        timestamp: analysisResult.timestamp,
        id: analysisResult.id,
        engine_used: analysisResult.engine_used,
        raw_ai_notes: analysisResult.raw_ai_notes,
      });
    } catch (error) {
      console.error('Error analyzing food product:', error);
      res.status(500).json({
        error: 'Failed to complete food freshness analysis',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // GET /api/history
  app.get('/api/history', (req, res) => {
    res.json({ scans: dataStore.getScans() });
  });

  // DELETE /api/history/:id
  app.delete('/api/history/:id', (req, res) => {
    const success = dataStore.deleteScan(req.params.id);
    res.json({ success });
  });

  // DELETE /api/history
  app.delete('/api/history', (req, res) => {
    dataStore.clearScans();
    res.json({ success: true, message: 'Scan history cleared' });
  });

  // POST /api/history/import - Bulk import user's scan history data
  app.post('/api/history/import', (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body?.scans;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected an array of scan items' });
      }
      let count = 0;
      for (const raw of items) {
        if (raw.food_name && raw.freshness_score !== undefined) {
          dataStore.addScan(raw);
          count++;
        }
      }
      res.json({ success: true, count, scans: dataStore.getScans() });
    } catch (err) {
      res.status(500).json({ error: 'Failed to import scan items' });
    }
  });

  // GET /api/dataset
  app.get('/api/dataset', (req, res) => {
    res.json({ dataset: dataStore.getDataset() });
  });

  // POST /api/dataset
  app.post('/api/dataset', (req, res) => {
    try {
      const item = req.body;
      if (!item.food_name || !item.food_category || !item.freshness_label) {
        return res.status(400).json({ error: 'Missing required dataset fields' });
      }
      const newItem = dataStore.addDatasetItem(item);
      res.status(201).json({ item: newItem });
    } catch (err) {
      res.status(500).json({ error: 'Failed to add dataset sample' });
    }
  });

  // POST /api/dataset/import - Bulk import user dataset samples
  app.post('/api/dataset/import', (req, res) => {
    try {
      const items = Array.isArray(req.body) ? req.body : req.body?.items;
      if (!Array.isArray(items)) {
        return res.status(400).json({ error: 'Expected an array of dataset items' });
      }
      const added: any[] = [];
      for (const raw of items) {
        if (raw.food_name && raw.food_category && raw.freshness_label) {
          added.push(dataStore.addDatasetItem(raw));
        }
      }
      res.json({ success: true, count: added.length, items: added });
    } catch (err) {
      res.status(500).json({ error: 'Failed to import dataset items' });
    }
  });

  // DELETE /api/dataset/:id
  app.delete('/api/dataset/:id', (req, res) => {
    const success = dataStore.deleteDatasetItem(req.params.id);
    res.json({ success });
  });

  // GET /api/dataset/evaluation
  app.get('/api/dataset/evaluation', (req, res) => {
    res.json(dataStore.getEvaluation());
  });

  // POST /api/dataset/evaluate
  app.post('/api/dataset/evaluate', (req, res) => {
    const stats = dataStore.runEvaluationBenchmark();
    res.json(stats);
  });

  // POST /api/dataset/reset-evaluation
  app.post('/api/dataset/reset-evaluation', (req, res) => {
    const stats = dataStore.resetEvaluation();
    res.json(stats);
  });

  // Vite middleware in dev, static files in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`FoodFresh AI Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
