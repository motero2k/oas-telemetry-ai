import { metrics } from "@opentelemetry/api";
import DynamicExporter from "./exporters/dynamicExporter.js";
import { InMemoryDBMetricsExporter } from "./exporters/InMemoryDBMetricsExporter.js";
import { InMemoryLogExporter } from "./exporters/InMemoryLogExporter.js";

//Environment variables
//OASTLM_MODULE_DISABLED = 'true' //Disables the module (empty middleware and no tracing)

export const globalOasTlmConfig = {
    dynamicExporter: new DynamicExporter(),
    metricsExporter: new InMemoryDBMetricsExporter(),
    logExporter: new InMemoryLogExporter(), // Add log exporter
    systemMetricsInterval: 1000 * 5, // 5 seconds
    baseURL: "/telemetry",
    spec: null,
    specFileName: "",
    autoActivate: true,
    authEnabled: false,
    apiKeyMaxAge: 1000 * 60 * 60, // 1 hour
    password: "oas-telemetry-password",
    jwtSecret: "oas-telemetry-secret",
};
//5 name alternatives. one for globals 

export default {globalOasTlmConfig}