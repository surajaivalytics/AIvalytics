const nodemailer = require("nodemailer");
const { db } = require("../config/database");
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
    try {
      const now = new Date();
      const twoHoursLater = new Date(now.getTime() + 2 * 60 * 60 * 1000);
      const snap = await db
        .collection("attendance_session")
        .where("status", "==", "scheduled")
        .where("session_date", ">=", now.toISOString().split("T")[0])
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Get students for a session
   */
  async getStudentsForSession(sessionId) {
    try {
      const sessionDoc = await db.collection("attendance_session").doc(sessionId).get();
      if (!sessionDoc.exists) return [];
      const session = sessionDoc.data();
      if (!session.course_id) return [];
      const snap = await db
        .collection("user")
        .where("role", "==", "student")
        .where("course_ids", "array-contains", session.course_id)
        .get();
      return snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Get students with low attendance
   */
  async getLowAttendanceStudents() {
    try {
      const snap = await db
        .collection("attendance_summary")
        .where("attendance_percentage", "<", 75)
        .get();
      return snap.docs.map((d) => ({ id: d.data().student_id, ...d.data() }));
    } catch (e) {
      return [];
    }
  }

  /**
   * Get teacher alerts
   */
  async getTeacherAlerts() {
    // Attendance alerting system - returns empty array until attendance Firestore model is set up
    return [];
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
      // Find teachers of the course via Firestore
      const coursesSnap = await db
        .collection("course")
        .where("teacher_id", "==", student.course_id)
        .get();

      for (const courseDoc of coursesSnap.docs) {
        const course = courseDoc.data();
        if (course.created_by) {
          websocketService.sendToClient(course.created_by, {
            type: "student_low_attendance",
            message: `Student ${student.name || student.username} has low attendance in ${student.course_name}`,
            studentData: student,
            timestamp: new Date().toISOString(),
          });
        }
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
