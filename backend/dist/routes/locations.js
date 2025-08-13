"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = __importDefault(require("../middleware/auth"));
const router = (0, express_1.Router)();
// List locations for the authenticated user
router.get('/', auth_1.default, async (req, res, next) => {
    try {
        const { userId } = req;
        const locations = await prisma_1.default.location.findMany({
            where: { userId: userId },
            orderBy: { createdAt: 'desc' },
        });
        res.json({ locations });
    }
    catch (err) {
        next(err);
    }
});
// Create a new location
router.post('/', auth_1.default, async (req, res, next) => {
    try {
        const { userId } = req;
        const { name, lat, lng } = req.body;
        if (!name || lat === undefined || lng === undefined) {
            return res.status(400).json({ error: 'name, lat, and lng are required' });
        }
        const latNum = typeof lat === 'string' ? parseFloat(lat) : lat;
        const lngNum = typeof lng === 'string' ? parseFloat(lng) : lng;
        if (!isFinite(latNum) || !isFinite(lngNum)) {
            return res.status(400).json({ error: 'lat and lng must be valid numbers' });
        }
        const created = await prisma_1.default.location.create({
            data: {
                name,
                lat: latNum,
                lng: lngNum,
                userId: userId,
            },
        });
        res.status(201).json(created);
    }
    catch (err) {
        next(err);
    }
});
// Get one location by id (owned by user)
router.get('/:id', auth_1.default, async (req, res, next) => {
    try {
        const { userId } = req;
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const location = await prisma_1.default.location.findFirst({
            where: { id, userId: userId },
        });
        if (!location) {
            return res.status(404).json({ error: 'Not found' });
        }
        res.json(location);
    }
    catch (err) {
        next(err);
    }
});
// Update a location
router.put('/:id', auth_1.default, async (req, res, next) => {
    try {
        const { userId } = req;
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const { name, lat, lng } = req.body;
        const existing = await prisma_1.default.location.findFirst({
            where: { id, userId: userId },
            select: { id: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Not found' });
        }
        const data = {};
        if (typeof name === 'string')
            data.name = name;
        if (lat !== undefined)
            data.lat = typeof lat === 'string' ? parseFloat(lat) : lat;
        if (lng !== undefined)
            data.lng = typeof lng === 'string' ? parseFloat(lng) : lng;
        const updated = await prisma_1.default.location.update({
            where: { id },
            data,
        });
        res.json(updated);
    }
    catch (err) {
        next(err);
    }
});
// Delete a location
router.delete('/:id', auth_1.default, async (req, res, next) => {
    try {
        const { userId } = req;
        const id = Number(req.params.id);
        if (!Number.isInteger(id)) {
            return res.status(400).json({ error: 'Invalid id' });
        }
        const existing = await prisma_1.default.location.findFirst({
            where: { id, userId: userId },
            select: { id: true },
        });
        if (!existing) {
            return res.status(404).json({ error: 'Not found' });
        }
        await prisma_1.default.location.delete({ where: { id } });
        res.status(204).end();
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=locations.js.map