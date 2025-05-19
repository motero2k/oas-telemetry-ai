export class InMemoryLogExporter {
  constructor() {
    this.logs = [];
  }

  log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    this.logs.push({ timestamp, level, message });
  }

  getLogs(startDate, endDate) {
    if (!startDate && !endDate) {
      return this.logs;
    }

    const start = startDate ? new Date(startDate).getTime() : -Infinity;
    const end = endDate ? new Date(endDate).getTime() : Infinity;

    return this.logs.filter(log => {
      const logTime = new Date(log.timestamp).getTime();
      return logTime >= start && logTime <= end;
    });
  }

  clearLogs() {
    this.logs = [];
  }
}

export default InMemoryLogExporter;
