package com.bizflow;

import com.bizflow.model.Product;
import com.bizflow.repository.ProductRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
class BizflowBackendApplicationTests {

    @Autowired
    private ProductRepository productRepository;

    @Test
    void contextLoadsAndSeedsDatabase() {
        assertNotNull(productRepository);
        long count = productRepository.count();
        assertTrue(count > 0, "Products should have been seeded into SQLite database");
    }
}
