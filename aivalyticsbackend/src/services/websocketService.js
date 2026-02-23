const WebSocket = require("ws");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = require("../config/constants");

class WebSocketService {
  constructor() {
    this.wss = null;
    this.clients = new Map(); // Map to store client connections with user info
    this.sessions = new Map(); // Map to store active attendance sessions
    this.sessionTimeouts = new Map(); // Map to store session timeout handlers
  }

  /**
   * Initialize WebSocket server
   */
  initialize(server) {
    this.wss = new WebSocket.Server({
      server,
      path: "/ws/attendance",
    });

    this.wss.on("connection", (ws, req) => {
      this.handleConnection(ws, req);
    });

    console.log("WebSocket server initialized for attendance system");
  }

  /**
   * Handle new WebSocket connection
   */
  async handleConnection(ws, req) {
    try {
      // Extract token from query parameters or headers
      const token = this.extractToken(req);

      if (!token) {
        ws.close(1008, "Authentication required");
        return;
      }

      // Verify JWT token
      const decoded = jwt.verify(token, JWT_SECRET);
      const userId = decoded.id;
      const userRole = decoded.role;

      // Store client connection with user info
      const clientInfo = {
        ws,
        userId,
        userRole,
        lastActivity: Date.now(),
        subscribedSessions: new Set(),
      };

      this.clients.set(userId, clientInfo);

      // Set up ping/pong for connection health
      ws.isAlive = true;
      ws.on("pong", () => {
        ws.isAlive = true;
        clientInfo.lastActivity = Date.now();
      });

      // Handle incoming messages
      ws.on("message", (message) => {
        this.handleMessage(userId, message);
      });

      // Handle connection close
      ws.on("close", () => {
        this.handleDisconnection(userId);
      });

      // Send welcome message
      this.sendToClient(userId, {
        type: "connection_established",
        message: "Connected to attendance system",
        timestamp: new Date().toISOString(),
      });

      console.log(`WebSocket client connected: ${userId} (${userRole})`);
    } catch (error) {
      console.error("WebSocket authentication error:", error);
      ws.close(1008, "Authentication failed");
    }
  }

  /**
   * Extract token from request
   */
  extractToken(req) {
    // Try query parameter first
    if (req.url) {
      const url = new URL(req.url, "http://localhost");
      const token = url.searchParams.get("token");
      if (token) return token;
    }

    // Try authorization header
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      return authHeader.substring(7);
    }

    return null;
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(userId, message) {
    try {
      const data = JSON.parse(message);
      const client = this.clients.get(userId);

      if (!client) return;

      client.lastActivity = Date.now();

      switch (data.type) {
        case "subscribe_session":
          this.handleSubscribeSession(userId, data);
          break;

        case "unsubscribe_session":
          this.handleUnsubscribeSession(userId, data);
          break;

        case "ping":
          this.sendToClient(userId, { type: "pong" });
          break;

        case "attendance_update":
          this.handleAttendanceUpdate(userId, data);
          break;

        default:
          console.log("Unknown message type:", data.type);
      }
    } catch (error) {
      console.error("Error handling WebSocket message:", error);
    }
  }

  /**
   * Handle session subscription
   */
  handleSubscribeSession(userId, data) {
    const client = this.clients.get(userId);
    if (!client) return;

    const sessionId = data.sessionId;
    if (!sessionId) return;

    client.subscribedSessions.add(sessionId);

    this.sendToClient(userId, {
      type: "session_subscribed",
      sessionId,
      message: "Subscribed to session updates",
    });

    console.log(`User ${userId} subscribed to session ${sessionId}`);
  }

  /**
   * Handle session unsubscription
   */
  handleUnsubscribeSession(userId, data) {
    const client = this.clients.get(userId);
    if (!client) return;

    const sessionId = data.sessionId;
    if (!sessionId) return;

    client.subscribedSessions.delete(sessionId);

    this.sendToClient(userId, {
      type: "session_unsubscribed",
      sessionId,
      message: "Unsubscribed from session updates",
    });

    console.log(`User ${userId} unsubscribed from session ${sessionId}`);
  }

