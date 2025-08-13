"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const multer_1 = __importDefault(require("multer"));
const adm_zip_1 = __importDefault(require("adm-zip"));
const prisma_1 = __importDefault(require("../prisma"));
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const upload = (0, multer_1.default)({
    storage: multer_1.default.memoryStorage(),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
});
router.post('/', auth_1.requireAuth, upload.single('file'), async (req, res, next) => {
    try {
        const userId = req.userId;
        if (!req.file) {
            return res.status(400).json({ error: 'file is required (zip containing a single .txt file)' });
        }
        // Read ZIP buffer and find exactly one .txt entry
        const zip = new adm_zip_1.default(req.file.buffer);
        const txtEntries = zip.getEntries().filter((e) => !e.isDirectory && e.entryName.toLowerCase().endsWith('.txt'));
        if (txtEntries.length !== 1) {
            return res.status(400).json({ error: 'ZIP must contain exactly one .txt file' });
        }
        // Parse the .txt file content
        const content = txtEntries[0].getData().toString('utf8');
        // Expected format per line: name,lat,lng
        // Also supports tab or pipe delimiters: name\tlat\tlng or name|lat|lng
        const lines = content
            .split(/\r?\n/)
            .map((l) => l.trim())
            .filter((l) => l.length > 0);
        const data = [];
        let invalid = 0;
        for (const line of lines) {
            const parts = line.split(/[,|\t]/).map((s) => s.trim());
            if (parts.length < 3) {
                invalid++;
                continue;
            }
            const [name, latStr, lngStr] = parts;
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
        const result = await prisma_1.default.location.createMany({
            data,
        });
        res.status(201).json({
            inserted: result.count,
            totalParsed: lines.length,
            invalidRows: invalid,
        });
    }
    catch (err) {
        next(err);
    }
});
exports.default = router;
//# sourceMappingURL=upload.js.map