"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const sdk_node_1 = require("@opentelemetry/sdk-node");
const auto_instrumentations_node_1 = require("@opentelemetry/auto-instrumentations-node");
const exporter_zipkin_1 = require("@opentelemetry/exporter-zipkin");
const sdk = new sdk_node_1.NodeSDK({
    serviceName: 'api-gateway',
    traceExporter: new exporter_zipkin_1.ZipkinExporter({
        url: process.env.ZIPKIN_URL || 'http://zipkin:9411/api/v2/spans',
    }),
    instrumentations: [(0, auto_instrumentations_node_1.getNodeAutoInstrumentations)()],
});
sdk.start();
process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
//# sourceMappingURL=tracing.js.map