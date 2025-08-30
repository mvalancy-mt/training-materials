#pragma once

#include <json/json.h>
#include <string>

namespace http_server {
namespace json_utils {

// Reserved for future HTTP server implementation
/*
// JSON parsing and validation
Json::Value parseJson(const std::string& json_str);
bool isValidString(const Json::Value& value, const std::string& field, bool required = true);
*/

// Reserved for future HTTP server implementation
/*
bool isValidJson(const std::string& json_str);
std::string jsonToString(const Json::Value& json, bool pretty = false);

// JSON validation helpers
bool hasRequiredFields(const Json::Value& json, const std::vector<std::string>& fields);
bool isValidInteger(const Json::Value& value, const std::string& field, bool required = true);

// Error response builders
Json::Value createErrorResponse(const std::string& message, int code = 400);
Json::Value createSuccessResponse(const std::string& message, const Json::Value& data = Json::Value::null);

// Task validation
bool isValidTaskData(const Json::Value& json);
bool isValidTaskUpdate(const Json::Value& json);
*/

} // namespace json_utils
} // namespace http_server
