import { BatchLogRecordProcessor } from "@opentelemetry/sdk-logs";
import { PeriodicExportingMetricReader } from "@opentelemetry/sdk-metrics";
import {
  BatchSpanProcessor,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { W3CTraceContextPropagator } from "@opentelemetry/core";
import { OTLPMetricExporter } from "@opentelemetry/exporter-metrics-otlp-http";
import { OTLPLogExporter } from "@opentelemetry/exporter-logs-otlp-http";
import { OTLPTraceExporter } from "@opentelemetry/exporter-trace-otlp-http";

const ALLOY_URL = "http://alloy.monitoring.svc.cluster.local:12345";

export default function instrumentTelemetry() {
  const metricExporter = new OTLPMetricExporter({
    url: `${ALLOY_URL}/v1/metrics`,
  });
  const logExporter = new OTLPLogExporter({
    url: `${ALLOY_URL}/v1/logs`,
  });
  const traceExporter = new OTLPTraceExporter({
    url: `${ALLOY_URL}/v1/traces`,
  });

  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "log-service",
  });

  const sdk = new NodeSDK({
    resource,
    instrumentations: [getNodeAutoInstrumentations()],
    traceExporter,
    spanProcessor: new BatchSpanProcessor(traceExporter),
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 20_000,
    }),
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    textMapPropagator: new W3CTraceContextPropagator(),
  });

  sdk.start();

  process.on("SIGTERM", async () => {
    await sdk.shutdown();
  });
}
