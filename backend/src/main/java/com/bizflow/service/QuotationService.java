package com.bizflow.service;

import com.bizflow.dto.DraftInvoiceDto;
import com.bizflow.dto.InvoiceItemDto;
import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.Customer;
import com.bizflow.model.Invoice;
import com.bizflow.model.Quotation;
import com.bizflow.model.QuotationItem;
import com.bizflow.repository.CustomerRepository;
import com.bizflow.repository.QuotationRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final CustomerRepository customerRepository;
    private final InvoiceService invoiceService;

    public QuotationService(QuotationRepository quotationRepository,
                            CustomerRepository customerRepository,
                            InvoiceService invoiceService) {
        this.quotationRepository = quotationRepository;
        this.customerRepository = customerRepository;
        this.invoiceService = invoiceService;
    }

    public List<Quotation> list() {
        return quotationRepository.findAllOrderByCreatedAtDesc();
    }

    public Quotation get(String id) {
        return quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with id: " + id));
    }

    public List<Quotation> getByCustomer(String customerId) {
        return quotationRepository.findByCustomerIdOrderByDateDesc(customerId);
    }

    private synchronized String generateNextQuotationNumber() {
        List<Quotation> list = quotationRepository.findAll();
        int max = 100;
        Pattern pattern = Pattern.compile("(\\d+)");
        for (Quotation q : list) {
            if (q.getQuotationNumber() != null) {
                Matcher matcher = pattern.matcher(q.getQuotationNumber());
                while (matcher.find()) {
                    try {
                        int num = Integer.parseInt(matcher.group(1));
                        if (num > max) max = num;
                    } catch (NumberFormatException ignored) {}
                }
            }
        }
        return "QT-" + (max + 1);
    }

    @Transactional
    public Quotation createQuotation(DraftInvoiceDto dto) {
        String customerName = "Walk-in Customer";
        if (dto.getCustomerId() != null && !dto.getCustomerId().isEmpty()) {
            customerName = customerRepository.findById(dto.getCustomerId())
                    .map(Customer::getName)
                    .orElse("Walk-in Customer");
        } else {
            dto.setCustomerId("walk-in");
        }

        Quotation q = new Quotation();
        q.setId("quo-" + UUID.randomUUID().toString().substring(0, 8));
        q.setQuotationNumber(generateNextQuotationNumber());
        q.setCustomerId(dto.getCustomerId());
        q.setCustomerName(customerName);
        q.setDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        q.setValidUntil(LocalDateTime.now().plusDays(7).format(DateTimeFormatter.ISO_DATE_TIME));
        q.setSubtotal(dto.getSubtotal());
        q.setDiscount(dto.getDiscount());
        q.setTax(dto.getCgst() + dto.getSgst() + dto.getIgst());
        q.setGrandTotal(dto.getGrandTotal());
        q.setStatus("sent");

        if (dto.getItems() != null) {
            for (InvoiceItemDto itDto : dto.getItems()) {
                QuotationItem item = new QuotationItem();
                item.setId("qit-" + UUID.randomUUID().toString().substring(0, 8));
                item.setProductId(itDto.getProductId());
                item.setProductName(itDto.getProductName());
                item.setSku(itDto.getSku());
                item.setQty(itDto.getQty());
                item.setPrice(itDto.getPrice());
                item.setDiscount(itDto.getDiscount());
                item.setGstRate(itDto.getGstRate());
                item.setGstAmount(itDto.getGstAmount());
                item.setTotal(itDto.getTotal());
                q.addItem(item);
            }
        }

        return quotationRepository.save(q);
    }

    @Transactional
    public Quotation updateStatus(String id, String status) {
        Quotation q = get(id);
        q.setStatus(status);
        return quotationRepository.save(q);
    }

    @Transactional
    public Invoice convertToInvoice(String id) {
        Quotation quotation = get(id);
        DraftInvoiceDto draft = new DraftInvoiceDto();
        draft.setCustomerId(quotation.getCustomerId());
        draft.setSubtotal(quotation.getSubtotal());
        draft.setDiscount(quotation.getDiscount());
        draft.setCgst(Math.round(quotation.getTax() / 2.0));
        draft.setSgst(Math.round(quotation.getTax() / 2.0));
        draft.setIgst(0);
        draft.setGrandTotal(quotation.getGrandTotal());
        draft.setStatus("completed");
        draft.setNotes("Converted from Quotation " + quotation.getQuotationNumber());

        List<InvoiceItemDto> items = new ArrayList<>();
        if (quotation.getItems() != null) {
            for (QuotationItem qi : quotation.getItems()) {
                InvoiceItemDto itemDto = new InvoiceItemDto();
                itemDto.setProductId(qi.getProductId());
                itemDto.setProductName(qi.getProductName());
                itemDto.setSku(qi.getSku());
                itemDto.setQty(qi.getQty());
                itemDto.setPrice(qi.getPrice());
                itemDto.setDiscount(qi.getDiscount());
                itemDto.setGstRate(qi.getGstRate());
                itemDto.setGstAmount(qi.getGstAmount());
                itemDto.setTotal(qi.getTotal());
                items.add(itemDto);
            }
        }
        draft.setItems(items);

        Invoice created = invoiceService.createInvoice(draft);
        quotation.setStatus("converted");
        quotationRepository.save(quotation);

        return created;
    }

    @Transactional
    public void delete(String id) {
        Quotation q = get(id);
        quotationRepository.delete(q);
    }
}
