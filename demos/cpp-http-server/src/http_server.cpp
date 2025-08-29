#include "http_server.h"
#include "task_manager.h"
#include "health_check.h"
#include "json_utils.h"
#include <iostream>
#include <sstream>
#include <cstring>
#include <algorithm>

namespace http_server {

HttpServer::HttpServer(int port) : port_(port), daemon_(nullptr), task_manager_(std::make_unique<TaskManager>()) {}

HttpServer::~HttpServer() {
    stop();
}

bool HttpServer::start() {
    daemon_ = MHD_start_daemon(
        MHD_USE_THREAD_PER_CONNECTION | MHD_USE_INTERNAL_POLLING_THREAD,
        port_,
        nullptr, nullptr,
        &HttpServer::requestHandler, this,
        MHD_OPTION_END
    );

    return daemon_ != nullptr;
}

void HttpServer::stop() {
    if (daemon_) {
        MHD_stop_daemon(daemon_);
        daemon_ = nullptr;
    }
}

bool HttpServer::isRunning() const {
    return daemon_ != nullptr;
}

MHD_Result HttpServer::requestHandler(void* cls, struct MHD_Connection* connection,
                                     const char* url, const char* method,
                                     const char* version, const char* upload_data,
                                     size_t* upload_data_size, void** con_cls) {

    HttpServer* server = static_cast<HttpServer*>(cls);
    return server->handleRequest(connection, url, method, version, upload_data, upload_data_size, con_cls);
}

MHD_Result HttpServer::handleRequest(struct MHD_Connection* connection, const char* url,
                                   const char* method, const char* version,
                                   const char* upload_data, size_t* upload_data_size,
                                   void** con_cls) {

    // Handle CORS preflight
    if (std::strcmp(method, "OPTIONS") == 0) {
        return sendCORSResponse(connection);
    }

    // Route requests
    std::string path(url);
    std::string http_method(method);

    if (path == "/health") {
        return handleHealthCheck(connection);
    } else if (path == "/docs" || path == "/") {
        return handleDocumentation(connection);
    } else if (path.find("/api/v1/tasks") == 0) {
        return handleTasksAPI(connection, path, http_method, upload_data, upload_data_size, con_cls);
    }

    // 404 Not Found
    return sendErrorResponse(connection, 404, "Not Found");
}

MHD_Result HttpServer::handleHealthCheck(struct MHD_Connection* connection) {
    Json::Value response;
    response["status"] = "healthy";
    response["service"] = "cpp-http-server";
    response["version"] = "1.0.0";
    response["timestamp"] = std::chrono::duration_cast<std::chrono::seconds>(
        std::chrono::system_clock::now().time_since_epoch()).count();

    std::string json_response = json_utils::jsonToString(response);
    return sendJSONResponse(connection, json_response, 200);
}

MHD_Result HttpServer::handleDocumentation(struct MHD_Connection* connection) {
    std::string html = R"(
<!DOCTYPE html>
<html>
<head>
    <title>C++ HTTP Server - Task Management API</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; }
        .endpoint { background: #f5f5f5; padding: 15px; margin: 10px 0; border-radius: 5px; }
        .method { font-weight: bold; color: #2196F3; }
        code { background: #e8e8e8; padding: 2px 4px; border-radius: 3px; }
    </style>
</head>
<body>
    <h1>🚀 C++ HTTP Server - Task Management API</h1>
    <p>High-performance C++ HTTP server with comprehensive CI/CD pipeline</p>

    <h2>📋 Available Endpoints</h2>

    <div class="endpoint">
        <div class="method">GET /health</div>
        <p>Health check endpoint - returns server status</p>
    </div>

    <div class="endpoint">
        <div class="method">GET /api/v1/tasks</div>
        <p>Get all tasks with optional filtering</p>
        <p>Query parameters: <code>status</code>, <code>priority</code>, <code>limit</code>, <code>offset</code></p>
    </div>

    <div class="endpoint">
        <div class="method">POST /api/v1/tasks</div>
        <p>Create a new task</p>
        <p>Body: <code>{"title": "string", "description": "string", "priority": "low|medium|high"}</code></p>
    </div>

    <div class="endpoint">
        <div class="method">GET /api/v1/tasks/{id}</div>
        <p>Get specific task by ID</p>
    </div>

    <div class="endpoint">
        <div class="method">PUT /api/v1/tasks/{id}</div>
        <p>Update specific task</p>
        <p>Body: <code>{"title": "string", "status": "pending|in_progress|completed", ...}</code></p>
    </div>

    <div class="endpoint">
        <div class="method">DELETE /api/v1/tasks/{id}</div>
        <p>Delete specific task</p>
    </div>

    <div class="endpoint">
        <div class="method">GET /api/v1/tasks/stats</div>
        <p>Get task statistics</p>
    </div>

    <h2>🔧 Example Usage</h2>
    <pre><code>
# Create a task
curl -X POST http://localhost:8080/api/v1/tasks \
  -H "Content-Type: application/json" \
  -d '{"title": "Deploy to production", "priority": "high"}'

# Get all tasks
curl http://localhost:8080/api/v1/tasks

# Check health
curl http://localhost:8080/health
    </code></pre>
</body>
</html>)";

    return sendHTMLResponse(connection, html);
}

MHD_Result HttpServer::handleTasksAPI(struct MHD_Connection* connection, const std::string& path,
                                     const std::string& method, const char* upload_data,
                                     size_t* upload_data_size, void** con_cls) {

    if (method == "GET") {
        if (path == "/api/v1/tasks") {
            return handleGetAllTasks(connection);
        } else if (path == "/api/v1/tasks/stats") {
            return handleGetTaskStats(connection);
        } else {
            // Extract task ID from path like /api/v1/tasks/123
            auto id_pos = path.find("/api/v1/tasks/");
            if (id_pos == 0) {
                std::string id_str = path.substr(14);
                if (!id_str.empty() && id_str != "stats") {
                    try {
                        uint64_t id = std::stoull(id_str);
                        return handleGetTask(connection, id);
                    } catch (...) {
                        return sendErrorResponse(connection, 400, "Invalid task ID");
                    }
                }
            }
        }
    } else if (method == "POST" && path == "/api/v1/tasks") {
        return handleCreateTask(connection, upload_data, upload_data_size, con_cls);
    } else if (method == "PUT") {
        // Extract task ID for PUT requests
        auto id_pos = path.find("/api/v1/tasks/");
        if (id_pos == 0) {
            std::string id_str = path.substr(14);
            if (!id_str.empty()) {
                try {
                    uint64_t id = std::stoull(id_str);
                    return handleUpdateTask(connection, id, upload_data, upload_data_size, con_cls);
                } catch (...) {
                    return sendErrorResponse(connection, 400, "Invalid task ID");
                }
            }
        }
    } else if (method == "DELETE") {
        // Extract task ID for DELETE requests
        auto id_pos = path.find("/api/v1/tasks/");
        if (id_pos == 0) {
            std::string id_str = path.substr(14);
            if (!id_str.empty()) {
                try {
                    uint64_t id = std::stoull(id_str);
                    return handleDeleteTask(connection, id);
                } catch (...) {
                    return sendErrorResponse(connection, 400, "Invalid task ID");
                }
            }
        }
    }

    return sendErrorResponse(connection, 404, "Endpoint not found");
}

MHD_Result HttpServer::handleGetAllTasks(struct MHD_Connection* connection) {
    // TODO: Parse query parameters for filtering
    auto tasks = task_manager_->getAllTasks();

    Json::Value response(Json::arrayValue);
    for (const auto& task : tasks) {
        response.append(task->toJson());
    }

    std::string json_response = json_utils::jsonToString(response, true);
    return sendJSONResponse(connection, json_response);
}

MHD_Result HttpServer::handleGetTask(struct MHD_Connection* connection, uint64_t id) {
    auto task = task_manager_->getTask(id);
    if (!task) {
        return sendErrorResponse(connection, 404, "Task not found");
    }

    std::string json_response = json_utils::jsonToString(task->toJson(), true);
    return sendJSONResponse(connection, json_response);
}

MHD_Result HttpServer::handleCreateTask(struct MHD_Connection* connection, const char* upload_data,
                                       size_t* upload_data_size, void** con_cls) {

    // Handle request body reading
    if (*con_cls == nullptr) {
        // First call - allocate connection state
        *con_cls = new std::string();
        return MHD_YES;
    }

    std::string* request_body = static_cast<std::string*>(*con_cls);

    if (*upload_data_size > 0) {
        // Append data to request body
        request_body->append(upload_data, *upload_data_size);
        *upload_data_size = 0;
        return MHD_YES;
    }

    // Parse JSON and create task
    Json::Value task_data = json_utils::parseJson(*request_body);
    delete request_body;
    *con_cls = nullptr;

    if (task_data.isNull()) {
        return sendErrorResponse(connection, 400, "Invalid JSON");
    }

    auto task = task_manager_->createTask(task_data);
    if (!task) {
        return sendErrorResponse(connection, 400, "Failed to create task");
    }

    std::string json_response = json_utils::jsonToString(task->toJson(), true);
    return sendJSONResponse(connection, json_response, 201);
}

MHD_Result HttpServer::handleUpdateTask(struct MHD_Connection* connection, uint64_t id,
                                       const char* upload_data, size_t* upload_data_size,
                                       void** con_cls) {

    // Handle request body reading (similar to create)
    if (*con_cls == nullptr) {
        *con_cls = new std::string();
        return MHD_YES;
    }

    std::string* request_body = static_cast<std::string*>(*con_cls);

    if (*upload_data_size > 0) {
        request_body->append(upload_data, *upload_data_size);
        *upload_data_size = 0;
        return MHD_YES;
    }

    // Parse JSON and update task
    Json::Value updates = json_utils::parseJson(*request_body);
    delete request_body;
    *con_cls = nullptr;

    if (updates.isNull()) {
        return sendErrorResponse(connection, 400, "Invalid JSON");
    }

    auto task = task_manager_->updateTask(id, updates);
    if (!task) {
        return sendErrorResponse(connection, 404, "Task not found");
    }

    std::string json_response = json_utils::jsonToString(task->toJson(), true);
    return sendJSONResponse(connection, json_response);
}

MHD_Result HttpServer::handleDeleteTask(struct MHD_Connection* connection, uint64_t id) {
    bool deleted = task_manager_->deleteTask(id);
    if (!deleted) {
        return sendErrorResponse(connection, 404, "Task not found");
    }

    Json::Value response;
    response["message"] = "Task deleted successfully";
    response["id"] = static_cast<Json::UInt64>(id);

    std::string json_response = json_utils::jsonToString(response);
    return sendJSONResponse(connection, json_response);
}

MHD_Result HttpServer::handleGetTaskStats(struct MHD_Connection* connection) {
    auto stats = task_manager_->getStatistics();
    std::string json_response = json_utils::jsonToString(stats, true);
    return sendJSONResponse(connection, json_response);
}

MHD_Result HttpServer::sendJSONResponse(struct MHD_Connection* connection, const std::string& json, int status_code) {
    struct MHD_Response* response = MHD_create_response_from_buffer(
        json.length(), const_cast<char*>(json.c_str()), MHD_RESPMEM_MUST_COPY);

    MHD_add_response_header(response, "Content-Type", "application/json");
    addCORSHeaders(response);

    MHD_Result ret = MHD_queue_response(connection, status_code, response);
    MHD_destroy_response(response);

    return ret;
}

MHD_Result HttpServer::sendHTMLResponse(struct MHD_Connection* connection, const std::string& html) {
    struct MHD_Response* response = MHD_create_response_from_buffer(
        html.length(), const_cast<char*>(html.c_str()), MHD_RESPMEM_MUST_COPY);

    MHD_add_response_header(response, "Content-Type", "text/html");
    addCORSHeaders(response);

    MHD_Result ret = MHD_queue_response(connection, 200, response);
    MHD_destroy_response(response);

    return ret;
}

MHD_Result HttpServer::sendErrorResponse(struct MHD_Connection* connection, int status_code, const std::string& message) {
    Json::Value error;
    error["error"] = message;
    error["status"] = status_code;

    std::string json_response = json_utils::jsonToString(error);
    return sendJSONResponse(connection, json_response, status_code);
}

MHD_Result HttpServer::sendCORSResponse(struct MHD_Connection* connection) {
    struct MHD_Response* response = MHD_create_response_from_buffer(0, nullptr, MHD_RESPMEM_PERSISTENT);
    addCORSHeaders(response);

    MHD_Result ret = MHD_queue_response(connection, 200, response);
    MHD_destroy_response(response);

    return ret;
}

void HttpServer::addCORSHeaders(struct MHD_Response* response) {
    MHD_add_response_header(response, "Access-Control-Allow-Origin", "*");
    MHD_add_response_header(response, "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    MHD_add_response_header(response, "Access-Control-Allow-Headers", "Content-Type, Authorization");
    MHD_add_response_header(response, "Access-Control-Max-Age", "3600");
}

} // namespace http_server
