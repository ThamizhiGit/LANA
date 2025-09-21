const { NodeSDK } = require('@opentelemetry/sdk-node')
const { getNodeAutoInstrumentations } = require('@opentelemetry/auto-instrumentations-node')
const { JaegerExporter } = require('@opentelemetry/exporter-jaeger')

// Configure Jaeger exporter
const jaegerExporter = new JaegerExporter({
  endpoint: process.env.JAEGER_ENDPOINT || 'http://localhost:14268/api/traces',
})

// Initialize OpenTelemetry SDK
const sdk = new NodeSDK({
  serviceName: 'lana-ai-service',
  serviceVersion: '1.0.0',
  traceExporter: jaegerExporter,
  instrumentations: [getNodeAutoInstrumentations({
    // Disable some instrumentations if needed
    '@opentelemetry/instrumentation-fs': {
      enabled: false,
    },
  })],
})

// Start tracing
sdk.start()

console.log('🔍 OpenTelemetry tracing initialized for AI Service')

module.exports = sdk