#include "task_manager.h"
#include "json_utils.h"
#include <algorithm>
#include <iomanip>
#include <sstream>

namespace http_server {

// Task implementation
Json::Value Task::toJson() const {
    Json::Value json;
    json["id"] = static_cast<Json::UInt64>(id);
    json["title"] = title;
    json["description"] = description;
    
    // Convert enum to string
    switch (status) {
        case TaskStatus::PENDING: json["status"] = "pending"; break;
        case TaskStatus::IN_PROGRESS: json["status"] = "in_progress"; break;
        case TaskStatus::COMPLETED: json["status"] = "completed"; break;
    }
    
    switch (priority) {
        case TaskPriority::LOW: json["priority"] = "low"; break;
        case TaskPriority::MEDIUM: json["priority"] = "medium"; break;
        case TaskPriority::HIGH: json["priority"] = "high"; break;
    }
    
    // Convert timestamps to ISO 8601 format
    auto to_iso_string = [](const std::chrono::system_clock::time_point& tp) {
        auto time_t = std::chrono::system_clock::to_time_t(tp);
        std::stringstream ss;
        ss << std::put_time(std::gmtime(&time_t), "%Y-%m-%dT%H:%M:%SZ");
        return ss.str();
    };
    
    json["created_at"] = to_iso_string(created_at);
    json["updated_at"] = to_iso_string(updated_at);
    json["due_date"] = due_date.empty() ? Json::Value::null : Json::Value(due_date);
    
    return json;
}

std::shared_ptr<Task> Task::fromJson(const Json::Value& json) {
    if (!isValidTask(json)) {
        return nullptr;
    }
    
    auto task = std::make_shared<Task>();
    task->title = json["title"].asString();
    task->description = json.get("description", "").asString();
    task->due_date = json.get("due_date", "").asString();
    
    // Parse status
    std::string status_str = json.get("status", "pending").asString();
    if (status_str == "pending") task->status = TaskStatus::PENDING;
    else if (status_str == "in_progress") task->status = TaskStatus::IN_PROGRESS;
    else if (status_str == "completed") task->status = TaskStatus::COMPLETED;
    else task->status = TaskStatus::PENDING;
    
    // Parse priority
    std::string priority_str = json.get("priority", "medium").asString();
    if (priority_str == "low") task->priority = TaskPriority::LOW;
    else if (priority_str == "medium") task->priority = TaskPriority::MEDIUM;
    else if (priority_str == "high") task->priority = TaskPriority::HIGH;
    else task->priority = TaskPriority::MEDIUM;
    
    // Set timestamps
    auto now = std::chrono::system_clock::now();
    task->created_at = now;
    task->updated_at = now;
    
    return task;
}

bool Task::isValidTask(const Json::Value& json) {
    return json.isMember("title") && 
           json["title"].isString() && 
           !json["title"].asString().empty();
}

// TaskManager implementation
TaskManager::TaskManager() : next_id_(1) {}

std::shared_ptr<Task> TaskManager::createTask(const Json::Value& taskData) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    auto task = Task::fromJson(taskData);
    if (!task) {
        return nullptr;
    }
    
    task->id = next_id_.fetch_add(1);
    tasks_[task->id] = task;
    
    return task;
}

std::shared_ptr<Task> TaskManager::getTask(uint64_t id) const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    auto it = tasks_.find(id);
    return (it != tasks_.end()) ? it->second : nullptr;
}

std::vector<std::shared_ptr<Task>> TaskManager::getAllTasks(
    const std::string& status_filter,
    const std::string& priority_filter,
    size_t limit,
    size_t offset
) const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    std::vector<std::shared_ptr<Task>> filtered_tasks;
    
    for (const auto& pair : tasks_) {
        auto task = pair.second;
        
        // Apply status filter
        if (!status_filter.empty()) {
            if (statusToString(task->status) != status_filter) {
                continue;
            }
        }
        
        // Apply priority filter
        if (!priority_filter.empty()) {
            if (priorityToString(task->priority) != priority_filter) {
                continue;
            }
        }
        
        filtered_tasks.push_back(task);
    }
    
    // Apply pagination
    if (offset >= filtered_tasks.size()) {
        return {};
    }
    
    auto start_it = filtered_tasks.begin() + offset;
    auto end_it = (offset + limit >= filtered_tasks.size()) ? 
                  filtered_tasks.end() : 
                  filtered_tasks.begin() + offset + limit;
    
    return std::vector<std::shared_ptr<Task>>(start_it, end_it);
}

