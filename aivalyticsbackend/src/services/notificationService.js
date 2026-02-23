const nodemailer = require("nodemailer");
const { pool } = require("../config/database");
const websocketService = require("./websocketService");

class NotificationService {
  constructor() {
    this.emailTransporter = null;
    this.initializeEmailTransporter();
  }

  /**
   * Initialize email transporter
   */
  initializeEmailTransporter() {
    // Configure email transporter (replace with your email service)
    this.emailTransporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: process.env.SMTP_PORT || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  /**
   * Send attendance reminder notifications
   */
  async sendAttendanceReminders() {
    try {
      // Get upcoming sessions (next 2 hours)
      const upcomingSessions = await this.getUpcomingSessions();

      for (const session of upcomingSessions) {
        const students = await this.getStudentsForSession(session.id);

        // Send WebSocket notifications
        const sessionData = {
          id: session.id,
          course_id: session.course_id,
          session_time: session.session_time,
          location: session.location,
        };

        const studentIds = students.map((s) => s.id);
        websocketService.sendAttendanceReminder(studentIds, sessionData);

        // Send email notifications
        for (const student of students) {
          await this.sendReminderEmail(student, session);
        }

        // Send SMS notifications (if enabled)
        if (process.env.SMS_ENABLED === "true") {
          for (const student of students) {
            await this.sendReminderSMS(student, session);
          }
        }
      }

      console.log(
        `Sent attendance reminders for ${upcomingSessions.length} sessions`
      );
    } catch (error) {
      console.error("Error sending attendance reminders:", error);
    }
  }

  /**
   * Send low attendance warnings
   */
  async sendLowAttendanceWarnings() {
    try {
      const lowAttendanceStudents = await this.getLowAttendanceStudents();

      for (const student of lowAttendanceStudents) {
        // Send WebSocket notification
        websocketService.sendLowAttendanceWarning(
          student.id,
          student.course_id,
          student.attendance_percentage
        );

        // Send email warning
        await this.sendLowAttendanceEmail(student);

        // Notify parents/guardians
        if (student.parent_email) {
          await this.sendParentNotification(student);
        }

        // Notify teachers
        await this.notifyTeachers(student);
      }

      console.log(
        `Sent low attendance warnings to ${lowAttendanceStudents.length} students`
      );
    } catch (error) {
      console.error("Error sending low attendance warnings:", error);
    }
  }

  /**
   * Send teacher attendance alerts
   */
  async sendTeacherAttendanceAlerts() {
    try {
      const teacherAlerts = await this.getTeacherAlerts();

      for (const alert of teacherAlerts) {
        // Send WebSocket notification
        websocketService.sendToClient(alert.teacher_id, {
          type: "teacher_attendance_alert",
          message: alert.message,
          data: alert.data,
          timestamp: new Date().toISOString(),
        });

        // Send email alert
        await this.sendTeacherAlertEmail(alert);
      }

      console.log(`Sent teacher alerts: ${teacherAlerts.length}`);
    } catch (error) {
      console.error("Error sending teacher alerts:", error);
    }
  }

  /**
   * Get upcoming sessions
   */
  async getUpcomingSessions() {
    const query = `
      SELECT 
        as_session.id,
        as_session.course_id,
        as_session.session_date,
        as_session.session_time,
        as_session.location,
        c.name as course_name
      FROM attendance_session as_session
      JOIN course c ON as_session.course_id = c.id
      WHERE 
        as_session.session_date = CURRENT_DATE
        AND as_session.session_time BETWEEN 
          (CURRENT_TIME + INTERVAL '30 minutes') 
          AND (CURRENT_TIME + INTERVAL '2 hours')
        AND as_session.status = 'scheduled'
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get students for a session
   */
  async getStudentsForSession(sessionId) {
    const query = `
      SELECT DISTINCT
        u.id,
        u.name,
        u.email,
        u.phone,
        u.parent_email
      FROM user u
      JOIN user_course uc ON u.id = uc.user_id
      JOIN attendance_session as_session ON uc.course_id = as_session.course_id
      WHERE 
        as_session.id = $1
        AND u.role = 'student'
        AND uc.status = 'active'
    `;

    const result = await pool.query(query, [sessionId]);
    return result.rows;
  }

  /**
   * Get students with low attendance
   */
  async getLowAttendanceStudents() {
    const query = `
      SELECT 
        u.id,
        u.name,
        u.email,
        u.parent_email,
        c.id as course_id,
        c.name as course_name,
        COALESCE(as_summary.attendance_percentage, 0) as attendance_percentage
      FROM user u
      JOIN user_course uc ON u.id = uc.user_id
      JOIN course c ON uc.course_id = c.id
      LEFT JOIN attendance_summary as_summary ON u.id = as_summary.student_id AND c.id = as_summary.course_id
      WHERE 
        u.role = 'student'
        AND uc.status = 'active'
        AND COALESCE(as_summary.attendance_percentage, 0) < 75
        AND COALESCE(as_summary.total_sessions, 0) >= 5
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Get teacher alerts
   */
  async getTeacherAlerts() {
    const alerts = [];

    // Alert for sessions without attendance marked
    const unmatchedSessions = await pool.query(`
      SELECT 
        as_session.id,
        as_session.course_id,
        as_session.session_date,
        c.name as course_name,
        u.id as teacher_id,
        u.name as teacher_name,
        u.email as teacher_email
      FROM attendance_session as_session
      JOIN course c ON as_session.course_id = c.id
      JOIN user u ON c.teacher_id = u.id
      WHERE 
        as_session.session_date < CURRENT_DATE
        AND as_session.status = 'scheduled'
        AND NOT EXISTS (
          SELECT 1 FROM attendance a 
          WHERE a.session_id = as_session.id
        )
    `);

    for (const session of unmatchedSessions.rows) {
      alerts.push({
        type: "unmatched_session",
        teacher_id: session.teacher_id,
        teacher_name: session.teacher_name,
        teacher_email: session.teacher_email,
        message: `Attendance not marked for ${session.course_name} session on ${session.session_date}`,
        data: session,
      });
    }

    // Alert for classes with low overall attendance
    const lowAttendanceClasses = await pool.query(`
      SELECT 
        c.id as course_id,
        c.name as course_name,
        u.id as teacher_id,
        u.name as teacher_name,
        u.email as teacher_email,
        AVG(as_summary.attendance_percentage) as avg_attendance
      FROM course c
      JOIN user u ON c.teacher_id = u.id
      JOIN attendance_summary as_summary ON c.id = as_summary.course_id
      GROUP BY c.id, c.name, u.id, u.name, u.email
      HAVING AVG(as_summary.attendance_percentage) < 70
    `);

    for (const classData of lowAttendanceClasses.rows) {
      alerts.push({
        type: "low_class_attendance",
        teacher_id: classData.teacher_id,
        teacher_name: classData.teacher_name,
        teacher_email: classData.teacher_email,
        message: `${
          classData.course_name
        } has low average attendance: ${classData.avg_attendance.toFixed(1)}%`,
        data: classData,
      });
    }

    return alerts;
  }

  /**
   * Send reminder email
   */
  async sendReminderEmail(student, session) {
    const emailContent = {
      from: process.env.SMTP_FROM || "noreply@college.edu",
      to: student.email,
      subject: `Attendance Reminder - ${session.course_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Attendance Reminder</h2>
          <p>Dear ${student.name},</p>
          <p>This is a reminder that you have a class session coming up:</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">${
              session.course_name
            }</h3>
            <p style="margin: 5px 0;"><strong>Date:</strong> ${new Date(
              session.session_date
            ).toLocaleDateString()}</p>
            <p style="margin: 5px 0;"><strong>Time:</strong> ${
              session.session_time
            }</p>
            ${
              session.location
                ? `<p style="margin: 5px 0;"><strong>Location:</strong> ${session.location}</p>`
                : ""
            }
          </div>
          
          <p>Please make sure to attend on time. Your attendance is important for your academic success.</p>
          
          <p>Best regards,<br>Academic Office</p>
        </div>
      `,
    };

    try {
      await this.emailTransporter.sendMail(emailContent);
      console.log(`Reminder email sent to ${student.email}`);
    } catch (error) {
      console.error(
        `Failed to send reminder email to ${student.email}:`,
        error
      );
    }
  }

  /**
   * Send low attendance warning email
   */
  async sendLowAttendanceEmail(student) {
    const emailContent = {
      from: process.env.SMTP_FROM || "noreply@college.edu",
      to: student.email,
      subject: `Low Attendance Warning - ${student.course_name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Low Attendance Warning</h2>
          <p>Dear ${student.name},</p>
          <p>We are writing to inform you that your attendance in <strong>${
            student.course_name
          }</strong> is below the required minimum.</p>
          
          <div style="background-color: #fef2f2; border-left: 4px solid #dc2626; padding: 20px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #dc2626;">Current Attendance: ${student.attendance_percentage.toFixed(
              1
            )}%</h3>
            <p style="margin: 0; color: #991b1b;">Minimum Required: 75%</p>
          </div>
          
          <p>To avoid academic penalties, please ensure regular attendance in upcoming sessions. If you have any concerns or need assistance, please contact your course instructor or the academic office.</p>
          
          <p><strong>Important:</strong> Continued low attendance may result in:</p>
          <ul>
            <li>Academic probation</li>
            <li>Inability to appear for examinations</li>
            <li>Course failure</li>
          </ul>
          
          <p>Best regards,<br>Academic Office</p>
        </div>
      `,
    };

    try {
      await this.emailTransporter.sendMail(emailContent);
      console.log(`Low attendance warning sent to ${student.email}`);
    } catch (error) {
      console.error(
        `Failed to send low attendance warning to ${student.email}:`,
        error
      );
    }
  }

  /**
   * Send parent notification
   */
  async sendParentNotification(student) {
    if (!student.parent_email) return;

    const emailContent = {
      from: process.env.SMTP_FROM || "noreply@college.edu",
      to: student.parent_email,
      subject: `Student Attendance Alert - ${student.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #dc2626;">Student Attendance Alert</h2>
          <p>Dear Parent/Guardian,</p>
          <p>We are writing to inform you about your child's attendance status.</p>
          
          <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #1f2937;">Student: ${
              student.name
            }</h3>
            <p style="margin: 5px 0;"><strong>Course:</strong> ${
              student.course_name
            }</p>
            <p style="margin: 5px 0;"><strong>Current Attendance:</strong> ${student.attendance_percentage.toFixed(
              1
            )}%</p>
            <p style="margin: 5px 0;"><strong>Required Minimum:</strong> 75%</p>
          </div>
          
          <p>We recommend discussing the importance of regular attendance with your child to ensure their academic success.</p>
          
          <p>If you have any questions or concerns, please feel free to contact us.</p>
          
          <p>Best regards,<br>Academic Office</p>
        </div>
      `,
    };

    try {
      await this.emailTransporter.sendMail(emailContent);
      console.log(`Parent notification sent to ${student.parent_email}`);
    } catch (error) {
      console.error(
        `Failed to send parent notification to ${student.parent_email}:`,
        error
      );
    }
  }

  /**
   * Send teacher alert email
   */
  async sendTeacherAlertEmail(alert) {
    const emailContent = {
      from: process.env.SMTP_FROM || "noreply@college.edu",
      to: alert.teacher_email,
      subject: `Teacher Alert - ${alert.type.replace("_", " ").toUpperCase()}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f59e0b;">Teacher Alert</h2>
          <p>Dear ${alert.teacher_name},</p>
          <p>${alert.message}</p>
          
          <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin: 0 0 10px 0; color: #92400e;">Action Required</h3>
            <p style="margin: 0;">Please log into the system to review and take appropriate action.</p>
          </div>
          
          <p>Best regards,<br>Academic Administration</p>
        </div>
      `,
    };

    try {
      await this.emailTransporter.sendMail(emailContent);
      console.log(`Teacher alert sent to ${alert.teacher_email}`);
    } catch (error) {
      console.error(
        `Failed to send teacher alert to ${alert.teacher_email}:`,
        error
      );
    }
  }

  /**
   * Send reminder SMS
   */
  async sendReminderSMS(student, session) {
    // Implement SMS sending logic here
    // This would integrate with services like Twilio, AWS SNS, etc.
    console.log(
      `SMS reminder would be sent to ${student.phone} for ${session.course_name}`
    );
  }

  /**
   * Notify teachers about student issues
   */
  async notifyTeachers(student) {
    try {
      const teacherQuery = `
        SELECT u.id, u.name, u.email
        FROM user u
        JOIN course c ON u.id = c.teacher_id
        WHERE c.id = $1
      `;

      const result = await pool.query(teacherQuery, [student.course_id]);

      for (const teacher of result.rows) {
        websocketService.sendToClient(teacher.id, {
          type: "student_low_attendance",
          message: `Student ${
            student.name
          } has low attendance (${student.attendance_percentage.toFixed(
            1
          )}%) in ${student.course_name}`,
          studentData: student,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error notifying teachers:", error);
    }
  }

  /**
   * Schedule periodic notifications
   */
  startPeriodicNotifications() {
    // Send reminders every 30 minutes
    setInterval(() => {
      this.sendAttendanceReminders();
    }, 30 * 60 * 1000);

    // Check for low attendance daily at 8 AM
    const dailyCheck = () => {
      const now = new Date();
      if (now.getHours() === 8 && now.getMinutes() === 0) {
        this.sendLowAttendanceWarnings();
        this.sendTeacherAttendanceAlerts();
      }
    };

    setInterval(dailyCheck, 60 * 1000); // Check every minute

    console.log("Periodic notification system started");
  }

  /**
   * Send custom notification
   */
  async sendCustomNotification(recipients, subject, message, type = "info") {
    for (const recipient of recipients) {
      // Send WebSocket notification
      websocketService.sendToClient(recipient.id, {
        type: "custom_notification",
        subject,
        message,
        notificationType: type,
        timestamp: new Date().toISOString(),
      });

      // Send email notification
      if (recipient.email) {
        const emailContent = {
          from: process.env.SMTP_FROM || "noreply@college.edu",
          to: recipient.email,
          subject,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2>${subject}</h2>
              <p>Dear ${recipient.name},</p>
              <div style="background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                ${message}
              </div>
              <p>Best regards,<br>Academic Office</p>
            </div>
          `,
        };

        try {
          await this.emailTransporter.sendMail(emailContent);
        } catch (error) {
          console.error(
            `Failed to send custom notification to ${recipient.email}:`,
            error
          );
        }
      }
    }
  }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = notificationService;
