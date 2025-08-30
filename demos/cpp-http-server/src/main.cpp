#include "task_manager.h"
#include <iostream>
#include <signal.h>
#include <unistd.h>
#include <cstdlib>

static volatile bool running = true;

void signal_handler(int signal) {
    if (signal == SIGINT || signal == SIGTERM) {
        std::cout << "\nReceived signal " << signal << ", shutting down gracefully..." << std::endl;
        running = false;
    }
}

void print_banner() {
    std::cout << R"(
    ╔══════════════════════════════════════════╗
    ║           C++ HTTP Server Demo           ║
    ║        Task Management Service           ║
    ║    Production-Ready CI/CD Example       ║
    ╚══════════════════════════════════════════╝
    )" << std::endl;
}

int main(int argc, const char* const argv[]) {
    print_banner();

    // Parse command line arguments
    int port = 8000;
    if (argc > 1) {
        try {
            port = std::stoi(argv[1]);
            if (port < 1 || port > 65535) {
                std::cerr << "Error: Port must be between 1 and 65535" << std::endl;
                return 1;
            }
        } catch (const std::exception& e) {
            std::cerr << "Error: Invalid port number: " << argv[1] << std::endl;
            return 1;
        }
    }

    // Set up signal handlers for graceful shutdown
    signal(SIGINT, signal_handler);
    signal(SIGTERM, signal_handler);

    try {
        // Create task manager and demonstrate functionality
        http_server::TaskManager task_manager;

        std::cout << "🚀 Starting Task Manager Demo on port " << port << "..." << std::endl;

        // Create a sample task
        Json::Value taskData;
        taskData["title"] = "Demo Task";
        taskData["description"] = "A sample task for demonstration";
        taskData["priority"] = "high";
        taskData["status"] = "pending";

        auto task = task_manager.createTask(taskData);

        if (task) {
            std::cout << "✅ Created demo task with ID: " << task->id << std::endl;
            std::cout << "📋 Task count: " << task_manager.getTaskCount() << std::endl;

            // Show statistics
            auto stats = task_manager.getStatistics();
            std::cout << "📊 Statistics:" << std::endl;
            std::cout << "   Total tasks: " << stats["total"] << std::endl;
            std::cout << "   Pending: " << stats["by_status"]["pending"] << std::endl;
            std::cout << "   High priority: " << stats["by_priority"]["high"] << std::endl;
        } else {
            std::cerr << "❌ Failed to create demo task" << std::endl;
            return 1;
        }

        std::cout << "💚 Task Manager Demo running successfully!" << std::endl;
        std::cout << "📋 In a full implementation, this would be http://localhost:" << port << "/api/v1/tasks" << std::endl;
        std::cout << "\nPress Ctrl+C to stop..." << std::endl;

        // Simple demo loop
        while (running) {
            sleep(1);
        }

        std::cout << "\n🛑 Stopping Task Manager Demo..." << std::endl;
        std::cout << "✅ Demo stopped gracefully. Goodbye!" << std::endl;

    } catch (const std::exception& e) {
        std::cerr << "💥 Fatal error: " << e.what() << std::endl;
        return 1;
    }

    return 0;
}
