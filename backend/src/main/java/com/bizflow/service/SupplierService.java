package com.bizflow.service;

import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.Purchase;
import com.bizflow.model.Supplier;
import com.bizflow.repository.PurchaseRepository;
import com.bizflow.repository.SupplierRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class SupplierService {

    private final SupplierRepository supplierRepository;
    private final PurchaseRepository purchaseRepository;

    public SupplierService(SupplierRepository supplierRepository, PurchaseRepository purchaseRepository) {
        this.supplierRepository = supplierRepository;
        this.purchaseRepository = purchaseRepository;
    }

    public List<Supplier> list() {
        return supplierRepository.findAll();
    }

    public Supplier get(String id) {
        return supplierRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Supplier not found with id: " + id));
    }

    public List<Supplier> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return list();
        }
        return supplierRepository.search(query.trim());
    }

    @Transactional
    public Supplier create(Supplier supplier) {
        if (supplier.getId() == null || supplier.getId().trim().isEmpty()) {
            supplier.setId("s-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return supplierRepository.save(supplier);
    }

    @Transactional
    public Supplier update(String id, Supplier patch) {
        Supplier existing = get(id);
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getPhone() != null) existing.setPhone(patch.getPhone());
        if (patch.getEmail() != null) existing.setEmail(patch.getEmail());
        if (patch.getAddress() != null) existing.setAddress(patch.getAddress());
        if (patch.getGstin() != null) existing.setGstin(patch.getGstin());
        if (patch.getOpeningBalance() != null) existing.setOpeningBalance(patch.getOpeningBalance());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());

        return supplierRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        Supplier existing = get(id);
        supplierRepository.delete(existing);
    }

    public Map<String, Object> getLedger(String id) {
        Supplier s = get(id);
        List<Purchase> purchases = purchaseRepository.findBySupplierIdOrderByDateDesc(id);
        double totalPurchases = purchases.stream().filter(p -> !"cancelled".equals(p.getStatus())).mapToDouble(Purchase::getGrandTotal).sum();
        double totalPaid = purchases.stream().filter(p -> !"cancelled".equals(p.getStatus())).mapToDouble(Purchase::getAmountPaid).sum();
        double opening = s.getOpeningBalance() != null ? s.getOpeningBalance() : 0.0;
        double balance = totalPurchases - totalPaid + opening;
        String lastPurchase = purchases.isEmpty() ? null : purchases.get(0).getDate();

        Map<String, Object> ledger = new HashMap<>();
        ledger.put("id", s.getId());
        ledger.put("name", s.getName());
        ledger.put("phone", s.getPhone());
        ledger.put("email", s.getEmail());
        ledger.put("gstin", s.getGstin());
        ledger.put("totalPurchases", totalPurchases);
        ledger.put("totalPaid", totalPaid);
        ledger.put("balance", balance);
        ledger.put("lastPurchase", lastPurchase);
        ledger.put("purchases", purchases);

        return ledger;
    }
}
