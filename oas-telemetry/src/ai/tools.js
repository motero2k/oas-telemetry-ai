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
    return { metrics };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

const startTelemetry = () => {
  console.log("Starting telemetry...");
  globalOasTlmConfig.dynamicExporter.exporter.start();
}

const stopTelemetry = () => {
  console.log("Stopping telemetry...");
  globalOasTlmConfig.dynamicExporter.exporter.stop();
}

const resetTelemetry = () => {
  console.log("Resetting telemetry...");
  globalOasTlmConfig.dynamicExporter.exporter.reset();
}

const getTelemetryStatus = () => {
  console.log("Getting telemetry status...");
  const isRunning = globalOasTlmConfig.dynamicExporter.exporter.isRunning() || false;
  return { active: isRunning };
}


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
        If don't provide a range, all logs will be fetched. Providing a specific range improves performance.
        Example 'startDate' and 'endDate':
        {
          "startDate": "2023-10-01T00:00:00Z",
          "endDate": "2023-10-02T00:00:00Z"
        }
        Common filters include timestamps or log levels.`,
      parameters: {
        type: "object",
        properties: {
          startDate: { 
            type: "string"
          },
          endDate: { 
            type: "string"
          }
        },
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
  },
  {
    type: "function",
    function: {
      name: "startTelemetry",
      description: `Starts the telemetry data collection process. 
        This function initializes the telemetry system and begins capturing trace, log, and metric data.`,
      parameters: {}
    }
  },
  {
    type: "function",
    function: {
      name: "stopTelemetry",
      description: `Stops the telemetry data collection process. 
        This function halts the telemetry system and stops capturing trace, log, and metric data.`,
      parameters: {}
    }
  },
  {
    type: "function",
    function: {
      name: "resetTelemetry",
      description: `Resets the telemetry data collection process. 
        This function clears any existing telemetry data and prepares the system for a fresh start.`,
      parameters: {}
    }
  },
  {
    type: "function",
    function: {
      name: "getTelemetryStatus",
      description: `Retrieves the current status of the telemetry system. 
        This function checks whether the telemetry system is currently active or inactive.`,
      parameters: {}
    }
  }
];

const availableTools = {
  getTraces,
  getLogs,
  getMetrics,
  startTelemetry,
  stopTelemetry,
  resetTelemetry,
  getTelemetryStatus
};

export { 
    tools, 
    availableTools, 
};