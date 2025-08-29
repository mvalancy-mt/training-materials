#pragma once

#include <json/json.h>
#include <chrono>
#include <string>

namespace http_server {

class HealthCheck {
public:
    HealthCheck();
    ~HealthCheck() = default;
    
    // Health check endpoints
    Json::Value getHealthStatus() const;
    Json::Value getReadinessStatus() const;
    Json::Value getLivenessStatus() const;
    
    // System metrics
    Json::Value getSystemMetrics() const;
    
private:
    std::chrono::system_clock::time_point startup_time_;
    
    // Helper functions
    std::string getCurrentTimestamp() const;
    double getUptimeSeconds() const;
    Json::Value getMemoryInfo() const;
    Json::Value getCpuInfo() const;
};

} // namespace http_server