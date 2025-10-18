import { trace } from "@opentelemetry/api";
import { logs } from "@opentelemetry/api-logs";
import { SeverityNumber } from "@opentelemetry/api-logs";

export function getAwareLogger(name: string) {
  const logger = logs.getLogger(name);

  return {
    emit(logRecord: {
      severityNumber: SeverityNumber;
      severityText: string;
      body: string;
      attributes?: Record<string, any>;
    }) {
      const activeSpan = trace.getActiveSpan();
      const spanContext = activeSpan?.spanContext();

      logger.emit({
        ...logRecord,
        traceId: spanContext?.traceId,
        spanId: spanContext?.spanId,
        traceFlags: spanContext?.traceFlags,
      } as any);
    },
  };
}
