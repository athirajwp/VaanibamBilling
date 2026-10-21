package com.bizflow.service;

import com.bizflow.dto.CustomerReportDto;
import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.Customer;
import com.bizflow.model.Invoice;
import com.bizflow.repository.CustomerRepository;
import com.bizflow.repository.InvoiceRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final InvoiceRepository invoiceRepository;

    public CustomerService(CustomerRepository customerRepository, InvoiceRepository invoiceRepository) {
        this.customerRepository = customerRepository;
        this.invoiceRepository = invoiceRepository;
    }

    public List<Customer> list() {
        return customerRepository.findAll();
    }

    public Customer get(String id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with id: " + id));
    }

    public List<Customer> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return list();
        }
        return customerRepository.search(query.trim());
    }

    @Transactional
    public Customer create(Customer customer) {
        if (customer.getId() == null || customer.getId().trim().isEmpty()) {
            customer.setId("c-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return customerRepository.save(customer);
    }

    @Transactional
    public Customer update(String id, Customer patch) {
        Customer existing = get(id);
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getPhone() != null) existing.setPhone(patch.getPhone());
        if (patch.getEmail() != null) existing.setEmail(patch.getEmail());
        if (patch.getAddress() != null) existing.setAddress(patch.getAddress());
        if (patch.getGstin() != null) existing.setGstin(patch.getGstin());
        if (patch.getCreditLimit() != null) existing.setCreditLimit(patch.getCreditLimit());
        if (patch.getOpeningBalance() != null) existing.setOpeningBalance(patch.getOpeningBalance());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());

        return customerRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        Customer existing = get(id);
        customerRepository.delete(existing);
    }

    public CustomerReportDto getLedger(String id) {
        Customer c = get(id);
        List<Invoice> invoices = invoiceRepository.findByCustomerIdOrderByDateDesc(id);
        double totalSales = invoices.stream().filter(i -> !"cancelled".equals(i.getStatus())).mapToDouble(Invoice::getGrandTotal).sum();
        double totalPaid = invoices.stream().filter(i -> !"cancelled".equals(i.getStatus())).mapToDouble(Invoice::getAmountPaid).sum();
        double opening = c.getOpeningBalance() != null ? c.getOpeningBalance() : 0.0;
        double outstanding = totalSales - totalPaid + opening;
        String lastPurchase = invoices.isEmpty() ? null : invoices.get(0).getDate();

        return new CustomerReportDto(c.getId(), c.getName(), c.getPhone(), c.getEmail(), c.getGstin(),
                totalSales, totalPaid, outstanding, lastPurchase);
    }
}
