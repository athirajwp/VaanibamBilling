package com.bizflow.service;

import com.bizflow.dto.DraftInvoiceDto;
import com.bizflow.dto.DraftPurchaseDto;
import com.bizflow.dto.PaymentRecordDto;
import com.bizflow.dto.PurchaseItemDto;
import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.*;
import com.bizflow.repository.ProductRepository;
import com.bizflow.repository.PurchaseRepository;
import com.bizflow.repository.PurchaseReturnRepository;
import com.bizflow.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class PurchaseService {

    private final PurchaseRepository purchaseRepository;
    private final SupplierRepository supplierRepository;
    private final ProductRepository productRepository;
    private final PurchaseReturnRepository purchaseReturnRepository;

    public PurchaseService(PurchaseRepository purchaseRepository,
                           SupplierRepository supplierRepository,
                           ProductRepository productRepository,
                           PurchaseReturnRepository purchaseReturnRepository) {
        this.purchaseRepository = purchaseRepository;
        this.supplierRepository = supplierRepository;
        this.productRepository = productRepository;
        this.purchaseReturnRepository = purchaseReturnRepository;
    }

    public List<Purchase> list() {
        return purchaseRepository.findAllOrderByCreatedAtDesc();
    }

    public Purchase get(String id) {
        return purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
    }

    public List<Purchase> getBySupplier(String supplierId) {
        return purchaseRepository.findBySupplierIdOrderByDateDesc(supplierId);
    }

    private synchronized String generateNextBillNumber() {
        List<Purchase> list = purchaseRepository.findAll();
        int max = 2000;
        Pattern pattern = Pattern.compile("(\\d+)");
        for (Purchase p : list) {
            if (p.getBillNumber() != null) {
                Matcher matcher = pattern.matcher(p.getBillNumber());
                while (matcher.find()) {
                    try {
                        int num = Integer.parseInt(matcher.group(1));
                        if (num > max) max = num;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return "PUR-" + (max + 1);
    }

    @Transactional
    public Purchase createPurchase(DraftPurchaseDto dto) {
        String supplierName = supplierRepository.findById(dto.getSupplierId())
                .map(Supplier::getName)
                .orElse("Unknown Supplier");

        String billNumber = generateNextBillNumber();
        double grandTotal = dto.getGrandTotal();
        double amountPaid = 0.0;
        String paymentMethod = null;

        if (dto.getPayment() != null) {
            paymentMethod = dto.getPayment().getMethod();
            amountPaid = Math.min(dto.getPayment().getAmount(), grandTotal);
        }

        String paymentStatus;
        if (amountPaid >= grandTotal) {
            paymentStatus = "paid";
        } else if (amountPaid > 0) {
            paymentStatus = "partial";
        } else {
            paymentStatus = "pending";
        }

        Purchase purchase = new Purchase();
        purchase.setId("pur-" + UUID.randomUUID().toString().substring(0, 8));
        purchase.setBillNumber(billNumber);
        purchase.setSupplierId(dto.getSupplierId());
        purchase.setSupplierName(supplierName);
        purchase.setSupplierInvoiceNumber(dto.getSupplierInvoiceNumber());
        purchase.setDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        purchase.setSubtotal(dto.getSubtotal());
        purchase.setDiscount(dto.getDiscount());
        purchase.setCgst(dto.getCgst());
        purchase.setSgst(dto.getSgst());
        purchase.setGrandTotal(grandTotal);
        purchase.setAmountPaid(amountPaid);
        purchase.setPaymentStatus(paymentStatus);
        purchase.setPaymentMethod(paymentMethod);
        purchase.setStatus("completed");
        purchase.setNotes(dto.getNotes());

        if (dto.getItems() != null) {
            for (PurchaseItemDto itDto : dto.getItems()) {
                PurchaseItem item = new PurchaseItem();
                item.setId("pit-" + UUID.randomUUID().toString().substring(0, 8));
                item.setProductId(itDto.getProductId());
                item.setProductName(itDto.getProductName());
                item.setSku(itDto.getSku());
                item.setQty(itDto.getQty());
                item.setPrice(itDto.getPrice());
                item.setPurchasePrice(itDto.getPurchasePrice() > 0 ? itDto.getPurchasePrice() : itDto.getPrice());
                item.setDiscount(itDto.getDiscount());
                item.setGstRate(itDto.getGstRate());
                item.setGstAmount(itDto.getGstAmount());
                item.setTotal(itDto.getTotal());
                purchase.addItem(item);

                // Add to product current stock and update purchase price if provided
                if (itDto.getProductId() != null) {
                    productRepository.findById(itDto.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(p.getCurrentStock() + itDto.getQty());
                        if (itDto.getPurchasePrice() > 0) {
                            p.setPurchasePrice(itDto.getPurchasePrice());
                        }
                        productRepository.save(p);
                    });
                }
            }
        }

        return purchaseRepository.save(purchase);
    }

    @Transactional
    public Purchase updatePurchase(String id, Purchase patch) {
        Purchase existing = get(id);
        if (patch.getSupplierInvoiceNumber() != null) existing.setSupplierInvoiceNumber(patch.getSupplierInvoiceNumber());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getNotes() != null) existing.setNotes(patch.getNotes());
        return purchaseRepository.save(existing);
    }

    @Transactional
    public Purchase recordPayment(String id, PaymentRecordDto payment) {
        Purchase existing = get(id);
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

        return purchaseRepository.save(existing);
    }

    @Transactional
    public Purchase cancelPurchase(String id) {
        Purchase existing = get(id);
        if ("cancelled".equalsIgnoreCase(existing.getStatus())) {
            return existing;
        }

        // Deduct inventory that was added
        if (existing.getItems() != null) {
            for (PurchaseItem item : existing.getItems()) {
                if (item.getProductId() != null) {
                    productRepository.findById(item.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(Math.max(0, p.getCurrentStock() - item.getQty()));
                        productRepository.save(p);
                    });
                }
            }
        }

        existing.setStatus("cancelled");
        return purchaseRepository.save(existing);
    }

    // Purchase Returns
    public List<PurchaseReturn> listReturns() {
        return purchaseReturnRepository.findAllOrderByCreatedAtDesc();
    }

    @Transactional
    public PurchaseReturn createReturn(PurchaseReturn returnObj) {
        if (returnObj.getId() == null || returnObj.getId().isEmpty()) {
            returnObj.setId("pret-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (returnObj.getReturnNumber() == null || returnObj.getReturnNumber().isEmpty()) {
            returnObj.setReturnNumber("PRET-" + (100 + purchaseReturnRepository.count() + 1));
        }

        double total = 0.0;
        if (returnObj.getItems() != null) {
            for (PurchaseReturnItem item : returnObj.getItems()) {
                if (item.getId() == null || item.getId().isEmpty()) {
                    item.setId("prit-" + UUID.randomUUID().toString().substring(0, 8));
                }
                total += item.getTotal();
                // Reduce stock since items returned to supplier
                if (item.getProductId() != null) {
                    productRepository.findById(item.getProductId()).ifPresent(p -> {
                        p.setCurrentStock(Math.max(0, p.getCurrentStock() - item.getQty()));
                        productRepository.save(p);
                    });
                }
            }
        }
        returnObj.setTotal(total);
        return purchaseReturnRepository.save(returnObj);
    }
}
