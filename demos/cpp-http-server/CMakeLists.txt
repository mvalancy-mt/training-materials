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

# Use pkg-config to find jsoncpp
pkg_check_modules(JSONCPP REQUIRED jsoncpp)

# Find GoogleTest for unit testing
find_package(GTest QUIET)
if(NOT GTest_FOUND)
    # Fallback to system installation or manual build
    find_library(GTEST_LIBRARY gtest)
    find_library(GTEST_MAIN_LIBRARY gtest_main)
    find_library(GMOCK_LIBRARY gmock)
    find_path(GTEST_INCLUDE_DIR gtest/gtest.h)

    if(GTEST_LIBRARY AND GTEST_MAIN_LIBRARY AND GTEST_INCLUDE_DIR)
        set(GTEST_LIBRARIES ${GTEST_LIBRARY} ${GTEST_MAIN_LIBRARY})
        if(GMOCK_LIBRARY)
            list(APPEND GTEST_LIBRARIES ${GMOCK_LIBRARY})
        endif()
        set(GTEST_INCLUDE_DIRS ${GTEST_INCLUDE_DIR})
        set(GTest_FOUND TRUE)
    endif()
endif()

# Create main executable
add_executable(http_server
    src/main.cpp
    src/task_manager.cpp
    src/json_utils.cpp
)

target_include_directories(http_server PRIVATE
    ${CMAKE_CURRENT_SOURCE_DIR}/include
    ${JSONCPP_INCLUDE_DIRS}
)

target_link_libraries(http_server PRIVATE
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

# Test executable (only if GoogleTest is found)
if(GTest_FOUND)
    add_executable(test_runner
        tests/test_minimal.cpp
        src/task_manager.cpp
        src/json_utils.cpp
    )

    target_include_directories(test_runner PRIVATE
        ${CMAKE_CURRENT_SOURCE_DIR}/include
        ${CMAKE_CURRENT_SOURCE_DIR}/tests
        ${JSONCPP_INCLUDE_DIRS}
        ${GTEST_INCLUDE_DIRS}
    )

    if(TARGET GTest::gtest_main)
        # Modern CMake target
        target_link_libraries(test_runner PRIVATE
            ${JSONCPP_LIBRARIES}
            Threads::Threads
            GTest::gtest_main
            GTest::gmock
        )
    else()
        # Fallback to found libraries
        target_link_libraries(test_runner PRIVATE
            ${JSONCPP_LIBRARIES}
            Threads::Threads
            ${GTEST_LIBRARIES}
        )
    endif()

    target_compile_options(test_runner PRIVATE
        -Wall -Wextra -Wno-error
        -DUNIT_TESTING
        $<$<CONFIG:Debug>:-O0 -g>
    )

    # Add test
    add_test(NAME unit_tests COMMAND test_runner)

    message(STATUS "GoogleTest found - unit tests enabled")
else()
    message(WARNING "GoogleTest not found - unit tests disabled")
endif()

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
