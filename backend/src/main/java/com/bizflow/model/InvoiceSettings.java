package com.bizflow.model;

import jakarta.persistence.*;

@Entity
@Table(name = "invoice_settings")
public class InvoiceSettings {

    @Id
    private String id = "default";

    private String template = "modern";
    private String paperSize = "a4";
    private boolean showLogo = true;
    private boolean showGst = true;
    private boolean showSignature = true;
    private boolean showBankDetails = true;

    @Column(length = 500)
    private String footerText = "Thank you for your business!";

    private String defaultPaymentTerms = "Due on receipt";

    public InvoiceSettings() {}

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getTemplate() {
        return template;
    }

    public void setTemplate(String template) {
        this.template = template;
    }

    public String getPaperSize() {
        return paperSize;
    }

    public void setPaperSize(String paperSize) {
        this.paperSize = paperSize;
    }

    public boolean isShowLogo() {
        return showLogo;
    }

    public void setShowLogo(boolean showLogo) {
        this.showLogo = showLogo;
    }

    public boolean isShowGst() {
        return showGst;
    }

    public void setShowGst(boolean showGst) {
        this.showGst = showGst;
    }

    public boolean isShowSignature() {
        return showSignature;
    }

    public void setShowSignature(boolean showSignature) {
        this.showSignature = showSignature;
    }

    public boolean isShowBankDetails() {
        return showBankDetails;
    }

    public void setShowBankDetails(boolean showBankDetails) {
        this.showBankDetails = showBankDetails;
    }

    public String getFooterText() {
        return footerText;
    }

    public void setFooterText(String footerText) {
        this.footerText = footerText;
    }

    public String getDefaultPaymentTerms() {
        return defaultPaymentTerms;
    }

    public void setDefaultPaymentTerms(String defaultPaymentTerms) {
        this.defaultPaymentTerms = defaultPaymentTerms;
    }
}
