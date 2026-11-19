package com.workshophub.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

import jakarta.mail.internet.MimeMessage;

/**
 * Service handling email notifications including password reset verification links.
 * Works with JavaMailSender when SMTP is configured, and logs gracefully with direct link if offline.
 */
@Service
public class EmailService {

    private static final Logger log = LoggerFactory.getLogger(EmailService.class);

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:}")
    private String mailUsername;

    public EmailService(@Autowired(required = false) JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends password reset verification email containing a secure 1-hour expiration link.
     * Verification is done strictly through an email link (no OTP required).
     */
    public boolean sendPasswordResetEmail(String toEmail, String recipientName, String resetUrl) {
        log.info("[EmailService] Password reset requested for: {}. Link: {}", toEmail, resetUrl);

        if (mailSender == null || mailUsername == null || mailUsername.isBlank()) {
            log.warn("[EmailService] Mail sender not configured or missing username. Reset link logged to console.");
            return false;
        }

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            String sender = mailUsername.contains("@") ? mailUsername : "noreply@kaushalya.edu";
            helper.setFrom(sender, "Kaushalya Academic Workshops");
            helper.setTo(toEmail);
            helper.setSubject("Reset Your Kaushalya Account Password");

            String displayName = (recipientName != null && !recipientName.isBlank()) ? recipientName : "Learner";

            String html = """
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <title>Password Reset</title>
                </head>
                <body style="font-family: Arial, sans-serif; background-color: #FFF5E9; padding: 24px; color: #101D32; margin: 0;">
                    <table width="100%%" border="0" cellspacing="0" cellpadding="0" style="max-width: 600px; margin: 0 auto; background: #ffffff; border: 2px solid #101D32; border-radius: 16px; box-shadow: 6px 6px 0px #101D32; overflow: hidden;">
                        <tr>
                            <td style="background-color: #F4511E; padding: 24px; text-align: center; border-bottom: 2px solid #101D32;">
                                <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.5px;">Kaushalya</h1>
                                <p style="color: #FFF5E9; margin: 4px 0 0; font-size: 13px; font-weight: bold;">Academic Skills & Workshop Hub</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding: 32px 28px;">
                                <h2 style="color: #101D32; font-size: 20px; margin-top: 0;">Password Reset Request</h2>
                                <p style="font-size: 14px; line-height: 1.6; color: #101D32;">
                                    Hello <strong>%s</strong>,
                                </p>
                                <p style="font-size: 14px; line-height: 1.6; color: #101D32;">
                                    We received a request to reset the password for your Kaushalya account associated with <strong>%s</strong>.
                                </p>
                                <p style="font-size: 14px; line-height: 1.6; color: #101D32;">
                                    Click the button below to verify your email and set a new password:
                                </p>
                                <div style="text-align: center; margin: 32px 0;">
                                    <a href="%s" style="background-color: #F4511E; color: #ffffff; text-decoration: none; padding: 14px 32px; font-weight: bold; font-size: 14px; border-radius: 10px; border: 2px solid #101D32; box-shadow: 4px 4px 0px #101D32; display: inline-block;">
                                        Reset My Password
                                    </a>
                                </div>
                                <p style="font-size: 12px; color: #666; line-height: 1.5;">
                                    Or copy and paste this link into your browser:<br>
                                    <a href="%s" style="color: #F4511E; word-break: break-all;">%s</a>
                                </p>
                                <div style="margin-top: 24px; padding: 16px; background-color: #FFF5E9; border: 1px solid #101D32; border-radius: 8px; font-size: 12px; color: #101D32;">
                                    <strong>Note:</strong> This verification link is valid for <strong>1 hour</strong>. If you did not make this request, you can safely ignore this email. Your password will remain unchanged.
                                </div>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color: #FFF5E9; padding: 16px; text-align: center; font-size: 11px; color: #777; border-top: 1px solid #101D32;">
                                &copy; 2026 Kaushalya Workshop Registration System. All rights reserved.
                            </td>
                        </tr>
                    </table>
                </body>
                </html>
                """.formatted(displayName, toEmail, resetUrl, resetUrl, resetUrl);

            helper.setText(html, true);
            mailSender.send(message);
            log.info("[EmailService] Password reset email successfully delivered to: {}", toEmail);
            return true;
        } catch (Exception e) {
            log.error("[EmailService] Failed to send email via SMTP to {}: {}", toEmail, e.getMessage());
            return false;
        }
    }
}
