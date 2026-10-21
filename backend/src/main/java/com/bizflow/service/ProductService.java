package com.bizflow.service;

import com.bizflow.exception.ResourceNotFoundException;
import com.bizflow.model.Godown;
import com.bizflow.model.Product;
import com.bizflow.model.ProductCategory;
import com.bizflow.model.StockAdjustment;
import com.bizflow.repository.GodownRepository;
import com.bizflow.repository.ProductCategoryRepository;
import com.bizflow.repository.ProductRepository;
import com.bizflow.repository.StockAdjustmentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;

@Service
public class ProductService {

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final GodownRepository godownRepository;
    private final StockAdjustmentRepository stockAdjustmentRepository;

    public ProductService(ProductRepository productRepository,
                          ProductCategoryRepository categoryRepository,
                          GodownRepository godownRepository,
                          StockAdjustmentRepository stockAdjustmentRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.godownRepository = godownRepository;
        this.stockAdjustmentRepository = stockAdjustmentRepository;
    }

    public List<Product> list() {
        return productRepository.findAll();
    }

    public Product get(String id) {
        return productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id: " + id));
    }

    public List<Product> search(String query) {
        if (query == null || query.trim().isEmpty()) {
            return list();
        }
        return productRepository.search(query.trim());
    }

    public List<Product> getByCategory(String category) {
        return productRepository.findByCategory(category);
    }

    public List<Product> getLowStock() {
        return productRepository.findLowStockProducts();
    }

    @Transactional
    public Product create(Product product) {
        if (product.getId() == null || product.getId().trim().isEmpty()) {
            product.setId("p-" + UUID.randomUUID().toString().substring(0, 8));
        }
        if (product.getSku() == null || product.getSku().trim().isEmpty()) {
            product.setSku("SKU-" + System.currentTimeMillis());
        }
        return productRepository.save(product);
    }

    @Transactional
    public Product update(String id, Product patch) {
        Product existing = get(id);
        if (patch.getName() != null) existing.setName(patch.getName());
        if (patch.getSku() != null) existing.setSku(patch.getSku());
        if (patch.getBarcode() != null) existing.setBarcode(patch.getBarcode());
        if (patch.getCategory() != null) existing.setCategory(patch.getCategory());
        if (patch.getBrand() != null) existing.setBrand(patch.getBrand());
        if (patch.getUnit() != null) existing.setUnit(patch.getUnit());
        if (patch.getPurchasePrice() > 0) existing.setPurchasePrice(patch.getPurchasePrice());
        if (patch.getSellingPrice() > 0) existing.setSellingPrice(patch.getSellingPrice());
        if (patch.getMrp() != null) existing.setMrp(patch.getMrp());
        if (patch.getWholesalePrice() != null) existing.setWholesalePrice(patch.getWholesalePrice());
        if (patch.getTaxType() != null) existing.setTaxType(patch.getTaxType());
        if (patch.getGstRate() >= 0) existing.setGstRate(patch.getGstRate());
        if (patch.getHsn() != null) existing.setHsn(patch.getHsn());
        if (patch.getCurrentStock() >= 0) existing.setCurrentStock(patch.getCurrentStock());
        if (patch.getMinStock() >= 0) existing.setMinStock(patch.getMinStock());
        if (patch.getGodown() != null) existing.setGodown(patch.getGodown());
        if (patch.getImage() != null) existing.setImage(patch.getImage());
        if (patch.getStatus() != null) existing.setStatus(patch.getStatus());
        if (patch.getIsCrackers() != null) existing.setIsCrackers(patch.getIsCrackers());
        if (patch.getCrackers() != null) existing.setCrackers(patch.getCrackers());

        return productRepository.save(existing);
    }

    @Transactional
    public void delete(String id) {
        Product existing = get(id);
        productRepository.delete(existing);
    }

    @Transactional
    public Product duplicate(String id) {
        Product source = get(id);
        Product copy = new Product();
        copy.setId("p-" + UUID.randomUUID().toString().substring(0, 8));
        copy.setName(source.getName() + " (Copy)");
        copy.setSku(source.getSku() + "-COPY-" + (int)(Math.random() * 1000));
        copy.setBarcode(source.getBarcode());
        copy.setCategory(source.getCategory());
        copy.setBrand(source.getBrand());
        copy.setUnit(source.getUnit());
        copy.setPurchasePrice(source.getPurchasePrice());
        copy.setSellingPrice(source.getSellingPrice());
        copy.setMrp(source.getMrp());
        copy.setWholesalePrice(source.getWholesalePrice());
        copy.setTaxType(source.getTaxType());
        copy.setGstRate(source.getGstRate());
        copy.setHsn(source.getHsn());
        copy.setOpeningStock(source.getCurrentStock());
        copy.setCurrentStock(source.getCurrentStock());
        copy.setMinStock(source.getMinStock());
        copy.setGodown(source.getGodown());
        copy.setImage(source.getImage());
        copy.setStatus(source.getStatus());
        copy.setIsCrackers(source.getIsCrackers());
        copy.setCrackers(source.getCrackers());

        return productRepository.save(copy);
    }

    @Transactional
    public Product adjustStock(String productId, int delta, String reason, String notes) {
        Product product = get(productId);
        int newStock = Math.max(0, product.getCurrentStock() + delta);
        product.setCurrentStock(newStock);
        productRepository.save(product);

        StockAdjustment adj = new StockAdjustment();
        adj.setId("adj-" + UUID.randomUUID().toString().substring(0, 8));
        adj.setProductId(productId);
        adj.setProductName(product.getName());
        adj.setType(delta >= 0 ? "in" : "out");
        adj.setQty(Math.abs(delta));
        adj.setReason(reason != null ? reason : (delta >= 0 ? "Stock Added" : "Stock Reduced"));
        adj.setNotes(notes);
        adj.setDate(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        stockAdjustmentRepository.save(adj);

        return product;
    }

    public List<StockAdjustment> getStockAdjustments(String productId) {
        if (productId != null && !productId.isEmpty()) {
            return stockAdjustmentRepository.findByProductId(productId);
        }
        return stockAdjustmentRepository.findAll();
    }

    // Categories
    public List<ProductCategory> listCategories() {
        return categoryRepository.findAll();
    }

    public ProductCategory addCategory(ProductCategory category) {
        if (category.getId() == null || category.getId().isEmpty()) {
            category.setId("cat-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return categoryRepository.save(category);
    }

    public void deleteCategory(String id) {
        categoryRepository.deleteById(id);
    }

    // Godowns
    public List<Godown> listGodowns() {
        return godownRepository.findAll();
    }

    public Godown addGodown(Godown godown) {
        if (godown.getId() == null || godown.getId().isEmpty()) {
            godown.setId("gdn-" + UUID.randomUUID().toString().substring(0, 8));
        }
        return godownRepository.save(godown);
    }

    public void deleteGodown(String id) {
        godownRepository.deleteById(id);
    }

    @Transactional
    public int importProducts(List<Product> products) {
        int count = 0;
        for (Product p : products) {
            create(p);
            count++;
        }
        return count;
    }
}
