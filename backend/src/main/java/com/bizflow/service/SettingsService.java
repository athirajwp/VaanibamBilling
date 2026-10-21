package com.bizflow.service;

import com.bizflow.dto.AppSettingsDto;
import com.bizflow.model.*;
import com.bizflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class SettingsService {

    private final BusinessInfoRepository businessInfoRepository;
    private final InvoiceSettingsRepository invoiceSettingsRepository;
    private final TaxSettingRepository taxSettingRepository;
    private final UserRepository userRepository;
    private final PrinterSettingRepository printerSettingRepository;
    private final OnlineStoreSettingsRepository onlineStoreSettingsRepository;

    public SettingsService(BusinessInfoRepository businessInfoRepository,
                           InvoiceSettingsRepository invoiceSettingsRepository,
                           TaxSettingRepository taxSettingRepository,
                           UserRepository userRepository,
                           PrinterSettingRepository printerSettingRepository,
                           OnlineStoreSettingsRepository onlineStoreSettingsRepository) {
        this.businessInfoRepository = businessInfoRepository;
        this.invoiceSettingsRepository = invoiceSettingsRepository;
        this.taxSettingRepository = taxSettingRepository;
        this.userRepository = userRepository;
        this.printerSettingRepository = printerSettingRepository;
        this.onlineStoreSettingsRepository = onlineStoreSettingsRepository;
    }

    public AppSettingsDto getSettings() {
        BusinessInfo business = businessInfoRepository.findById("default").orElseGet(BusinessInfo::new);
        InvoiceSettings invoice = invoiceSettingsRepository.findById("default").orElseGet(InvoiceSettings::new);
        List<TaxSetting> taxes = taxSettingRepository.findAll();
        List<User> users = userRepository.findAll();
        List<PrinterSetting> printers = printerSettingRepository.findAll();
        OnlineStoreSettings onlineStore = onlineStoreSettingsRepository.findById("default").orElseGet(OnlineStoreSettings::new);

        return new AppSettingsDto(business, invoice, taxes, users, printers, onlineStore);
    }

    public BusinessInfo getBusiness() {
        return businessInfoRepository.findById("default").orElseGet(BusinessInfo::new);
    }

    @Transactional
    public BusinessInfo updateBusiness(BusinessInfo patch) {
        BusinessInfo existing = businessInfoRepository.findById("default").orElseGet(BusinessInfo::new);
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getLogo() != null) existing.setLogo(patch.getLogo());
        if (patch.getPhone() != null) existing.setPhone(patch.getPhone());
        if (patch.getEmail() != null) existing.setEmail(patch.getEmail());
        if (patch.getAddress() != null) existing.setAddress(patch.getAddress());
        if (patch.getGstin() != null) existing.setGstin(patch.getGstin());
        if (patch.getCurrency() != null) existing.setCurrency(patch.getCurrency());
        if (patch.getInvoicePrefix() != null) existing.setInvoicePrefix(patch.getInvoicePrefix());
        if (patch.getIndustry() != null) existing.setIndustry(patch.getIndustry());
        return businessInfoRepository.save(existing);
    }

    @Transactional
    public InvoiceSettings updateInvoice(InvoiceSettings patch) {
        InvoiceSettings existing = invoiceSettingsRepository.findById("default").orElseGet(InvoiceSettings::new);
        if (patch.getTemplate() != null) existing.setTemplate(patch.getTemplate());
        if (patch.getPaperSize() != null) existing.setPaperSize(patch.getPaperSize());
        existing.setShowLogo(patch.isShowLogo());
        existing.setShowGst(patch.isShowGst());
        existing.setShowSignature(patch.isShowSignature());
        existing.setShowBankDetails(patch.isShowBankDetails());
        if (patch.getFooterText() != null) existing.setFooterText(patch.getFooterText());
        if (patch.getDefaultPaymentTerms() != null) existing.setDefaultPaymentTerms(patch.getDefaultPaymentTerms());
        return invoiceSettingsRepository.save(existing);
    }

    @Transactional
    public List<TaxSetting> saveTaxes(List<TaxSetting> taxes) {
        taxSettingRepository.deleteAll();
        return taxSettingRepository.saveAll(taxes);
    }

    @Transactional
    public List<User> saveUsers(List<User> users) {
        userRepository.deleteAll();
        return userRepository.saveAll(users);
    }

    @Transactional
    public List<PrinterSetting> savePrinters(List<PrinterSetting> printers) {
        printerSettingRepository.deleteAll();
        return printerSettingRepository.saveAll(printers);
    }

    @Transactional
    public OnlineStoreSettings updateOnlineStore(OnlineStoreSettings patch) {
        OnlineStoreSettings existing = onlineStoreSettingsRepository.findById("default").orElseGet(OnlineStoreSettings::new);
        if (patch.getStoreName() != null) existing.setStoreName(patch.getStoreName());
        if (patch.getTagline() != null) existing.setTagline(patch.getTagline());
        if (patch.getLogo() != null) existing.setLogo(patch.getLogo());
        if (patch.getBanner() != null) existing.setBanner(patch.getBanner());
        if (patch.getContact() != null) existing.setContact(patch.getContact());
        if (patch.getEmail() != null) existing.setEmail(patch.getEmail());
        if (patch.getAddress() != null) existing.setAddress(patch.getAddress());
        if (patch.getTheme() != null) existing.setTheme(patch.getTheme());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getProductsPublished() != null) existing.setProductsPublished(patch.getProductsPublished());
        return onlineStoreSettingsRepository.save(existing);
    }
}
