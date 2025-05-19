// mockData.js
export const tracesMock = [
    { id: 1, timestamp: '2025-05-15T10:00:00Z', operation: 'GET /users', duration: 120 },
    { id: 2, timestamp: '2025-05-15T10:01:00Z', operation: 'POST /orders', duration: 250 },
    { id: 3, timestamp: '2025-05-15T10:02:00Z', operation: 'GET /products', duration: 180 },
    { id: 4, timestamp: '2025-05-15T10:03:00Z', operation: 'DELETE /cart', duration: 90 },
    { id: 5, timestamp: '2025-05-15T10:04:00Z', operation: 'PUT /users/123', duration: 200 },
  ];
  
  export const logsMock = [
    { id: 1, level: 'info', message: 'Servicio iniciado correctamente', timestamp: '2025-05-15T09:00:00Z' },
    { id: 2, level: 'error', message: 'Error al conectar a base de datos', timestamp: '2025-05-15T10:05:00Z' },
    { id: 3, level: 'warn', message: 'Respuesta lenta en endpoint /orders', timestamp: '2025-05-15T10:06:00Z' },
    { id: 4, level: 'error', message: 'Timeout en petición a /products', timestamp: '2025-05-15T10:07:00Z' },
    { id: 5, level: 'info', message: 'Usuario autenticado', timestamp: '2025-05-15T10:08:00Z' },
  ];
  
  export const metricsMock = [
    { name: 'cpu_usage', value: 75, unit: '%' },
    { name: 'memory_usage', value: 65, unit: '%' },
    { name: 'request_count', value: 1500, unit: 'count' },
    { name: 'error_rate', value: 5, unit: '%' },
    { name: 'latency', value: 120, unit: 'ms' },
  ];