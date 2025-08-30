#pragma once

#include <string>
#include <vector>
#include <unordered_map>
#include <memory>
#include <atomic>
#include <mutex>
#include <chrono>
#include <json/json.h>

namespace http_server {

enum class TaskStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED
};

enum class TaskPriority {
    LOW,
    MEDIUM,
    HIGH
};

struct Task {
    uint64_t id;
    std::string title;
    std::string description;
    TaskStatus status;
    TaskPriority priority;
    std::chrono::system_clock::time_point created_at;
    std::chrono::system_clock::time_point updated_at;
    std::string due_date;

    Json::Value toJson() const;
    static std::shared_ptr<Task> fromJson(const Json::Value& json);
    static bool isValidTask(const Json::Value& json);
};

class TaskManager {
public:
    TaskManager();
    ~TaskManager() = default;

    // Task CRUD operations
    std::shared_ptr<Task> createTask(const Json::Value& taskData);

    // Reserved for future HTTP server implementation
    /*
    std::shared_ptr<Task> getTask(uint64_t id) const;
    std::vector<std::shared_ptr<Task>> getAllTasks(
        const std::string& status_filter = "",
        const std::string& priority_filter = "",
        size_t limit = 10,
        size_t offset = 0
    ) const;

    std::shared_ptr<Task> updateTask(uint64_t id, const Json::Value& updates);
    bool deleteTask(uint64_t id);
    */

    // Statistics
    Json::Value getStatistics() const;
    size_t getTaskCount() const;

    // Thread safety
    // std::mutex& getMutex() const { return mutex_; }  // Reserved for future HTTP server implementation

private:
    mutable std::mutex mutex_;
    std::unordered_map<uint64_t, std::shared_ptr<Task>> tasks_;
    std::atomic<uint64_t> next_id_;

    // Helper functions
    std::string statusToString(TaskStatus status) const;
    std::string priorityToString(TaskPriority priority) const;

    // Reserved for future HTTP server implementation
    /*
    TaskStatus stringToStatus(const std::string& str) const;
    TaskPriority stringToPriority(const std::string& str) const;
    */
};

} // namespace http_server
