#pragma once

#include <memory>
#include <string>
#include <microhttpd.h>
#include <json/json.h>
#include "task_manager.h"

namespace http_server {

struct ConnectionInfo {
    std::string post_data;
    size_t data_size;
};

class HttpServer {
public:
    explicit HttpServer(int port = 8000);
    ~HttpServer();
    
    bool start();
    void stop();
    bool isRunning() const;
    
    int getPort() const { return port_; }
    
    // Request handlers
    static MHD_Result requestHandler(void* cls, struct MHD_Connection* connection,
                                   const char* url, const char* method,
                                   const char* version, const char* upload_data,
                                   size_t* upload_data_size, void** con_cls);
    
private:
    int port_;
    struct MHD_Daemon* daemon_;
    std::unique_ptr<TaskManager> task_manager_;
    
    // HTTP method handlers
    MHD_Result handleGET(struct MHD_Connection* connection, const std::string& url);
    MHD_Result handlePOST(struct MHD_Connection* connection, const std::string& url, 
                         const std::string& data);
    MHD_Result handlePUT(struct MHD_Connection* connection, const std::string& url,
                        const std::string& data);
    MHD_Result handleDELETE(struct MHD_Connection* connection, const std::string& url);
    
    // Route handlers
    MHD_Result handleHealthCheck(struct MHD_Connection* connection);
    MHD_Result handleGetTasks(struct MHD_Connection* connection, const std::string& query);
    MHD_Result handleGetTask(struct MHD_Connection* connection, uint64_t id);
    MHD_Result handleCreateTask(struct MHD_Connection* connection, const std::string& data);
    MHD_Result handleUpdateTask(struct MHD_Connection* connection, uint64_t id, 
                               const std::string& data);
    MHD_Result handleDeleteTask(struct MHD_Connection* connection, uint64_t id);
    MHD_Result handleGetStatistics(struct MHD_Connection* connection);
    
    // Utility functions
    MHD_Result sendJsonResponse(struct MHD_Connection* connection, int status_code, 
                               const Json::Value& json);
    MHD_Result sendErrorResponse(struct MHD_Connection* connection, int status_code, 
                                const std::string& message);
    
    std::string parseQueryString(const std::string& query, const std::string& key);
    uint64_t parseTaskId(const std::string& url);
};

} // namespace http_server