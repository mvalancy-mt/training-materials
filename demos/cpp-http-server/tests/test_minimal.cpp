#include <gtest/gtest.h>
#include "../include/task_manager.h"
#include <json/json.h>

using namespace http_server;

// Simple test that just ensures the TaskManager can be instantiated
TEST(MinimalTest, TaskManagerInstantiation) {
    auto task_manager = std::make_unique<TaskManager>();
    EXPECT_NE(task_manager, nullptr);
    EXPECT_EQ(task_manager->getTaskCount(), 0);
}

// Test basic task creation
TEST(MinimalTest, BasicTaskCreation) {
    TaskManager task_manager;

    Json::Value taskData;
    taskData["title"] = "Test Task";

    auto task = task_manager.createTask(taskData);
    ASSERT_NE(task, nullptr);
    EXPECT_EQ(task->title, "Test Task");
    EXPECT_EQ(task_manager.getTaskCount(), 1);
}

// Test task validation
TEST(MinimalTest, TaskValidation) {
    // Valid task data
    Json::Value validTask;
    validTask["title"] = "Valid Task";
    EXPECT_TRUE(Task::isValidTask(validTask));

    // Invalid task data (missing title)
    Json::Value invalidTask;
    invalidTask["description"] = "No title";
    EXPECT_FALSE(Task::isValidTask(invalidTask));

    // Invalid task data (empty title)
    Json::Value emptyTitleTask;
    emptyTitleTask["title"] = "";
    EXPECT_FALSE(Task::isValidTask(emptyTitleTask));
}

// Test JSON serialization
TEST(MinimalTest, TaskJsonSerialization) {
    TaskManager task_manager;

    Json::Value taskData;
    taskData["title"] = "JSON Test";
    taskData["description"] = "Test JSON conversion";
    taskData["priority"] = "high";
    taskData["status"] = "pending";

    auto task = task_manager.createTask(taskData);
    ASSERT_NE(task, nullptr);

    Json::Value json = task->toJson();

    EXPECT_EQ(json["title"].asString(), "JSON Test");
    EXPECT_EQ(json["description"].asString(), "Test JSON conversion");
    EXPECT_EQ(json["priority"].asString(), "high");
    EXPECT_EQ(json["status"].asString(), "pending");
    EXPECT_TRUE(json["id"].isUInt64());
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
