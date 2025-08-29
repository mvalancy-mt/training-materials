#include <gtest/gtest.h>
#include <gmock/gmock.h>
#include "../include/task_manager.h"
#include <json/json.h>

using namespace http_server;

class TaskManagerTest : public ::testing::Test {
protected:
    void SetUp() override {
        task_manager = std::make_unique<TaskManager>();
    }

    void TearDown() override {
        task_manager.reset();
    }

    std::unique_ptr<TaskManager> task_manager;
};

// Test task creation
TEST_F(TaskManagerTest, CreateValidTask) {
    Json::Value taskData;
    taskData["title"] = "Test Task";
    taskData["description"] = "A test task for unit testing";
    taskData["priority"] = "high";
    taskData["status"] = "pending";

    auto task = task_manager->createTask(taskData);

    ASSERT_NE(task, nullptr);
    EXPECT_EQ(task->title, "Test Task");
    EXPECT_EQ(task->description, "A test task for unit testing");
    EXPECT_EQ(task->priority, TaskPriority::HIGH);
    EXPECT_EQ(task->status, TaskStatus::PENDING);
    EXPECT_GT(task->id, 0);
}

// Test invalid task creation
TEST_F(TaskManagerTest, CreateInvalidTask) {
    Json::Value taskData;
    // Missing required title field
    taskData["description"] = "Invalid task";

    auto task = task_manager->createTask(taskData);

    EXPECT_EQ(task, nullptr);
}

// Test task retrieval
TEST_F(TaskManagerTest, GetTask) {
    Json::Value taskData;
    taskData["title"] = "Retrievable Task";
    taskData["description"] = "A task to retrieve";

    auto created_task = task_manager->createTask(taskData);
    ASSERT_NE(created_task, nullptr);

    uint64_t task_id = created_task->id;
    auto retrieved_task = task_manager->getTask(task_id);

    ASSERT_NE(retrieved_task, nullptr);
    EXPECT_EQ(retrieved_task->id, task_id);
    EXPECT_EQ(retrieved_task->title, "Retrievable Task");
}

// Test nonexistent task retrieval
TEST_F(TaskManagerTest, GetNonexistentTask) {
    auto task = task_manager->getTask(999999);
    EXPECT_EQ(task, nullptr);
}

// Test task update
TEST_F(TaskManagerTest, UpdateTask) {
    Json::Value taskData;
    taskData["title"] = "Original Title";
    taskData["status"] = "pending";

    auto task = task_manager->createTask(taskData);
    ASSERT_NE(task, nullptr);

    uint64_t task_id = task->id;

    Json::Value updates;
    updates["title"] = "Updated Title";
    updates["status"] = "completed";

    auto updated_task = task_manager->updateTask(task_id, updates);

    ASSERT_NE(updated_task, nullptr);
    EXPECT_EQ(updated_task->title, "Updated Title");
    EXPECT_EQ(updated_task->status, TaskStatus::COMPLETED);
}

// Test task deletion
TEST_F(TaskManagerTest, DeleteTask) {
    Json::Value taskData;
    taskData["title"] = "Task to Delete";

    auto task = task_manager->createTask(taskData);
    ASSERT_NE(task, nullptr);

    uint64_t task_id = task->id;

    bool deleted = task_manager->deleteTask(task_id);
    EXPECT_TRUE(deleted);

    // Verify task is gone
    auto retrieved_task = task_manager->getTask(task_id);
    EXPECT_EQ(retrieved_task, nullptr);
}

// Test delete nonexistent task
TEST_F(TaskManagerTest, DeleteNonexistentTask) {
    bool deleted = task_manager->deleteTask(999999);
    EXPECT_FALSE(deleted);
}

// Test getting all tasks
TEST_F(TaskManagerTest, GetAllTasks) {
    // Create multiple tasks
    for (int i = 0; i < 3; ++i) {
        Json::Value taskData;
        taskData["title"] = "Task " + std::to_string(i);
        task_manager->createTask(taskData);
    }

    auto tasks = task_manager->getAllTasks();
    EXPECT_EQ(tasks.size(), 3);
}

