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

    const original = req.file.originalname?.toLowerCase() ?? '';
    if (!original.endsWith('.zip')) {
      return res.status(400).json({ error: 'Only .zip files are accepted' });
    }

    // Read ZIP buffer and validate exactly ONE content file which must be .txt.
    // Ignore common macOS metadata like __MACOSX/, .DS_Store, and resource forks (._*).
    const zip = new AdmZip(req.file.buffer);
    const entries = zip.getEntries();

    const isMetadata = (name: string) => {
      const lower = name.toLowerCase();
      return (
        lower.startsWith('__macosx/') ||
        lower.endsWith('/.ds_store') ||
        lower.endsWith('.ds_store') ||
        lower.split('/').some((part) => part.startsWith('._'))
      );
    };

    const contentEntries = entries.filter((e: any) => !e.isDirectory && !isMetadata(e.entryName));

    if (contentEntries.length !== 1) {
      return res.status(400).json({ error: 'ZIP must contain exactly one .txt file' });
    }

    const onlyEntryName = contentEntries[0].entryName.toLowerCase();
    if (!onlyEntryName.endsWith('.txt')) {
      return res.status(400).json({ error: 'ZIP must contain exactly one .txt file' });
    }

    // Parse the .txt file content from the zip
    const content = contentEntries[0].getData().toString('utf8');

    // Expected format per line (header optional):
    // Name, Latitude, Longitude
    // Suria KLCC,3.157324409,101.7121981
    // Zoo Negara,3.21054160,101.75920504
    // Also supports tab or pipe delimiters: name\tlat\tlng or name|lat|lng
    const lines: string[] = content
      .split(/\r?\n/)
      .map((l: string) => l.trim())
      .filter((l: string) => l.length > 0);

    // Optional header handling
    if (lines.length > 0) {
      const headerLine = lines.at(0) ?? '';
      const partsRaw = headerLine.split(/[,|\t]/).map((s: string) => s.trim().toLowerCase());
      const p0 = partsRaw[0] ?? '';
      const p1 = partsRaw[1] ?? '';
      const p2 = partsRaw[2] ?? '';
      if (
        partsRaw.length >= 3 &&
        p0 === 'name' &&
        (p1 === 'latitude' || p1.startsWith('lat')) &&
        (p2 === 'longitude' || p2.startsWith('lng'))
      ) {
        lines.shift();
      }
    }

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
      totalParsed: data.length + invalid,
      invalidRows: invalid,
    });
  } catch (err) {
    next(err);
  }
});

export default router;