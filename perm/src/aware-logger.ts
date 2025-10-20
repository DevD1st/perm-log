import { trace } from "@opentelemetry/api";
import { LogRecord, logs } from "@opentelemetry/api-logs";
import { SeverityNumber } from "@opentelemetry/api-logs";

export function getAwareLogger(name: string) {
  const logger = logs.getLogger(name);

  return {
    emit(logRecord: LogRecord) {
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
