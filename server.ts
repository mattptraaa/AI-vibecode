import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { CLASS_MATERIALS } from './src/data/classMaterials';

async function startServer() {
  const app = express();
  const port = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // API Endpoint: Penilaian Kuis di Sisi Server (Server-side Quiz Evaluation)
  // Menjamin kunci jawaban dan pembahasan tidak pernah dikirim ke browser sebelum anggota menjawab.
  app.post('/api/evaluate-quiz', (req: Request, res: Response) => {
    try {
      const { classId, meetingId, answers } = req.body;

      if (!classId || !meetingId || !answers || typeof answers !== 'object') {
        return res.status(400).json({ error: 'Data pengiriman kuis tidak valid atau tidak lengkap.' });
      }

      const classDef = CLASS_MATERIALS[classId];
      if (!classDef) {
        return res.status(404).json({ error: `Kelas '${classId}' tidak ditemukan.` });
      }

      const meeting = classDef.meetings.find((m) => m.preview.id === meetingId);
      if (!meeting) {
        return res.status(404).json({ error: `Pertemuan '${meetingId}' tidak ditemukan pada kelas '${classId}'.` });
      }

      const officialAnswers = meeting.answers.answers;
      let correctCount = 0;
      const totalSoal = officialAnswers.length;

      const review = officialAnswers.map((item) => {
        const userChoice = (answers[item.nomor] || answers[String(item.nomor)] || '').toString().trim().toLowerCase();
        const expected = item.kunci.trim().toLowerCase();
        const isCorrect = userChoice === expected;

        if (isCorrect) {
          correctCount += 1;
        }

        return {
          nomor: item.nomor,
          userChoice,
          kunci: item.kunci,
          isCorrect,
          pembahasan: item.pembahasan
        };
      });

      const score = totalSoal > 0 ? Math.round((correctCount / totalSoal) * 100) : 0;

      return res.json({
        success: true,
        classId,
        meetingId,
        score,
        correctCount,
        totalQuestions: totalSoal,
        review
      });
    } catch (err: any) {
      console.error('Error evaluating quiz on server:', err);
      return res.status(500).json({ error: 'Terjadi kesalahan internal server saat menilai kuis.' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (_req: Request, res: Response) => {
    res.json({ status: 'ok', serverTime: new Date().toISOString() });
  });

  // Mount Vite middleware in development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    // Serve static files in production
    app.use(express.static('dist'));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile('dist/index.html', { root: '.' });
    });
  }

  app.listen(port, '0.0.0.0', () => {
    console.log(`Server UT Family running on port ${port} (http://localhost:${port})`);
  });
}

startServer();