  /**
   * Handle attendance update from client
   */
  handleAttendanceUpdate(userId, data) {
    const client = this.clients.get(userId);
    if (!client || client.userRole !== "teacher") return;

    // Broadcast attendance update to all subscribers of this session
    this.broadcastToSession(data.sessionId, {
      type: "attendance_updated",
      sessionId: data.sessionId,
      studentId: data.studentId,
      status: data.status,
      updatedBy: userId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Handle client disconnection
   */
  handleDisconnection(userId) {
    const client = this.clients.get(userId);
    if (client) {
      console.log(`WebSocket client disconnected: ${userId}`);
      this.clients.delete(userId);
    }
  }

  /**
   * Send message to specific client
   */
  sendToClient(userId, message) {
    const client = this.clients.get(userId);
    if (client && client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  /**
   * Broadcast message to all clients subscribed to a session
   */
  broadcastToSession(sessionId, message) {
    this.clients.forEach((client, userId) => {
      if (
        client.subscribedSessions.has(sessionId) &&
        client.ws.readyState === WebSocket.OPEN
      ) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Broadcast message to all clients with specific role
   */
  broadcastToRole(role, message) {
    this.clients.forEach((client, userId) => {
      if (client.userRole === role && client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(JSON.stringify(message));
      }
    });
  }

  /**
   * Start a new attendance session
   */
  startAttendanceSession(sessionData) {
    const sessionId = sessionData.id;
    const duration = sessionData.session_duration || 60; // Default 60 minutes

    // Store session info
    this.sessions.set(sessionId, {
      ...sessionData,
      startTime: Date.now(),
      isActive: true,
      attendanceMarked: new Set(),
    });

    // Set up automatic session timeout
    const timeoutHandler = setTimeout(() => {
      this.endAttendanceSession(sessionId, "timeout");
    }, duration * 60 * 1000); // Convert minutes to milliseconds

    this.sessionTimeouts.set(sessionId, timeoutHandler);

    // Notify all relevant clients
    this.broadcastSessionUpdate(sessionId, {
      type: "session_started",
      sessionId,
      sessionData,
      message: "Attendance session started",
    });

    console.log(`Attendance session started: ${sessionId}`);
  }

  /**
   * End attendance session
   */
  endAttendanceSession(sessionId, reason = "manual") {
    const session = this.sessions.get(sessionId);
    if (!session) return;

    // Clear timeout if exists
    const timeoutHandler = this.sessionTimeouts.get(sessionId);
    if (timeoutHandler) {
      clearTimeout(timeoutHandler);
      this.sessionTimeouts.delete(sessionId);
    }

    // Update session status
    session.isActive = false;
    session.endTime = Date.now();
    session.endReason = reason;

    // Notify all relevant clients
    this.broadcastSessionUpdate(sessionId, {
      type: "session_ended",
      sessionId,
      reason,
      duration: session.endTime - session.startTime,
      message: `Attendance session ended (${reason})`,
    });

    console.log(`Attendance session ended: ${sessionId} (${reason})`);
  }

  /**
   * Broadcast session update to relevant clients
   */
  broadcastSessionUpdate(sessionId, message) {
    // Send to all clients subscribed to this session
    this.broadcastToSession(sessionId, message);

    // Also send to all teachers (they might want to know about session status)
    this.broadcastToRole("teacher", message);
  }

  /**
   * Mark attendance for a student
   */
  markAttendance(sessionId, studentId, status, markedBy) {
    const session = this.sessions.get(sessionId);
    if (!session || !session.isActive) return;

    // Update session attendance tracking
    session.attendanceMarked.add(studentId);

    // Broadcast attendance update
    this.broadcastToSession(sessionId, {
      type: "attendance_marked",
      sessionId,
      studentId,
      status,
      markedBy,
      timestamp: new Date().toISOString(),
    });

    // Send notification to the specific student
    this.sendToClient(studentId, {
      type: "attendance_notification",
      sessionId,
      status,
      message: `Your attendance has been marked as ${status}`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send low attendance warning
   */
  sendLowAttendanceWarning(studentId, courseId, attendancePercentage) {
    this.sendToClient(studentId, {
      type: "low_attendance_warning",
      courseId,
      attendancePercentage,
      message: `Warning: Your attendance is ${attendancePercentage}%. Minimum required is 75%.`,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Send attendance reminder
   */
  sendAttendanceReminder(studentIds, sessionData) {
    studentIds.forEach((studentId) => {
      this.sendToClient(studentId, {
        type: "attendance_reminder",
        sessionId: sessionData.id,
        courseId: sessionData.course_id,
        sessionTime: sessionData.session_time,
        location: sessionData.location,
        message: "Attendance session is starting soon",
        timestamp: new Date().toISOString(),
      });
    });
  }

  /**
   * Periodic cleanup of inactive connections
   */
  startPeriodicCleanup() {
    setInterval(() => {
      const now = Date.now();
      const inactiveThreshold = 5 * 60 * 1000; // 5 minutes

      this.clients.forEach((client, userId) => {
        if (client.ws.readyState === WebSocket.CLOSED) {
          this.clients.delete(userId);
          return;
        }

        // Check for inactive connections
        if (now - client.lastActivity > inactiveThreshold) {
          if (client.ws.isAlive === false) {
            client.ws.terminate();
            this.clients.delete(userId);
            return;
          }

          client.ws.isAlive = false;
          client.ws.ping();
        }
      });
    }, 30000); // Check every 30 seconds
  }

  /**
   * Get active sessions count
   */
  getActiveSessionsCount() {
    return Array.from(this.sessions.values()).filter(
      (session) => session.isActive
    ).length;
  }

  /**
   * Get connected clients count
   */
  getConnectedClientsCount() {
    return this.clients.size;
  }

  /**
   * Get session statistics
   */
  getSessionStats(sessionId) {
    const session = this.sessions.get(sessionId);
    if (!session) return null;

    return {
      sessionId,
      isActive: session.isActive,
      startTime: session.startTime,
      endTime: session.endTime,
      attendanceMarked: session.attendanceMarked.size,
      subscribedClients: Array.from(this.clients.values()).filter((client) =>
        client.subscribedSessions.has(sessionId)
      ).length,
    };
  }
}

// Create singleton instance
const websocketService = new WebSocketService();

module.exports = websocketService;
