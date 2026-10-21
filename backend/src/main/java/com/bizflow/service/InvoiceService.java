package com.bizflow.service;

import com.bizflow.dto.DraftInvoiceDto;
import com.bizflow.dto.InvoiceItemDto;
import com.bizflow.dto.PaymentRecordDto;
import com.bizflow.exception.BadRequestException;
import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.*;
import com.bizflow.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final BusinessInfoRepository businessInfoRepository;
    private final SalesReturnRepository salesReturnRepository;

    public InvoiceService(InvoiceRepository invoiceRepository,
                          CustomerRepository customerRepository,
                          ProductRepository productRepository,
                          BusinessInfoRepository businessInfoRepository,
                          SalesReturnRepository salesReturnRepository) {
        this.invoiceRepository = invoiceRepository;
        this.customerRepository = customerRepository;
        this.productRepository = productRepository;
        this.businessInfoRepository = businessInfoRepository;
        this.salesReturnRepository = salesReturnRepository;
    }

    public List<Invoice> list() {
        return invoiceRepository.findAllOrderByCreatedAtDesc();
    }

    public Invoice get(String id) {
        return invoiceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Invoice not found with id: " + id));
    }

    public List<Invoice> getByCustomer(String customerId) {
        return invoiceRepository.findByCustomerIdOrderByDateDesc(customerId);
    }

    private synchronized String generateNextInvoiceNumber() {
        String prefix = businessInfoRepository.findById("default")
                .map(BusinessInfo::getInvoicePrefix)
                .orElse("INV");
        if (prefix == null || prefix.trim().isEmpty()) {
            prefix = "INV";
        }

        List<Invoice> list = invoiceRepository.findAll();
        int max = 1000;
        Pattern pattern = Pattern.compile("(\\d+)");
        for (Invoice inv : list) {
            if (inv.getInvoiceNumber() != null) {
                Matcher matcher = pattern.matcher(inv.getInvoiceNumber());
                while (matcher.find()) {
                    try {
                        int num = Integer.parseInt(matcher.group(1));
                        if (num > max) max = num;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return prefix + "-" + (max + 1);
    }

    @Transactional
    public Invoice createInvoice(DraftInvoiceDto dto) {
        String customerName = "Walk-in Customer";
        if (dto.getCustomerId() != null && !dto.getCustomerId().isEmpty()) {
            customerName = customerRepository.findById(dto.getCustomerId())
                    .map(Customer::getName)
                    .orElse("Walk-in Customer");
        } else {
            dto.setCustomerId("walk-in");
        }

        String invoiceNumber = generateNextInvoiceNumber();
        double grandTotal = dto.getGrandTotal();
        double amountPaid = 0.0;
        String paymentMethod = null;

        if (dto.getPayment() != null) {
            paymentMethod = dto.getPayment().getMethod();
            amountPaid = Math.min(dto.getPayment().getAmount(), grandTotal);
        }

        String status = dto.getStatus() != null ? dto.getStatus() : "completed";
        String paymentStatus;
        if ("draft".equalsIgnoreCase(status)) {
            paymentStatus = "pending";
        } else if (amountPaid >= grandTotal) {
            paymentStatus = "paid";
        } else if (amountPaid > 0) {
            paymentStatus = "partial";
        } else {
            paymentStatus = "pending";
        }

        Invoice invoice = new Invoice();
        invoice.setId("inv-" + UUID.randomUUID().toString().substring(0, 8));
        invoice.setInvoiceNumber(invoiceNumber);
        invoice.setCustomerId(dto.getCustomerId());
        invoice.setCustomerName(customerName);
        invoice.setDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        invoice.setSubtotal(dto.getSubtotal());
        invoice.setDiscount(dto.getDiscount());
        invoice.setCgst(dto.getCgst());
        invoice.setSgst(dto.getSgst());
        invoice.setIgst(dto.getIgst());
        invoice.setGrandTotal(grandTotal);
        invoice.setAmountPaid(amountPaid);
        invoice.setPaymentStatus(paymentStatus);
        invoice.setPaymentMethod(paymentMethod);
        invoice.setStatus(status);
        invoice.setNotes(dto.getNotes());

        if (dto.getItems() != null) {
            for (InvoiceItemDto itDto : dto.getItems()) {
                InvoiceItem item = new InvoiceItem();
                item.setId("it-" + UUID.randomUUID().toString().substring(0, 8));
                item.setProductId(itDto.getProductId());
                item.setProductName(itDto.getProductName());
                item.setSku(itDto.getSku());
                item.setQty(itDto.getQty());
                item.setPrice(itDto.getPrice());
                item.setDiscount(itDto.getDiscount());
                item.setGstRate(itDto.getGstRate());
                item.setGstAmount(itDto.getGstAmount());
                item.setTotal(itDto.getTotal());
                invoice.addItem(item);

                // Deduct stock if invoice is not draft
                if (!"draft".equalsIgnoreCase(status) && itDto.getProductId() != null) {
                    productRepository.findById(itDto.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(Math.max(0, p.getCurrentStock() - itDto.getQty()));
                        productRepository.save(p);
                    });
                }
            }
        }

        return invoiceRepository.save(invoice);
    }

    @Transactional
    public Invoice updateInvoice(String id, Invoice patch) {
        Invoice existing = get(id);
        if (patch.getCustomerId() != null) existing.setCustomerId(patch.getCustomerId());
        if (patch.getCustomerName() != null) existing.setCustomerName(patch.getCustomerName());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return invoiceRepository.save(existing);
    }

    @Transactional
    public Invoice recordPayment(String id, PaymentRecordDto payment) {
        Invoice existing = get(id);
        double paid = Math.min(existing.getAmountPaid() + payment.getAmount(), existing.getGrandTotal());
        existing.setAmountPaid(paid);
        existing.setPaymentMethod(payment.getMethod());

        if (paid >= existing.getGrandTotal()) {
            existing.setPaymentStatus("paid");
        } else if (paid > 0) {
            existing.setPaymentStatus("partial");
        } else {
            existing.setPaymentStatus("pending");
        }

        return invoiceRepository.save(existing);
    }

    @Transactional
    public Invoice cancelInvoice(String id) {
        Invoice existing = get(id);
        if ("cancelled".equalsIgnoreCase(existing.getStatus())) {
            return existing;
        }

        // Restore product stock
        if (existing.getItems() != null) {
            for (InvoiceItem item : existing.getItems()) {
                if (item.getProductId() != null) {
                    productRepository.findById(item.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(p.getCurrentStock() + item.getQty());
                        productRepository.save(p);
                    });
                }
            }
        }

        existing.setStatus("cancelled");
        existing.setPaymentStatus("pending");
        return invoiceRepository.save(existing);
    }

    @Transactional
    public Invoice duplicateInvoice(String id) {
        Invoice source = get(id);
        String nextNumber = generateNextInvoiceNumber();

        Invoice copy = new Invoice();
        copy.setId("inv-" + UUID.randomUUID().toString().substring(0, 8));
        copy.setInvoiceNumber(nextNumber);
        copy.setCustomerId(source.getCustomerId());
        copy.setCustomerName(source.getCustomerName());
        copy.setDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        copy.setSubtotal(source.getSubtotal());
        copy.setDiscount(source.getDiscount());
        copy.setCgst(source.getCgst());
        copy.setSgst(source.getSgst());
        copy.setIgst(source.getIgst());
        copy.setGrandTotal(source.getGrandTotal());
        copy.setAmountPaid(0);
        copy.setPaymentStatus("pending");
        copy.setStatus("draft");
        copy.setNotes(source.getNotes());

        if (source.getItems() != null) {
            for (InvoiceItem item : source.getItems()) {
                InvoiceItem copyItem = new InvoiceItem();
                copyItem.setId("it-" + UUID.randomUUID().toString().substring(0, 8));
                copyItem.setProductId(item.getProductId());
                copyItem.setProductName(item.getProductName());
                copyItem.setSku(item.getSku());
                copyItem.setQty(item.getQty());
                copyItem.setPrice(item.getPrice());
                copyItem.setDiscount(item.getDiscount());
                copyItem.setGstRate(item.getGstRate());
                copyItem.setGstAmount(item.getGstAmount());
                copyItem.setTotal(item.getTotal());
                copy.addItem(copyItem);
            }
        }

        return invoiceRepository.save(copy);
    }

    // Sales Returns
    public List<SalesReturn> listReturns() {
        return salesReturnRepository.findAllOrderByCreatedAtDesc();
    }

    @Transactional
    public SalesReturn createReturn(SalesReturn salesReturn) {
        if (salesReturn.getId() == null || salesReturn.getId().isEmpty()) {
            salesReturn.setId("ret-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (salesReturn.getReturnNumber() == null || salesReturn.getReturnNumber().isEmpty()) {
            salesReturn.setReturnNumber("RET-" + (100 + salesReturnRepository.count() + 1));
        }

        // Restore stock and calculate refund
        double refunded = 0.0;
        if (salesReturn.getItems() != null) {
            for (SalesReturnItem item : salesReturn.getItems()) {
                if (item.getId() == null || item.getId().isEmpty()) {
                    item.setId("rit-" + UUID.randomUUID().toString().substring(0, 8));
                }
                refunded += item.getTotal();
                if (item.getProductId() != null) {
                    productRepository.findById(item.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(p.getCurrentStock() + item.getQty());
                        productRepository.save(p);
                    });
                }
            }
        }
        salesReturn.setTotal(refunded);
        SalesReturn savedReturn = salesReturnRepository.save(salesReturn);

        // Update corresponding invoice if present
        if (salesReturn.getInvoiceId() != null) {
            invoiceRepository.findById(salesReturn.getInvoiceId()).ifPresent(inv -> {
                double newPaid = Math.max(0, inv.getAmountPaid() - savedReturn.getTotal());
                inv.setAmountPaid(newPaid);
                if (newPaid >= inv.getGrandTotal()) {
                    inv.setPaymentStatus("paid");
                } else if (newPaid > 0) {
                    inv.setPaymentStatus("partial");
                } else {
                    inv.setPaymentStatus("pending");
                }
                invoiceRepository.save(inv);
            });
        }

        return savedReturn;
    }
}
