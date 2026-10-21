package com.bizflow.controller;

import com.bizflow.dto.StockAdjustmentDto;
import com.bizflow.model.Godown;
import com.bizflow.model.Product;
import com.bizflow.model.ProductCategory;
import com.bizflow.model.StockAdjustment;
import com.bizflow.service.ProductService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Products & Inventory", description = "Endpoints for managing products, categories, godowns, and stock adjustments")
public class ProductController {

    private final ProductService productService;

    public ProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    @Operation(summary = "List all products or search by query")
    public List<Product> list(@RequestParam(value = "q", required = false) String q,
                              @RequestParam(value = "category", required = false) String category) {
        if (category != null && !category.isEmpty()) {
            return productService.getByCategory(category);
        }
        if (q != null && !q.trim().isEmpty()) {
            return productService.search(q);
        }
        return productService.list();
    }

    @GetMapping("/low-stock")
    @Operation(summary = "Get products with low stock levels")
    public List<Product> getLowStock() {
        return productService.getLowStock();
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get product by ID")
    public Product get(@PathVariable String id) {
        return productService.get(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new product")
    public Product create(@RequestBody Product product) {
        return productService.create(product);
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing product")
    public Product update(@PathVariable String id, @RequestBody Product patch) {
        return productService.update(id, patch);
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product")
    public void delete(@PathVariable String id) {
        productService.delete(id);
    }

    @PostMapping("/{id}/duplicate")
    @Operation(summary = "Duplicate a product")
    public Product duplicate(@PathVariable String id) {
        return productService.duplicate(id);
    }

    @PostMapping("/adjust-stock")
    @Operation(summary = "Adjust stock quantity for a product")
    public Product adjustStock(@RequestBody StockAdjustmentDto dto) {
        int delta = "out".equalsIgnoreCase(dto.getType()) ? -Math.abs(dto.getQty()) : Math.abs(dto.getQty());
        return productService.adjustStock(dto.getProductId(), delta, dto.getReason(), dto.getNotes());
    }

    @GetMapping("/adjustments")
    @Operation(summary = "List stock adjustments")
    public List<StockAdjustment> listAdjustments(@RequestParam(value = "productId", required = false) String productId) {
        return productService.getStockAdjustments(productId);
    }

    @PostMapping("/import")
    @Operation(summary = "Bulk import products")
    public ResponseEntity<Integer> importProducts(@RequestBody List<Product> products) {
        int imported = productService.importProducts(products);
        return ResponseEntity.ok(imported);
    }

    // Categories endpoints under /api/products/categories
    @GetMapping("/categories")
    @Operation(summary = "List all product categories")
    public List<ProductCategory> listCategories() {
        return productService.listCategories();
    }

    @PostMapping("/categories")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a product category")
    public ProductCategory addCategory(@RequestBody ProductCategory category) {
        return productService.addCategory(category);
    }

    @DeleteMapping("/categories/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a product category")
    public void deleteCategory(@PathVariable String id) {
        productService.deleteCategory(id);
    }

    // Godowns endpoints under /api/products/godowns
    @GetMapping("/godowns")
    @Operation(summary = "List all godowns / warehouses")
    public List<Godown> listGodowns() {
        return productService.listGodowns();
    }

    @PostMapping("/godowns")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Add a godown")
    public Godown addGodown(@RequestBody Godown godown) {
        return productService.addGodown(godown);
    }

    @DeleteMapping("/godowns/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(summary = "Delete a godown")
    public void deleteGodown(@PathVariable String id) {
        productService.deleteGodown(id);
    }
}
