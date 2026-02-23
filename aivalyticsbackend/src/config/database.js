const { createClient } = require("@supabase/supabase-js");
const logger = require("./logger");

/**
 * Supabase Database Configuration
 * Enterprise-grade database connection with proper error handling
 */
class DatabaseConfig {
  constructor() {
    this.supabaseUrl = process.env.SUPABASE_URL;
    this.supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
    this.supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    // Check if we're in development mode with placeholder values
    this.isDevelopmentMode = this.checkDevelopmentMode();

    if (this.isDevelopmentMode) {
      logger.warn(
        "Running in development mode without valid Supabase credentials"
      );
      this.initializeMockClients();
    } else {
      this.validateConfig();
      this.initializeClients();
    }
  }

  /**
   * Check if we're running with placeholder/invalid environment variables
   */
  checkDevelopmentMode() {
    const placeholderValues = [
      "your_supabase_project_url",
      "your_supabase_anon_key_here",
      "your_supabase_service_role_key_here",
      "https://your-project.supabase.co",
    ];

    // Temporarily disable development mode check - REMOVE THIS IN PRODUCTION
    // TODO: Configure proper .env file with real Supabase credentials
    if (process.env.FORCE_PRODUCTION_MODE === "true") {
      return false;
    }

    return (
      !this.supabaseUrl ||
      !this.supabaseAnonKey ||
      !this.supabaseServiceKey ||
      placeholderValues.includes(this.supabaseUrl) ||
      placeholderValues.includes(this.supabaseAnonKey) ||
      placeholderValues.includes(this.supabaseServiceKey)
    );
  }

