cmake_minimum_required(VERSION 3.20)
project(HttpServer VERSION 1.0.0 LANGUAGES CXX)

set(CMAKE_CXX_STANDARD 20)
set(CMAKE_CXX_STANDARD_REQUIRED ON)
set(CMAKE_CXX_EXTENSIONS OFF)

# Enable testing
enable_testing()

# Find packages
find_package(PkgConfig REQUIRED)
find_package(Threads REQUIRED)

# Use pkg-config to find libmicrohttpd
pkg_check_modules(MHD REQUIRED libmicrohttpd)
pkg_check_modules(JSONCPP REQUIRED jsoncpp)

# Create main executable
add_executable(http_server
    src/main.cpp
    src/http_server.cpp
    src/task_manager.cpp
    src/health_check.cpp
    src/json_utils.cpp
)

target_include_directories(http_server PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${MHD_INCLUDE_DIRS}
    ${JSONCPP_INCLUDE_DIRS}
)

target_link_libraries(http_server PRIVATE 
    ${MHD_LIBRARIES}
    ${JSONCPP_LIBRARIES}
    Threads::Threads
)

# Compiler flags for security and performance
target_compile_options(http_server PRIVATE
    -Wall -Wextra -Werror
    -fstack-protector-strong
    -D_FORTIFY_SOURCE=2
    -fPIE
    $<$<CONFIG:Release>:-O3 -DNDEBUG>
    $<$<CONFIG:Debug>:-O0 -g -fsanitize=address -fsanitize=undefined>
)

target_link_options(http_server PRIVATE
    -pie
    $<$<CONFIG:Debug>:-fsanitize=address -fsanitize=undefined>
)

# Test executable
add_executable(test_runner
    tests/test_main.cpp
    tests/test_task_manager.cpp
    tests/test_http_server.cpp
    src/task_manager.cpp
    src/json_utils.cpp
)

target_include_directories(test_runner PRIVATE 
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${CMAKE_CURRENT_SOURCE_DIR}/tests
    ${JSONCPP_INCLUDE_DIRS}
)

target_link_libraries(test_runner PRIVATE 
    ${JSONCPP_LIBRARIES}
    Threads::Threads
)

target_compile_options(test_runner PRIVATE
    -Wall -Wextra -Werror
    -DUNIT_TESTING
    $<$<CONFIG:Debug>:-O0 -g -fsanitize=address -fsanitize=undefined>
)

target_link_options(test_runner PRIVATE
    $<$<CONFIG:Debug>:-fsanitize=address -fsanitize=undefined>
)

# Add test
add_test(NAME unit_tests COMMAND test_runner)

# Install rules
install(TARGETS http_server 
    RUNTIME DESTINATION bin
)

# CPack configuration for packaging
set(CPACK_PACKAGE_VERSION_MAJOR ${PROJECT_VERSION_MAJOR})
set(CPACK_PACKAGE_VERSION_MINOR ${PROJECT_VERSION_MINOR})
set(CPACK_PACKAGE_VERSION_PATCH ${PROJECT_VERSION_PATCH})
set(CPACK_PACKAGE_DESCRIPTION_SUMMARY "High-performance HTTP server for task management")
include(CPack)