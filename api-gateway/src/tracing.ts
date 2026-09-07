import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { ZipkinExporter } from '@opentelemetry/exporter-zipkin';

const defaultZipkinUrl = Buffer.from('aHR0cDovL3ppcGtpbjo5NDExL2FwaS92Mi9zcGFucw==', 'base64').toString('utf8');

const sdk = new NodeSDK({
    serviceName: 'api-gateway',
    traceExporter: new ZipkinExporter({
        url: process.env.ZIPKIN_URL || defaultZipkinUrl,
    }),
    instrumentations: [getNodeAutoInstrumentations()],
});

sdk.start();

process.on('SIGTERM', () => {
    sdk.shutdown()
        .then(() => console.log('Tracing terminated'))
        .catch((error) => console.log('Error terminating tracing', error))
        .finally(() => process.exit(0));
});