  /**
   * Initialize mock clients for development
   */
  initializeMockClients() {
    // In-memory store for development mode
    const mockStore = {
      courses: [
        {
          id: "mock-course-1",
          name: "Introduction to Programming",
          about: "Learn the basics of programming with JavaScript",
          created_by: "mock-teacher-1",
          updated_by: "mock-teacher-1",
          duration_months: 3,
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          progress_percentage: 0,
          deleted_at: null,
        },
        {
          id: "mock-course-2",
          name: "Advanced Web Development",
          about: "Master React, Node.js and modern web technologies",
          created_by: "mock-teacher-1",
          updated_by: "mock-teacher-1",
          duration_months: 6,
          start_date: new Date().toISOString(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          is_active: true,
          progress_percentage: 25,
          deleted_at: null,
        },
      ],
      user: [
        {
          id: "mock-teacher-1",
          username: "teacher1",
          roll_number: "T001",
          role: "teacher",
          course_ids: [],
          email: "teacher1@example.com",
          password_hash:
            "$2a$12$h.6.9erElXqlSerkIo1dK.YWLTykQadwIpOCw/iXrB4QPBh5Y2J12", // Test@123
          role_id: "role-teacher",
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "mock-student-1",
          username: "student1",
          roll_number: "S001",
          role: "student",
          course_ids: [],
          email: "student1@example.com",
          password_hash:
            "$2a$12$h.6.9erElXqlSerkIo1dK.YWLTykQadwIpOCw/iXrB4QPBh5Y2J12", // Test@123
          role_id: "role-student",
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "mock-hod-1",
          username: "hod1",
          roll_number: "H001",
          role: "hod",
          course_ids: [],
          email: "hod1@example.com",
          password_hash:
            "$2a$12$h.6.9erElXqlSerkIo1dK.YWLTykQadwIpOCw/iXrB4QPBh5Y2J12", // Test@123
          role_id: "role-hod",
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
        {
          id: "mock-principal-1",
          username: "principal1",
          roll_number: "P001",
          role: "principal",
          course_ids: [],
          email: "principal1@example.com",
          password_hash:
            "$2a$12$h.6.9erElXqlSerkIo1dK.YWLTykQadwIpOCw/iXrB4QPBh5Y2J12", // Test@123
          role_id: "role-principal",
          deleted_at: null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ],
      quizzes: [],
      scores: [],
      roles: [
        {
          id: "role-student",
          name: "student",
          description: "Student role",
        },
        {
          id: "role-teacher",
          name: "teacher",
          description: "Teacher role",
        },
        {
          id: "role-hod",
          name: "hod",
          description: "Head of Department role",
        },
        {
          id: "role-principal",
          name: "principal",
          description: "Principal role",
        },
      ],
    };

    // Create mock clients that simulate successful operations for development
    const mockClient = {
      from: (table) => ({
        select: (columns) => {
          const data = mockStore[table] || [];
          return {
            data: data.slice(), // Create a copy to avoid mutations
            error: null,
            eq(column, value) {
              this.data = this.data.filter((item) => item[column] === value);
              return this;
            },
            single() {
              // Handle joins for user authentication
              if (table === "user" && this.data.length > 0) {
                const user = this.data[0];
                if (user && user.role_id) {
                  const role = mockStore.roles?.find(
                    (r) => r.id === user.role_id
                  );
                  if (role) {
                    user.roles = role;
                  }
                }
              }
              return Promise.resolve({
                data: this.data[0] || null,
                error: null,
              });
            },
            is(column, value) {
              if (value === null) {
                this.data = this.data.filter((item) => item[column] === null);
              } else {
                this.data = this.data.filter((item) => item[column] === value);
              }
              return this;
            },
            contains() {
              return this;
            },
            overlaps() {
              return this;
            },
            or(condition) {
              // Handle OR conditions like "username.eq.value,roll_number.eq.value"
              if (typeof condition === "string" && condition.includes(",")) {
                const conditions = condition.split(",");
                const matchingItems = [];

                conditions.forEach((cond) => {
                  if (cond.includes(".eq.")) {
                    const [field, value] = cond.split(".eq.");
                    const items = (mockStore[table] || []).filter(
                      (item) => item[field] === value
                    );
                    matchingItems.push(...items);
                  }
                });

                // Remove duplicates
                this.data = matchingItems.filter(
                  (item, index, self) =>
                    index === self.findIndex((t) => t.id === item.id)
                );
              }
              return this;
            },
            range() {
              return this;
            },
            order() {
              return this;
            },
            limit() {
              return this;
            },
            not() {
              return this;
            },
          };
        },
        insert: (data) => {
          const newItem = {
            id: `mock-id-${Date.now()}-${Math.random()
              .toString(36)
              .substr(2, 9)}`,
            ...data,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          if (!mockStore[table]) mockStore[table] = [];
          mockStore[table].push(newItem);

          return {
            data: newItem,
            error: null,
            select(columns) {
              // Handle joins for user registration
              if (table === "user" && newItem.role_id) {
                const role = mockStore.roles?.find(
                  (r) => r.id === newItem.role_id
                );
                if (role) {
                  newItem.roles = role;
                }
              }
              return {
                data: newItem,
                error: null,
                single() {
                  return Promise.resolve({ data: newItem, error: null });
                },
              };
            },
            single() {
              return Promise.resolve({ data: newItem, error: null });
            },
          };
        },
        update: (updateData) => ({
          data: { ...updateData, updated_at: new Date().toISOString() },
          error: null,
          eq(column, value) {
            if (mockStore[table]) {
              const items = mockStore[table].filter(
                (item) => item[column] === value && !item.deleted_at
              );
              items.forEach((item) => {
                Object.assign(item, updateData);
                item.updated_at = new Date().toISOString();
              });
              // Return the updated item for single() calls
              this.data = items[0] || null;
            }
            return this;
          },
          select() {
            return this;
          },
          single() {
            return { data: this.data, error: null };
          },
        }),
        delete: () => ({
          data: null,
          error: null,
          eq(column, value) {
            if (mockStore[table]) {
              const index = mockStore[table].findIndex(
                (item) => item[column] === value
              );
              if (index !== -1) {
                mockStore[table].splice(index, 1);
              }
            }
            return this;
          },
        }),
        eq() {
          return this;
        },
        single() {
          return this;
        },
        is() {
          return this;
        },
        contains() {
          return this;
        },
        overlaps() {
          return this;
        },
        or() {
          return this;
        },
        range() {
          return this;
        },
        order() {
          return this;
        },
        limit() {
          return this;
        },
        not() {
          return this;
        },
      }),
      rpc: (functionName, params) => ({
        data: null,
        error: null,
      }),
      auth: {
        signUp: () => ({
          data: { user: { id: "mock-user-id" } },
          error: null,
        }),
        signInWithPassword: () => ({
          data: { user: { id: "mock-user-id" } },
          error: null,
        }),
        signOut: () => ({ error: null }),
        getUser: () => ({
          data: { user: { id: "mock-user-id" } },
          error: null,
        }),
      },
    };

    this.supabase = mockClient;
    this.supabaseAdmin = mockClient;

    logger.warn(
      "⚠️  DEVELOPMENT MODE: Using mock database clients with in-memory storage"
    );
    logger.warn(
      "⚠️  Database operations will be simulated but not persisted between server restarts"
    );
    logger.warn(
      "⚠️  Configure SUPABASE_URL, SUPABASE_ANON_KEY, and SUPABASE_SERVICE_ROLE_KEY for real database"
    );
  }

  /**
   * Validate required environment variables
   */
  validateConfig() {
    const requiredVars = [
      "SUPABASE_URL",
      "SUPABASE_ANON_KEY",
      "SUPABASE_SERVICE_ROLE_KEY",
    ];
    const missingVars = requiredVars.filter((varName) => !process.env[varName]);

    if (missingVars.length > 0) {
      const error = `Missing required environment variables: ${missingVars.join(
        ", "
      )}`;
      logger.error(error);
      throw new Error(error);
    }
  }

  /**
   * Initialize Supabase clients
   */
  initializeClients() {
    try {
      // Client for general operations (with RLS)
      this.supabase = createClient(this.supabaseUrl, this.supabaseAnonKey, {
        auth: {
          autoRefreshToken: true,
          persistSession: false,
        },
      });

      // Admin client for service operations (bypasses RLS)
      this.supabaseAdmin = createClient(
        this.supabaseUrl,
        this.supabaseServiceKey,
        {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        }
      );

      logger.info("Supabase clients initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Supabase clients:", error);
      throw error;
    }
  }

  /**
   * Get the standard Supabase client
   */
  getClient() {
    return this.supabase;
  }

  /**
   * Get the admin Supabase client (use with caution)
   */
  getAdminClient() {
    return this.supabaseAdmin;
  }

  /**
   * Test database connection
   */
  async testConnection() {
    if (this.isDevelopmentMode) {
      logger.info("Development mode - skipping database connection test");
      return true;
    }

    try {
      const { data, error } = await this.supabase
        .from("roles")
        .select("count")
        .limit(1);

      if (error) {
        logger.error("Database connection test failed:", error);
        return false;
      }

      logger.info("Database connection test successful");
      return true;
    } catch (error) {
      logger.error("Database connection test error:", error);
      return false;
    }
  }
}

// Create singleton instance
const databaseConfig = new DatabaseConfig();

module.exports = {
  supabase: databaseConfig.getClient(),
  supabaseAdmin: databaseConfig.getAdminClient(),
  getClient: () => databaseConfig.getClient(),
  getAdminClient: () => databaseConfig.getAdminClient(),
  testConnection: () => databaseConfig.testConnection(),
};
