import "@opentelemetry/context-async-hooks";
import { NodeSDK } from "@opentelemetry/sdk-node";
import { resourceFromAttributes } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { getNodeAutoInstrumentations } from "@opentelemetry/auto-instrumentations-node";
import {
  BatchSpanProcessor,
  ConsoleSpanExporter,
  SimpleSpanProcessor,
} from "@opentelemetry/sdk-trace-base";
import {
  BatchLogRecordProcessor,
  ConsoleLogRecordExporter,
} from "@opentelemetry/sdk-logs";
import {
  ConsoleMetricExporter,
  PeriodicExportingMetricReader,
} from "@opentelemetry/sdk-metrics";
import { W3CTraceContextPropagator } from "@opentelemetry/core";

export function instrumentTelemetry() {
  const resource = resourceFromAttributes({
    [ATTR_SERVICE_NAME]: "perm-service",
  });

  const traceExporter = new ConsoleSpanExporter();
  const logExporter = new ConsoleLogRecordExporter();
  const metricExporter = new ConsoleMetricExporter();

  const sdk = new NodeSDK({
    resource,
    instrumentations: [getNodeAutoInstrumentations()],
    traceExporter,
    spanProcessor: new SimpleSpanProcessor(traceExporter),
    logRecordProcessor: new BatchLogRecordProcessor(logExporter),
    metricReader: new PeriodicExportingMetricReader({
      exporter: metricExporter,
      exportIntervalMillis: 20_000,
    }),
    textMapPropagator: new W3CTraceContextPropagator(),
  });

  sdk.start();

  process.on("SIGTERM", async () => {
    await sdk.shutdown();
  });
}
