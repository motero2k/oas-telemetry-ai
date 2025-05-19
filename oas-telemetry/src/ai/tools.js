import { globalOasTlmConfig } from '../config.js';
import axios from 'axios';

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
    const simplifiedTraces = getSimplifiedTraces(traces);
    console.log(`Searching for traces with searchInput: ${JSON.stringify(search)}`);
    console.log(`Traces found: ${JSON.stringify(simplifiedTraces.length)}`);
    return { traces: simplifiedTraces };
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
    const simplifiedMetrics = getSimplifyMetrics(metrics);
    console.log(`Searching for metrics with searchInput: ${JSON.stringify(search)}`);
    console.log(`Metrics found: ${JSON.stringify(simplifiedMetrics.length)}`);
    return { metrics };
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

const getCurrentTimestampInEpoch = () => {
  console.log("Getting the current timestamp in epoch format...");
  const now = new Date();
  return { currentTimestampInEpoch: now.getTime() , currentTimestampInEpochSeconds: Math.floor(now.getTime() / 1000) };
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

const microserviceAgent = [
  {
    name: "Reporter",
    url: "http://localhost:3000/telemetry/chat",
  },
  {
    name: "AuthService",
    url: "http://localhost:3001/telemetry/chat",
  },
  {
    name: "RegistryService",
    url: "http://localhost:3002/telemetry/chat",
  },
  {
    name: "CollectorService",
    url: "http://localhost:3003/telemetry/chat",
  },
  {
    name: "EmailService",
    url: "http://localhost:3004/telemetry/chat",
  }
]

const talkToExternalMicroserviceAgent = async (message, microservice) => {
  console.log("talkToExternalMicroserviceAgent called with question:", message, "microservice:", microservice);
  let currentMicrosevice = microserviceAgent.find(m => m.name === microservice);
  const microserviceName = currentMicrosevice.name;
  const microserviceUrl = currentMicrosevice.url;
  const microserviceResponse = await axios.post(microserviceUrl, {
    question: message
  });
  return {
    microservice: microserviceName,
    response: microserviceResponse.data
  };
};

const getMicroserviceAgents = () => {
  console.log("Getting microservice agents...");
  return microserviceAgent;
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
        This is a NeDB query using MongoDB-like syntax (neDB). If 'searchInput' is null, all traces will be fetched.
        Providing specific filters improves performance.

        Available properties for filtering:
        {
          "name": "GET", // Name of the span
          "kind": 1, // 1 for incoming requests, 2 for outgoing requests
          "attributes": {
            "http": {
              "url": "http://localhost:3002/api/v1/greet",
              "host": "localhost:3002",
              "method": "GET",
              "scheme": "http",
              "target": "/api/v1/greet",
              "user_agent": "PostmanRuntime/7.44.0",
              "request_content_length_uncompressed": 39,
              "flavor": "1.1",
              "status_code": 200,
              "status_text": "OK"
            },
            "net": {
              "host": {
                "name": "localhost",
                "ip": "::1",
                "port": 3002
              },
              "transport": "ip_tcp",
              "peer": {
                "ip": "::1",
                "port": 50361
              }
            }
          },
          "traceId": "5f7df252eb00e873bbd6441f86b71dac",
          "spanId": "fbd8ea558dd6ac32",
          "service": "oas-telemetry-service",
          "startTime": { "0": 1747666254, "1": 333000000 },
          "endTime": { "0": 1747666254, "1": 335071700 },
          "_duration": { "0": 0, "1": 2071700 }
        }


        you can use $or, or $gte or operators like that if needed never > or similar.
        Take into account that startTime.0 and endTime.0 are in epoch SECONDS format not milliseconds.
        For time search ALWAYS use "endTime.0": { "$gte": number } or similar with other operators and startTime.0.
        Common filters include HTTP attributes (e.g., method, status code, URL), timestamps (e.g., 'endTime.0'), or duration ('_duration').
        
        Example 'query':
        {
          "attributes.http.method": "GET",
          "attributes.http.status_code": 200, //when asked for ANY error you can use $gte : 400 operator
          "attributes.http.url": "http://localhost:3002/api/v1/greet",
          "_duration": { "$lte": 5000000 },
          "endTime.0": { "$gte": 1747666254 },
        }
        you must give a {searchInput: query} object to the function
        
        `,
      parameters: {
        type: "object",
        properties: {
          searchInput: {
            type: "object",
            description: `Optional search criteria for filtering traces. 
              This is a NeDB query using MongoDB-like (neDB) syntax. 
              For example, you can filter by HTTP attributes, timestamps, or duration. 
              If null, all traces will be returned.`,
            additionalProperties: true
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
        This is a NeDB query using MongoDB-like (NeDB) syntax. If 'searchInput' is null, all metrics will be fetched. Providing specific filters improves performance.
        
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
              This is a NeDB query using MongoDB-like (NeDB) syntax. 
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
  },
  {
    type: "function",
    function: {
      name: "getCurrentTimestampInEpoch",
      description: `Retrieves the current timestamp in epoch format (miliseconds or seconds). 
        This function calculates the timestamp for the current moment in milliseconds since the Unix epoch.in .currentTimestampInEpoch. Also returns the current timestamp in seconds in .currentTimestampInEpochSeconds.`,
      parameters: {}
    }
  },
  {
    type: "function",
    function: {
      name: "talkToExternalMicroserviceAgent",
      description: `Use this function to communicate with external microservice agent.
        if you want to talk to a microservice agent, you must provide the message and the microservice you want to talk to.  
        When you call this function, it will send the message to the specified microservice and return the response.

        Example 'message':
        {
          "message": "What is the status of the service?",
          "microservice": "Reporter"
        }

        Microservices Availables:
        ${microserviceAgent.map(m => m.name).join(", ")}
        `,
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: `The message to be sent to the external microservice agent.`
          },
          microservice: {
            type: "string"
          }
        },
        required: ["message", "microservice"]
      }
    }
  },
  {
    type: "function",
    function: {
      name: "getMicroserviceAgents",
      description: `Retrieves the list of available microservice agents. 
        This function provides information about the microservices that can be communicated with.`,
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
  getTelemetryStatus,
  getCurrentTimestampInEpoch,
  talkToExternalMicroserviceAgent,
  getMicroserviceAgents
};

export {
  tools,
  availableTools,
};



const getSimplifyMetrics = (metrics) => {
  const simplifiedMetrics = metrics.map(item => {
    const cpuCount = item.cpuUsageData.length;

    const totalCpuPercentages = item.cpuUsageData.reduce((acc, cpu) => {
      acc.user += cpu.userP;
      acc.system += cpu.systemP;
      acc.idle += cpu.idleP;
      return acc;
    }, { user: 0, system: 0, idle: 0 });

    const avgCpuUsage = {
      userP: (totalCpuPercentages.user / cpuCount).toFixed(4),
      systemP: (totalCpuPercentages.system / cpuCount).toFixed(4),
      idleP: (totalCpuPercentages.idle / cpuCount).toFixed(4)
    };

    return {
      timestamp: item.timestamp,
      cpuCount,
      avgCpuUsage,
      cpuUsageByCore: item.cpuUsageData.map(cpu => ({
        cpu: cpu.cpuNumber,
        userP: cpu.userP,
        systemP: cpu.systemP,
        idleP: cpu.idleP
      })),
      memoryUsage: {
        usedBytes: item.memoryData.used,
        freeBytes: item.memoryData.free,
        usedP: item.memoryData.usedP.toFixed(4),
        freeP: item.memoryData.freeP.toFixed(4)
      },
      processCpuUsage: {
        totalP: (item.processCpuUsageData.userP + item.processCpuUsageData.systemP).toFixed(4)
      },
      processMemoryBytes: item.processMemoryData
    };
  });
  return simplifiedMetrics;
}



function getSimplifiedTraces(spans) {
  return spans.map(span => {
    return {
      name: span.name,
      kind: span.kind,
      attributes: span.attributes,
      resource: span.resource,
      _spanContext: span._spanContext,
      startTime: span.startTime,
      endTime: span.endTime,
      _duration: span._duration
        };
      });
}