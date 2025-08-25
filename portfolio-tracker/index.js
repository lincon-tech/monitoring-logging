const express = require('express');
const promClient = require('prom-client');
const morgan = require('morgan');
const { v4: uuidv4 } = require('uuid');


const app = express();
const PORT = process.env.PORT || 3000;


// Prometheus metrics setup
promClient.collectDefaultMetrics();
const httpRequestDuration = new promClient.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code'],
    buckets: [0.01, 0.05, 0.1, 0.3, 0.5, 1, 2, 5]
});


// Structured JSON logs
morgan.token('id', (req) => req.id);
app.use((req, res, next) => {
    req.id = uuidv4();
    next();
});
app.use(morgan((tokens, req, res) => JSON.stringify({
    ts: new Date().toISOString(),
    level: 'info',
    req_id: tokens.id(req, res),
    method: tokens.method(req, res),
    url: tokens.url(req, res),
    status: Number(tokens.status(req, res)),
    content_length: Number(tokens.res(req, res, 'content-length') || 0),
    response_time_ms: Number(tokens['response-time'](req, res)),
})));


// Simple API
app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'portfolio-tracker' });
});


app.get('/api/positions', (req, res) => {
    // pretend data
    res.json([
        { symbol: 'AAPL', qty: 10 },
        { symbol: 'MSFT', qty: 5 }
    ]);
});


// Custom metrics middleware
app.use((req, res, next) => {
    const end = httpRequestDuration.startTimer();
    res.on('finish', () => {
        end({ method: req.method, route: req.route ? req.route.path : req.path, status_code: res.statusCode });
    });
    next();
});


// Prometheus metrics endpoint
app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});


app.listen(PORT, () => console.log(`server listening on :${PORT}`));