std::shared_ptr<Task> TaskManager::updateTask(uint64_t id, const Json::Value& updates) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    auto it = tasks_.find(id);
    if (it == tasks_.end()) {
        return nullptr;
    }
    
    auto task = it->second;
    
    // Update fields if present
    if (updates.isMember("title") && updates["title"].isString()) {
        task->title = updates["title"].asString();
    }
    if (updates.isMember("description") && updates["description"].isString()) {
        task->description = updates["description"].asString();
    }
    if (updates.isMember("status") && updates["status"].isString()) {
        task->status = stringToStatus(updates["status"].asString());
    }
    if (updates.isMember("priority") && updates["priority"].isString()) {
        task->priority = stringToPriority(updates["priority"].asString());
    }
    if (updates.isMember("due_date") && updates["due_date"].isString()) {
        task->due_date = updates["due_date"].asString();
    }
    
    task->updated_at = std::chrono::system_clock::now();
    
    return task;
}

bool TaskManager::deleteTask(uint64_t id) {
    std::lock_guard<std::mutex> lock(mutex_);
    
    return tasks_.erase(id) > 0;
}

Json::Value TaskManager::getStatistics() const {
    std::lock_guard<std::mutex> lock(mutex_);
    
    Json::Value stats;
    stats["total"] = static_cast<Json::UInt64>(tasks_.size());
    
    // Count by status
    Json::Value by_status;
    by_status["pending"] = 0;
    by_status["in_progress"] = 0;
    by_status["completed"] = 0;
    
    // Count by priority
    Json::Value by_priority;
    by_priority["low"] = 0;
    by_priority["medium"] = 0;
    by_priority["high"] = 0;
    
    for (const auto& pair : tasks_) {
        auto task = pair.second;
        
        // Count status
        std::string status_str = statusToString(task->status);
        by_status[status_str] = by_status[status_str].asUInt() + 1;
        
        // Count priority
        std::string priority_str = priorityToString(task->priority);
        by_priority[priority_str] = by_priority[priority_str].asUInt() + 1;
    }
    
    stats["by_status"] = by_status;
    stats["by_priority"] = by_priority;
    
    return stats;
}

size_t TaskManager::getTaskCount() const {
    std::lock_guard<std::mutex> lock(mutex_);
    return tasks_.size();
}

// Helper functions
TaskStatus TaskManager::stringToStatus(const std::string& str) const {
    if (str == "pending") return TaskStatus::PENDING;
    if (str == "in_progress") return TaskStatus::IN_PROGRESS;
    if (str == "completed") return TaskStatus::COMPLETED;
    return TaskStatus::PENDING;
}

TaskPriority TaskManager::stringToPriority(const std::string& str) const {
    if (str == "low") return TaskPriority::LOW;
    if (str == "medium") return TaskPriority::MEDIUM;
    if (str == "high") return TaskPriority::HIGH;
    return TaskPriority::MEDIUM;
}

std::string TaskManager::statusToString(TaskStatus status) const {
    switch (status) {
        case TaskStatus::PENDING: return "pending";
        case TaskStatus::IN_PROGRESS: return "in_progress";
        case TaskStatus::COMPLETED: return "completed";
        default: return "pending";
    }
}

std::string TaskManager::priorityToString(TaskPriority priority) const {
    switch (priority) {
        case TaskPriority::LOW: return "low";
        case TaskPriority::MEDIUM: return "medium";
        case TaskPriority::HIGH: return "high";
        default: return "medium";
    }
}

} // namespace http_server