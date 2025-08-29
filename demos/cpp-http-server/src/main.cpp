#include "http_server.h"
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

int main(int argc, char* argv[]) {
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
        // Create and start the server
        http_server::HttpServer server(port);
        
        std::cout << "🚀 Starting HTTP server on port " << port << "..." << std::endl;
        
        if (!server.start()) {
            std::cerr << "❌ Failed to start server on port " << port << std::endl;
            return 1;
        }
        
        std::cout << "✅ Server started successfully!" << std::endl;
        std::cout << "📊 API Documentation: http://localhost:" << port << "/docs" << std::endl;
        std::cout << "💚 Health Check: http://localhost:" << port << "/health" << std::endl;
        std::cout << "📋 Tasks API: http://localhost:" << port << "/api/v1/tasks" << std::endl;
        std::cout << "\nPress Ctrl+C to stop the server..." << std::endl;
        
        // Main server loop
        while (running && server.isRunning()) {
            sleep(1);
        }
        
        std::cout << "\n🛑 Stopping server..." << std::endl;
        server.stop();
        std::cout << "✅ Server stopped gracefully. Goodbye!" << std::endl;
        
    } catch (const std::exception& e) {
        std::cerr << "💥 Fatal error: " << e.what() << std::endl;
        return 1;
    }
    
    return 0;
}