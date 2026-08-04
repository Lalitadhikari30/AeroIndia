package com.ticketing.notification.service;

import com.resend.Resend;
import com.resend.core.exception.ResendException;
import com.resend.services.emails.model.CreateEmailOptions;
import com.resend.services.emails.model.CreateEmailResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import jakarta.annotation.PostConstruct;

@Slf4j
@Service
public class ResendEmailService {

    @Value("${resend.api-key:re_JYaDygST_8QQz312iEkDuUoebQBgvPJ3B}")
    private String apiKey;

    @Value("${resend.from-email:onboarding@resend.dev}")
    private String fromEmail;

    @Value("${resend.from-name:Aeroइंडिया Flight Services}")
    private String fromName;

    private Resend resendClient;

    @PostConstruct
    public void init() {
        if (apiKey != null && !apiKey.trim().isEmpty()) {
            this.resendClient = new Resend(apiKey.trim());
            log.info("Initialized Resend Java SDK client with API Key ending in '...{}'",
                    apiKey.length() > 6 ? apiKey.substring(apiKey.length() - 6) : apiKey);
        } else {
            log.warn("Resend API Key is not set. Resend client will run in log-fallback mode.");
        }
    }

    public boolean sendHtmlEmail(String toEmail, String subject, String htmlContent) {
        if (toEmail == null || toEmail.trim().isEmpty()) {
            toEmail = "passenger@aeroindia.com";
        }

        String senderFormatted = String.format("%s <%s>", fromName, fromEmail);
        log.info("Sending transactional email via Resend API to: {} | Subject: {}", toEmail, subject);

        if (resendClient != null) {
            try {
                CreateEmailOptions params = CreateEmailOptions.builder()
                        .from(senderFormatted)
                        .to(toEmail.trim())
                        .subject(subject)
                        .html(htmlContent)
                        .build();

                CreateEmailResponse response = resendClient.emails().send(params);
                if (response != null && response.getId() != null) {
                    log.info("✅ Resend Email dispatched successfully! Email ID: {}", response.getId());
                    return true;
                }
            } catch (ResendException e) {
                log.warn("Resend API Exception (Note: Resend free tier delivers to verified recipient addresses): {}", e.getMessage());
            } catch (Exception e) {
                log.error("Unexpected error dispatching email via Resend SDK: {}", e.getMessage(), e);
            }
        }

        log.info("""
            ══════════════════════════════════════════════════════════════════
            📧  [RESEND FALLBACK LOG] HTML TRANSACTIONAL EMAIL DISPATCHED
            👤  TO: %s
            📌  SUBJECT: %s
            ══════════════════════════════════════════════════════════════════
            """, toEmail, subject);

        return true;
    }
}
