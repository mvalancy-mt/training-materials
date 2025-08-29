#include "json_utils.h"
#include <iostream>
#include <sstream>

namespace http_server {
namespace json_utils {

Json::Value parseJson(const std::string& json_str) {
    Json::Value root;
    Json::CharReaderBuilder builder;
    Json::CharReader* reader = builder.newCharReader();

    std::string errors;
    bool success = reader->parse(json_str.c_str(), json_str.c_str() + json_str.length(), &root, &errors);

    delete reader;

    if (!success) {
        std::cerr << "JSON parse error: " << errors << std::endl;
        return Json::Value::null;
    }

    return root;
}

bool isValidJson(const std::string& json_str) {
    Json::Value root = parseJson(json_str);
    return !root.isNull();
}

std::string jsonToString(const Json::Value& json, bool pretty) {
    if (pretty) {
        Json::StreamWriterBuilder builder;
        builder["indentation"] = "  ";
        return Json::writeString(builder, json);
    } else {
        Json::StreamWriterBuilder builder;
        builder["indentation"] = "";
        return Json::writeString(builder, json);
    }
}

bool hasRequiredFields(const Json::Value& json, const std::vector<std::string>& fields) {
    for (const auto& field : fields) {
        if (!json.isMember(field)) {
            return false;
        }
    }
    return true;
}

bool isValidString(const Json::Value& value, const std::string& field, bool required) {
    if (!value.isMember(field)) {
        return !required;
    }

    return value[field].isString() && !value[field].asString().empty();
}

bool isValidInteger(const Json::Value& value, const std::string& field, bool required) {
    if (!value.isMember(field)) {
        return !required;
    }

    return value[field].isInt() || value[field].isUInt() || value[field].isInt64() || value[field].isUInt64();
}

Json::Value createErrorResponse(const std::string& message, int code) {
    Json::Value response;
    response["error"] = message;
    response["code"] = code;
    response["timestamp"] = static_cast<Json::Int64>(
        std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()).count());

    return response;
}

Json::Value createSuccessResponse(const std::string& message, const Json::Value& data) {
    Json::Value response;
    response["message"] = message;
    response["timestamp"] = static_cast<Json::Int64>(
        std::chrono::duration_cast<std::chrono::seconds>(
            std::chrono::system_clock::now().time_since_epoch()).count());

    if (!data.isNull()) {
        response["data"] = data;
    }

    return response;
}

bool isValidTaskData(const Json::Value& json) {
    // Required field: title
    if (!isValidString(json, "title", true)) {
        return false;
    }

    // Optional fields validation
    if (json.isMember("description") && !json["description"].isString()) {
        return false;
    }

    if (json.isMember("priority")) {
        std::string priority = json["priority"].asString();
        if (priority != "low" && priority != "medium" && priority != "high") {
            return false;
        }
    }

    if (json.isMember("status")) {
        std::string status = json["status"].asString();
        if (status != "pending" && status != "in_progress" && status != "completed") {
            return false;
        }
    }

    if (json.isMember("due_date") && !json["due_date"].isString()) {
        return false;
    }

    return true;
}

bool isValidTaskUpdate(const Json::Value& json) {
    // For updates, no field is required, but all present fields must be valid

    if (json.isMember("title") && !isValidString(json, "title", false)) {
        return false;
    }

    if (json.isMember("description") && !json["description"].isString()) {
        return false;
    }

    if (json.isMember("priority")) {
        if (!json["priority"].isString()) {
            return false;
        }
        std::string priority = json["priority"].asString();
        if (priority != "low" && priority != "medium" && priority != "high") {
            return false;
        }
    }

    if (json.isMember("status")) {
        if (!json["status"].isString()) {
            return false;
        }
        std::string status = json["status"].asString();
        if (status != "pending" && status != "in_progress" && status != "completed") {
            return false;
        }
    }

    if (json.isMember("due_date") && !json["due_date"].isString()) {
        return false;
    }

    return true;
}

} // namespace json_utils
} // namespace http_server
