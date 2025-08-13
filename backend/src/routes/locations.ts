import { Router } from 'express';
import prisma from '../prisma';
import requireAuth from '../middleware/auth';
import type { AuthRequest } from '../middleware/auth';

const router = Router();

// List locations for the authenticated user
router.get('/', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const locations = await prisma.location.findMany({
      where: { userId: userId! },
      orderBy: { createdAt: 'desc' },
    });
    res.json({ locations });
  } catch (err) {
    next(err);
  }
});

// Create a new location
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const { name, lat, lng } = req.body as { name?: string; lat?: number; lng?: number };

    if (!name || lat === undefined || lng === undefined) {
      return res.status(400).json({ error: 'name, lat, and lng are required' });
    }

    const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
    const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;

    if (!isFinite(latNum) || !isFinite(lngNum)) {
      return res.status(400).json({ error: 'lat and lng must be valid numbers' });
    }

    const created = await prisma.location.create({
      data: {
        name,
        lat: latNum,
        lng: lngNum,
        userId: userId!,
      },
    });

    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

// Get one location by id (owned by user)
router.get('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const location = await prisma.location.findFirst({
      where: { id, userId: userId! },
    });

    if (!location) {
      return res.status(404).json({ error: 'Not found' });
    }

    res.json(location);
  } catch (err) {
    next(err);
  }
});

// Update a location
router.put('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const { name, lat, lng } = req.body as { name?: string; lat?: number; lng?: number };

    const existing = await prisma.location.findFirst({
      where: { id, userId: userId! },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }

    const data: Record<string, any> = {};
    if (typeof name === 'string') data.name = name;
    if (lat !== undefined) data.lat = typeof lat === 'string' ? parseFloat(lat) : lat;
    if (lng !== undefined) data.lng = typeof lng === 'string' ? parseFloat(lng) : lng;

    const updated = await prisma.location.update({
      where: { id },
      data,
    });

    res.json(updated);
  } catch (err) {
    next(err);
  }
});

// Delete a location
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const { userId } = req as AuthRequest;
    const id = Number(req.params.id);
    if (!Number.isInteger(id)) {
      return res.status(400).json({ error: 'Invalid id' });
    }

    const existing = await prisma.location.findFirst({
      where: { id, userId: userId! },
      select: { id: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Not found' });
    }

    await prisma.location.delete({ where: { id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;