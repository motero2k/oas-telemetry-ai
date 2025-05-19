import { globalOasTlmConfig } from '../config.js';

const getTraces = async (searchInput) => {
  console.log("getTraces called with searchInput:", searchInput);
  try {
    const search = searchInput || {};
    const traces = await new Promise((resolve, reject) => {
      globalOasTlmConfig.dynamicExporter.exporter.find(search, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    return { traces };
  } catch (error) {
    console.error('Error fetching traces:', error);
    throw error;
  }
};

const getLogs = async (startDate, endDate) => {
  console.log("getLogs called with startDate:", startDate, "endDate:", endDate);
  try {
    const logs = globalOasTlmConfig.logExporter.getLogs(startDate, endDate);
    return { logs };
  } catch (error) {
    console.error('Error fetching logs:', error);
    throw error;
  }
};

const getMetrics = async (searchInput) => {
  console.log("getMetrics called with searchInput:", searchInput);
  try {
    const search = searchInput || {};
    const metrics = await new Promise((resolve, reject) => {
      globalOasTlmConfig.metricsExporter.find(search, (err, docs) => {
        if (err) reject(err);
        else resolve(docs);
      });
    });
    const fakeMetrics = {
      timestamp: 1747651105757,
      cpuUsageData: 20,
      memoryData: 30
    };
    return { metrics: fakeMetrics };

    // return { metrics };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

const tools = [
  {
    type: "function",
    function: {
      name: "getTraces",
      description: `Fetches trace data for the microservice. 
        Traces provide detailed information about requests and their lifecycle, including HTTP attributes (e.g., URL, method, status code), 
        network details (e.g., peer IP, port), and timing information. 
        The 'searchInput' parameter is an object used to filter traces based on specific criteria. 
        This is a NeDB query using MongoDB-like syntax. If 'searchInput' is null, all traces will be fetched. Providing specific filters improves performance.
        
        Example 'searchInput':
        {
          "attributes.http.method": "GET",
          "$or": [
            { "attributes.http.status_code": 200 },
            { "attributes.http.status_code": 304 }
          ]
        }
        
        Common filters include timestamps or 'attributes.http.url'.`,
      parameters: {
        type: "object",
        properties: {
          searchInput: { 
            type: "object", 
            description: `Optional search criteria for filtering traces. 
              This is a NeDB query using MongoDB-like syntax. 
              For example, you can filter by HTTP method, status code, or timestamps. 
              If null, all traces will be returned.`,
            properties: {
              "attributes.http.method": { type: "string" },
              "$or": {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    "attributes.http.status_code": { type: "integer" }
                  }
                }
              },
              "attributes.http.url": { type: "string" },
              "timestamp": { type: "object", properties: { "$gte": { type: "integer" }, "$lte": { type: "integer" } } }
            }
          }
        },
        required: ["searchInput"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getLogs",
      description: `Fetches log data for the microservice. 
        Logs provide information about system events, including timestamps, log levels (e.g., info, error), and messages. 
        The 'startDate' and 'endDate' parameters define the time range for fetching logs. 
        If both are null, all logs will be fetched. Providing a date range improves performance.
        
        Example logs:
        [
          {
            "timestamp": "2025-05-19T10:22:56.464Z",
            "level": "info",
            "message": "CollectorService returned data for all guarantees successfully."
          },
          {
            "timestamp": "2025-05-19T10:22:56.467Z",
            "level": "info",
            "message": "Report complete, sending email to user."
          }
        ]`,
      parameters: {
        type: "object",
        properties: {
          startDate: { 
            type: "string", 
            format: "date-time", 
            description: `Start date for the log query in ISO 8601 format. 
              For example, '2025-05-19T10:22:56.464Z'. If null, logs from the earliest available time will be fetched.` 
          },
          endDate: { 
            type: "string", 
            format: "date-time", 
            description: `End date for the log query in ISO 8601 format. 
              For example, '2025-05-19T10:22:56.467Z'. If null, logs up to the latest available time will be fetched.` 
          }
        },
        required: ["startDate", "endDate"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getMetrics",
      description: `Fetches metrics data for the microservice. 
        Metrics provide performance-related data, such as CPU usage, memory usage, and process-specific metrics. 
        The 'searchInput' parameter is an object used to filter metrics based on specific criteria. 
        This is a NeDB query using MongoDB-like syntax. If 'searchInput' is null, all metrics will be fetched. Providing specific filters improves performance.
        
        Example 'searchInput':
        {
          "timestamp": { "$gte": 1747651105757, "$lte": 1747651200935 }
        }
        
        Common filters include timestamps.`,
      parameters: {
        type: "object",
        properties: {
          searchInput: { 
            type: "object", 
            description: `Optional search criteria for filtering metrics. 
              This is a NeDB query using MongoDB-like syntax. 
              For example, you can filter by timestamps. 
              If null, all metrics will be returned.`,
            properties: {
              "timestamp": { type: "object", properties: { "$gte": { type: "integer" }, "$lte": { type: "integer" } } },
              "cpuUsageData.cpuNumber": { type: "string" },
              "memoryData.used": { type: "integer" }
            }
          }
        },
        required: ["searchInput"]
      }
    }
  }
];

const availableTools = {
  getTraces,
  getLogs,
  getMetrics
};

export { 
    tools, 
    availableTools, 
};