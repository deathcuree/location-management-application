"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const auth_1 = __importDefault(require("./routes/auth"));
const locations_1 = __importDefault(require("./routes/locations"));
const upload_1 = __importDefault(require("./routes/upload"));
// Load environment variables
dotenv_1.default.config();
const app = (0, express_1.default)();
// Middleware
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express_1.default.json());
// Health check
app.get('/', (_req, res) => {
    res.json({ status: 'ok', service: 'location-management-backend' });
});
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/locations', locations_1.default);
app.use('/api/upload', upload_1.default);
// Global error handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled error:', err);
    const status = err?.status || 500;
    res.status(status).json({
        error: err?.message || 'Internal Server Error',
    });
});
const PORT = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
});
exports.default = app;
//# sourceMappingURL=index.js.map