// Test task statistics
TEST_F(TaskManagerTest, GetStatistics) {
    // Create tasks with different statuses and priorities
    Json::Value task1;
    task1["title"] = "Pending High";
    task1["status"] = "pending";
    task1["priority"] = "high";
    task_manager->createTask(task1);

    Json::Value task2;
    task2["title"] = "Completed Low";
    task2["status"] = "completed";
    task2["priority"] = "low";
    task_manager->createTask(task2);

    auto stats = task_manager->getStatistics();

    EXPECT_EQ(stats["total"].asUInt(), 2);
    EXPECT_EQ(stats["by_status"]["pending"].asUInt(), 1);
    EXPECT_EQ(stats["by_status"]["completed"].asUInt(), 1);
    EXPECT_EQ(stats["by_priority"]["high"].asUInt(), 1);
    EXPECT_EQ(stats["by_priority"]["low"].asUInt(), 1);
}

// Test task count
TEST_F(TaskManagerTest, GetTaskCount) {
    EXPECT_EQ(task_manager->getTaskCount(), 0);

    Json::Value taskData;
    taskData["title"] = "Count Test Task";
    task_manager->createTask(taskData);

    EXPECT_EQ(task_manager->getTaskCount(), 1);
}

// Test task filtering by status
TEST_F(TaskManagerTest, FilterTasksByStatus) {
    // Create tasks with different statuses
    Json::Value pending_task;
    pending_task["title"] = "Pending Task";
    pending_task["status"] = "pending";
    task_manager->createTask(pending_task);

    Json::Value completed_task;
    completed_task["title"] = "Completed Task";
    completed_task["status"] = "completed";
    task_manager->createTask(completed_task);

    auto pending_tasks = task_manager->getAllTasks("pending");
    auto completed_tasks = task_manager->getAllTasks("completed");

    EXPECT_EQ(pending_tasks.size(), 1);
    EXPECT_EQ(completed_tasks.size(), 1);
    EXPECT_EQ(pending_tasks[0]->status, TaskStatus::PENDING);
    EXPECT_EQ(completed_tasks[0]->status, TaskStatus::COMPLETED);
}

// Test task filtering by priority
TEST_F(TaskManagerTest, FilterTasksByPriority) {
    // Create tasks with different priorities
    Json::Value high_task;
    high_task["title"] = "High Priority Task";
    high_task["priority"] = "high";
    task_manager->createTask(high_task);

    Json::Value low_task;
    low_task["title"] = "Low Priority Task";
    low_task["priority"] = "low";
    task_manager->createTask(low_task);

    auto high_tasks = task_manager->getAllTasks("", "high");
    auto low_tasks = task_manager->getAllTasks("", "low");

    EXPECT_EQ(high_tasks.size(), 1);
    EXPECT_EQ(low_tasks.size(), 1);
    EXPECT_EQ(high_tasks[0]->priority, TaskPriority::HIGH);
    EXPECT_EQ(low_tasks[0]->priority, TaskPriority::LOW);
}

// Test JSON serialization
TEST_F(TaskManagerTest, TaskToJson) {
    Json::Value taskData;
    taskData["title"] = "JSON Task";
    taskData["description"] = "Testing JSON conversion";
    taskData["priority"] = "medium";
    taskData["status"] = "in_progress";
    taskData["due_date"] = "2024-12-31";

    auto task = task_manager->createTask(taskData);
    ASSERT_NE(task, nullptr);

    auto json = task->toJson();

    EXPECT_EQ(json["title"].asString(), "JSON Task");
    EXPECT_EQ(json["description"].asString(), "Testing JSON conversion");
    EXPECT_EQ(json["priority"].asString(), "medium");
    EXPECT_EQ(json["status"].asString(), "in_progress");
    EXPECT_EQ(json["due_date"].asString(), "2024-12-31");
    EXPECT_TRUE(json["id"].isUInt64());
    EXPECT_TRUE(json["created_at"].isString());
    EXPECT_TRUE(json["updated_at"].isString());
}

int main(int argc, char **argv) {
    ::testing::InitGoogleTest(&argc, argv);
    return RUN_ALL_TESTS();
}
