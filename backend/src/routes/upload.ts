import { Router } from 'express';
import multer from 'multer';
import AdmZip from 'adm-zip';
import prisma from '../prisma';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});

router.post('/', requireAuth, upload.single('file'), async (req, res, next) => {
  try {
    const userId = (req as AuthRequest).userId!;
    if (!req.file) {
      return res.status(400).json({ error: 'file is required (zip containing a single .txt file)' });
    }

    // Read ZIP buffer and find exactly one .txt entry
    const zip = new AdmZip(req.file.buffer);
    const txtEntries = zip.getEntries().filter(
          (e: any) => !e.isDirectory && e.entryName.toLowerCase().endsWith('.txt'),
        );

    if (txtEntries.length !== 1) {
      return res.status(400).json({ error: 'ZIP must contain exactly one .txt file' });
    }

    // Parse the .txt file content
    const content = txtEntries[0].getData().toString('utf8');

    // Expected format per line: name,lat,lng
    // Also supports tab or pipe delimiters: name\tlat\tlng or name|lat|lng
    const lines: string[] = content
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    const data: Array<{ name: string; lat: number; lng: number; userId: number }> = [];
    let invalid = 0;

    for (const line of lines) {
      const parts = line.split(/[,|\t]/).map((s: string) => s.trim());
      if (parts.length < 3) {
        invalid++;
        continue;
      }
      const [name, latStr, lngStr] = parts as [string, string, string];
      const lat = parseFloat(latStr);
      const lng = parseFloat(lngStr);

      if (!name || !Number.isFinite(lat) || !Number.isFinite(lng)) {
        invalid++;
        continue;
      }

      data.push({ name, lat, lng, userId });
    }

    if (data.length === 0) {
      return res.status(400).json({ error: 'No valid rows found in text file' });
    }

    const result = await prisma.location.createMany({
      data,
    });

    res.status(201).json({
      inserted: result.count,
      totalParsed: lines.length,
      invalidRows: invalid,
    });
  } catch (err) {
    next(err);
  }
});

export default router;