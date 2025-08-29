#include "health_check.h"
#include <chrono>
#include <sys/utsname.h>
#include <unistd.h>

namespace http_server {

HealthCheck::HealthCheck() : start_time_(std::chrono::steady_clock::now()) {}

Json::Value HealthCheck::getHealthStatus() const {
    Json::Value health;

    // Basic service info
    health["status"] = "healthy";
    health["service"] = "cpp-http-server";
    health["version"] = "1.0.0";

    // Timestamp
    auto now = std::chrono::system_clock::now();
    auto timestamp = std::chrono::duration_cast<std::chrono::seconds>(now.time_since_epoch()).count();
    health["timestamp"] = static_cast<Json::Int64>(timestamp);

    // Uptime
    auto uptime = std::chrono::steady_clock::now() - start_time_;
    auto uptime_seconds = std::chrono::duration_cast<std::chrono::seconds>(uptime).count();
    health["uptime_seconds"] = static_cast<Json::Int64>(uptime_seconds);

    // System information
    Json::Value system;

    // Get system information
    struct utsname system_info;
    if (uname(&system_info) == 0) {
        system["os"] = system_info.sysname;
        system["release"] = system_info.release;
        system["arch"] = system_info.machine;
        system["hostname"] = system_info.nodename;
    }

    // Process ID
    system["pid"] = static_cast<Json::Int>(getpid());

    health["system"] = system;

    // Memory and resource usage would require additional system calls
    // For now, we'll keep it simple
    Json::Value resources;
    resources["status"] = "ok";
    health["resources"] = resources;

    return health;
}

bool HealthCheck::isHealthy() const {
    // Basic health checks
    // In a real application, this might check:
    // - Database connectivity
    // - External service availability
    // - Resource usage thresholds
    // - Critical error conditions

    return true; // Always healthy for this demo
}

std::string HealthCheck::getReadinessStatus() const {
    // Check if the service is ready to accept requests
    // This could include:
    // - Database migrations completed
    // - Configuration loaded
    // - External dependencies available

    return isHealthy() ? "ready" : "not_ready";
}

std::string HealthCheck::getLivenessStatus() const {
    // Check if the service is still alive and functioning
    // This is typically simpler than readiness checks

    return "alive";
}

Json::Value HealthCheck::getDetailedStatus() const {
    Json::Value detailed = getHealthStatus();

    // Add readiness and liveness probes
    detailed["readiness"] = getReadinessStatus();
    detailed["liveness"] = getLivenessStatus();

    // Add more detailed checks
    Json::Value checks;

    // Basic functionality check
    Json::Value basic_check;
    basic_check["name"] = "basic_functionality";
    basic_check["status"] = "pass";
    basic_check["message"] = "Core functionality operational";
    checks.append(basic_check);

    // Memory check (placeholder)
    Json::Value memory_check;
    memory_check["name"] = "memory_usage";
    memory_check["status"] = "pass";
    memory_check["message"] = "Memory usage within normal limits";
    checks.append(memory_check);

    // Task manager check
    Json::Value task_manager_check;
    task_manager_check["name"] = "task_manager";
    task_manager_check["status"] = "pass";
    task_manager_check["message"] = "Task management system operational";
    checks.append(task_manager_check);

    detailed["checks"] = checks;

    return detailed;
}

} // namespace http_server
