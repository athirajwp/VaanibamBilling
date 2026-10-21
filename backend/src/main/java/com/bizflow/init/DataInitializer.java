package com.bizflow.init;

import com.bizflow.model.*;
import com.bizflow.repository.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataInitializer.class);

    private final ProductRepository productRepository;
    private final ProductCategoryRepository categoryRepository;
    private final GodownRepository godownRepository;
    private final CustomerRepository customerRepository;
    private final SupplierRepository supplierRepository;
    private final InvoiceRepository invoiceRepository;
    private final QuotationRepository quotationRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final BusinessInfoRepository businessInfoRepository;
    private final InvoiceSettingsRepository invoiceSettingsRepository;
    private final TaxSettingRepository taxSettingRepository;
    private final UserRepository userRepository;
    private final PrinterSettingRepository printerSettingRepository;
    private final OnlineStoreSettingsRepository onlineStoreSettingsRepository;

    public DataInitializer(ProductRepository productRepository,
                           ProductCategoryRepository categoryRepository,
                           GodownRepository godownRepository,
                           CustomerRepository customerRepository,
                           SupplierRepository supplierRepository,
                           InvoiceRepository invoiceRepository,
                           QuotationRepository quotationRepository,
                           PurchaseRepository purchaseRepository,
                           ExpenseRepository expenseRepository,
                           BusinessInfoRepository businessInfoRepository,
                           InvoiceSettingsRepository invoiceSettingsRepository,
                           TaxSettingRepository taxSettingRepository,
                           UserRepository userRepository,
                           PrinterSettingRepository printerSettingRepository,
                           OnlineStoreSettingsRepository onlineStoreSettingsRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.godownRepository = godownRepository;
        this.customerRepository = customerRepository;
        this.supplierRepository = supplierRepository;
        this.invoiceRepository = invoiceRepository;
        this.quotationRepository = quotationRepository;
        this.purchaseRepository = purchaseRepository;
        this.expenseRepository = expenseRepository;
        this.businessInfoRepository = businessInfoRepository;
        this.invoiceSettingsRepository = invoiceSettingsRepository;
        this.taxSettingRepository = taxSettingRepository;
        this.userRepository = userRepository;
        this.printerSettingRepository = printerSettingRepository;
        this.onlineStoreSettingsRepository = onlineStoreSettingsRepository;
    }

    @Override
    @Transactional
    public void run(String... args) {
        if (productRepository.count() > 0) {
            log.info("Database already contains data. Skipping initial seeding.");
            return;
        }

        log.info("Initializing SQLite database with BizFlow seed data...");

        // 1. Business Info
        BusinessInfo business = new BusinessInfo();
        business.setId("default");
        business.setName("Sri Lakshmi Crackers");
        business.setPhone("04562 223344");
        business.setEmail("srilakshmicrackers@gmail.com");
        business.setAddress("No. 12, GST Main Road, Sivakasi, Tamil Nadu - 626123");
        business.setGstin("33AABCSL1234F1Z5");
        business.setCurrency("INR");
        business.setInvoicePrefix("INV");
        business.setIndustry("Crackers");
        businessInfoRepository.save(business);

        // 2. Invoice Settings
        InvoiceSettings invSettings = new InvoiceSettings();
        invSettings.setId("default");
        invSettings.setTemplate("modern");
        invSettings.setPaperSize("a4");
        invSettings.setShowLogo(true);
        invSettings.setShowGst(true);
        invSettings.setShowSignature(true);
        invSettings.setShowBankDetails(true);
        invSettings.setFooterText("Thank you for your business!");
        invSettings.setDefaultPaymentTerms("Due on receipt");
        invoiceSettingsRepository.save(invSettings);

        // 3. Tax Settings
        List<TaxSetting> taxes = List.of(
                new TaxSetting("tax-1", "GST 18%", 18.0, "custom", true),
                new TaxSetting("tax-2", "GST 12%", 12.0, "custom", true),
                new TaxSetting("tax-3", "GST 5%", 5.0, "custom", true),
                new TaxSetting("tax-4", "CGST 9%", 9.0, "cgst", true),
                new TaxSetting("tax-5", "SGST 9%", 9.0, "sgst", true),
                new TaxSetting("tax-6", "IGST 18%", 18.0, "igst", true),
                new TaxSetting("tax-7", "Nil Rated", 0.0, "custom", true)
        );
        taxSettingRepository.saveAll(taxes);

        // 4. Users
        List<User> users = List.of(
                new User("u-1", "Athi Krishnan", "athi@bizflow.local", "98425 50000", "Owner", "active", "[\"all\"]"),
                new User("u-2", "Priya Raman", "priya@bizflow.local", "94435 60001", "Accountant", "active", "[\"reports\",\"expenses\",\"purchases\"]"),
                new User("u-3", "Rajesh Kumar", "rajesh@bizflow.local", "99940 70002", "Cashier", "active", "[\"billing\",\"customers\",\"products\"]"),
                new User("u-4", "Karthik Selvam", "karthik@bizflow.local", "96550 80003", "Manager", "active", "[\"billing\",\"inventory\",\"purchases\",\"products\"]"),
                new User("u-5", "Deepa N", "deepa@bizflow.local", "", "Staff", "inactive", "[\"billing\"]")
        );
        userRepository.saveAll(users);

        // 5. Printers
        List<PrinterSetting> printers = List.of(
                new PrinterSetting("pr-1", "HP LaserJet A4", "A4 Printer", true, true),
                new PrinterSetting("pr-2", "Epson TM-T82", "Thermal Printer", false, true),
                new PrinterSetting("pr-3", "Star Bluetooth Printer", "Bluetooth Printer", false, false),
                new PrinterSetting("pr-4", "Zebra GK420t", "Barcode Printer", false, false)
        );
        printerSettingRepository.saveAll(printers);

        // 6. Online Store
        OnlineStoreSettings store = new OnlineStoreSettings();
        store.setId("default");
        store.setStoreName("Sri Lakshmi Crackers Store");
        store.setTagline("Best fireworks at wholesale rates, delivered across Tamil Nadu.");
        store.setContact("04562 223344");
        store.setEmail("srilakshmicrackers@gmail.com");
        store.setAddress("No. 12, GST Main Road, Sivakasi, Tamil Nadu - 626123");
        store.setTheme("blue");
        store.setStatus("online");
        store.setProductsPublished("[\"p-001\",\"p-002\",\"p-003\",\"p-005\",\"p-007\",\"p-009\"]");
        onlineStoreSettingsRepository.save(store);

        // 7. Categories
        List<ProductCategory> categories = List.of(
                new ProductCategory("cat-sparkler", "Sparklers", "High quality sparklers"),
                new ProductCategory("cat-flowerpot", "Flower Pots", "Fountain firepots and cones"),
                new ProductCategory("cat-rocket", "Rockets", "Sky soaring rockets"),
                new ProductCategory("cat-chakkar", "Chakkars", "Ground spinning wheels"),
                new ProductCategory("cat-fancy", "Fancy Shots", "Aerial repeating display shots"),
                new ProductCategory("cat-gift", "Gift Boxes", "Assorted family gift packages"),
                new ProductCategory("cat-lakshmi", "Lakshmi", "Traditional sound crackers"),
                new ProductCategory("cat-ground", "Ground Spinners", "Musical ground spinners"),
                new ProductCategory("cat-bomb", "Bombs", "Hydro and atom sound crackers")
        );
        categoryRepository.saveAll(categories);

        // 8. Godowns
        List<Godown> godowns = List.of(
                new Godown("gdn-1", "Main Godown", "GST Road, Sivakasi", "Murugan S", "Main primary distribution store"),
                new Godown("gdn-2", "Sivakasi West Godown", "Sattur Highway, Sivakasi", "Velu P", "Bulk storage warehouse"),
                new Godown("gdn-3", "Factory Depot", "Kamaraj Nagar, Sivakasi", "Raman K", "Factory delivery and dispatch unit")
        );
        godownRepository.saveAll(godowns);

        // 9. Customers
        List<Customer> customers = List.of(
                createCustomer("c-001", "Walk-in Customer", "", "", "", "", 0.0, 0.0, "active"),
                createCustomer("c-002", "Kumar Stores", "98422 11223", "kumar.stores@gmail.com", "Tirunelveli Junction, Tirunelveli", "33AABCK1234F1Z5", 50000.0, 0.0, "active"),
                createCustomer("c-003", "Lakshmi Traders", "94431 44556", "lakshmitraders@yahoo.com", "Madurai Main Road, Madurai", "33AABCL5678G1Z8", 75000.0, 2500.0, "active"),
                createCustomer("c-004", "Sri Venkateshwara Agencies", "99941 22110", "venkateshwara@gmail.com", "Kamaraj Road, Kovilpatti", "33AABCV9012H1Z2", 40000.0, 0.0, "active"),
                createCustomer("c-005", "Raja Supermarket", "94861 77889", "raja.supermarket@gmail.com", "Virudhunagar, Tamil Nadu", "33AACCR3456J1Z7", 60000.0, 12000.0, "active"),
                createCustomer("c-006", "Ganesh Provision Stores", "94441 55667", "ganeshprovision@rediffmail.com", "Sankarankovil Road, Tenkasi", "33AACCG7890K1Z4", 35000.0, 0.0, "active"),
                createCustomer("c-007", "Murugan Distributors", "98431 00998", "murugandist@gmail.com", "Nellai Bazaar, Tirunelveli", "33AACCM1234L1Z9", 90000.0, 3000.0, "active"),
                createCustomer("c-008", "Bharathi Crackers Palace", "96555 11223", "bharathicrackers@gmail.com", "Aruppukottai, Tamil Nadu", "33AACCB5678M1Z1", 80000.0, 0.0, "active"),
                createCustomer("c-009", "Arun General Store", "99441 33445", "", "Srivilliputhur, Tamil Nadu", "33AACCA9012N1Z5", 25000.0, 5000.0, "active"),
                createCustomer("c-010", "Devi Stores", "90031 23456", "devistores@gmail.com", "Rajapalayam, Tamil Nadu", "33AACCD3456P1Z3", 45000.0, 0.0, "active")
        );
        customerRepository.saveAll(customers);

        // 10. Suppliers
        List<Supplier> suppliers = List.of(
                createSupplier("s-001", "Sri Lakshmi Fireworks Factory", "99441 22334", "slf.factory@gmail.com", "GST Road, Sivakasi", "33AABCSL1234F1Z1", 0.0, "active"),
                createSupplier("s-002", "Vedika Fireworks", "90031 55667", "vedika@fireworks.co.in", "Sattur Road, Sivakasi", "33AABCVE4567F1Z2", 25000.0, "active"),
                createSupplier("s-003", "Champion Pyrotech", "94441 77889", "sales@championpyro.in", "Kamaraj Nagar, Sivakasi", "33AABCCH7890F1Z3", 0.0, "active"),
                createSupplier("s-004", "Classic Sparklers & Co", "94861 99001", "classicsparklers@gmail.com", "Tiruthangal, Sivakasi", "33AABCCS1234F1Z4", 12000.0, "active"),
                createSupplier("s-005", "Brahmastra Fireworks", "98431 22334", "brahmastra@gmail.com", "Vathalagundu, Dindigul", "33AABCBRA567F1Z5", 0.0, "active")
        );
        supplierRepository.saveAll(suppliers);

        // 11. Products
        List<Product> products = List.of(
                createProduct("p-001", "5½\" Lakshmi Sparkler", "SKU-0001", "Sparklers", "Lakshmi", "Box", 1050, 1200, 24, 8, 18, "3605", "Sparkler", 10),
                createProduct("p-002", "7\" Champion Sparkler", "SKU-0002", "Sparklers", "Champion", "Box", 720, 850, 18, 6, 18, "3605", "Sparkler", 10),
                createProduct("p-003", "Flower Pot - 18 Shots", "SKU-0003", "Flower Pots", "Vedika", "Box", 320, 400, 40, 10, 18, "3605", "Flower Pot", 4),
                createProduct("p-004", "Flower Pot - 45 Shots", "SKU-0004", "Flower Pots", "Vedika", "Box", 780, 950, 12, 4, 18, "3605", "Flower Pot", 4),
                createProduct("p-005", "Brahmastra Rocket (10 pc)", "SKU-0005", "Rockets", "Brahmastra", "Box", 240, 300, 30, 8, 18, "3605", "Rocket", 10),
                createProduct("p-006", "White Rocket Combo", "SKU-0006", "Rockets", "Classic", "Box", 400, 480, 15, 5, 18, "3605", "Rocket", 12),
                createProduct("p-007", "Ground Chakkar", "SKU-0007", "Chakkars", "Vedika", "Box", 300, 360, 35, 10, 18, "3605", "Chakkar", 20),
                createProduct("p-008", "Colour Wheel Chakkar", "SKU-0008", "Chakkars", "Colour", "Box", 420, 500, 8, 4, 18, "3605", "Chakkar", 12),
                createProduct("p-009", "12 Shot Sky Display", "SKU-0009", "Fancy Shots", "Sky", "Box", 650, 800, 20, 5, 18, "3605", "Fancy", 1),
                createProduct("p-010", "25 Shot Royal Peacock", "SKU-0010", "Fancy Shots", "Lakshmi", "Box", 1200, 1450, 10, 3, 18, "3605", "Fancy", 1),
                createProduct("p-011", "Standard Family Gift Box", "SKU-0011", "Gift Boxes", "Standard", "Box", 1500, 1850, 16, 5, 18, "3605", "Gift Box", 1),
                createProduct("p-012", "Deluxe Festival Hamper", "SKU-0012", "Gift Boxes", "Lakshmi", "Box", 2800, 3400, 8, 3, 18, "3605", "Gift Box", 1),
                createProduct("p-013", "4\" Lakshmi Crackers (28 pc)", "SKU-0013", "Lakshmi", "Lakshmi", "Pkt", 120, 150, 50, 15, 18, "3605", "Sound", 28),
                createProduct("p-014", "Hydro Bomb Red", "SKU-0014", "Bombs", "Champion", "Box", 220, 280, 22, 6, 18, "3605", "Bomb", 10),
                createProduct("p-015", "Musical Ground Wheel", "SKU-0015", "Ground Spinners", "Classic", "Box", 340, 420, 14, 4, 18, "3605", "Spinner", 10)
        );
        productRepository.saveAll(products);

        // 12. Expenses
        String today = LocalDate.now().toString();
        List<Expense> expenses = List.of(
                createExpense("exp-1", today, "Rent", "Shop rent - Main Street", 12000, "bank", "paid"),
                createExpense("exp-2", today, "Salary", "Cashier salary - Rajesh", 15000, "bank", "paid"),
                createExpense("exp-3", today, "Electricity", "EB bill - store", 3400, "upi", "paid"),
                createExpense("exp-4", today, "Transport", "Delivery van diesel", 2200, "cash", "paid"),
                createExpense("exp-5", today, "Marketing", "Festival banner & posters", 3500, "upi", "paid"),
                createExpense("exp-6", today, "Maintenance", "Rack repair", 800, "cash", "paid"),
                createExpense("exp-7", today, "Other", "Tea & refreshments for staff", 600, "cash", "paid")
        );
        expenseRepository.saveAll(expenses);

        // 13. Sample Invoices
        Invoice inv1 = createInvoice("inv-001", "INV-1001", "c-002", "Kumar Stores",
                products.get(0), 2, products.get(2), 3, "paid", "upi");
        Invoice inv2 = createInvoice("inv-002", "INV-1002", "c-003", "Lakshmi Traders",
                products.get(4), 4, products.get(6), 2, "partial", "cash");
        Invoice inv3 = createInvoice("inv-003", "INV-1003", "c-005", "Raja Supermarket",
                products.get(8), 2, products.get(10), 1, "paid", "bank");
        invoiceRepository.saveAll(List.of(inv1, inv2, inv3));

        // 14. Sample Purchases
        Purchase pur1 = createPurchase("pur-001", "PUR-2001", "s-001", "Sri Lakshmi Fireworks Factory", "SLF/2026/099",
                products.get(0), 10, products.get(2), 15, "paid", "bank");
        Purchase pur2 = createPurchase("pur-002", "PUR-2002", "s-002", "Vedika Fireworks", "VED/882",
                products.get(3), 8, products.get(6), 20, "partial", "bank");
        purchaseRepository.saveAll(List.of(pur1, pur2));

        // 15. Sample Quotation
        Quotation quo1 = createQuotation("quo-001", "QT-101", "c-004", "Sri Venkateshwara Agencies",
                products.get(10), 5, products.get(11), 3);
        quotationRepository.save(quo1);

        log.info("Database initialized successfully with {} products, {} customers, {} suppliers, and {} invoices.",
                productRepository.count(), customerRepository.count(), supplierRepository.count(), invoiceRepository.count());
    }

    private Customer createCustomer(String id, String name, String phone, String email, String address, String gstin,
                                    double creditLimit, double openingBalance, String status) {
        Customer c = new Customer();
        c.setId(id);
        c.setName(name);
        c.setPhone(phone);
        c.setEmail(email);
        c.setAddress(address);
        c.setGstin(gstin);
        c.setCreditLimit(creditLimit);
        c.setOpeningBalance(openingBalance);
        c.setStatus(status);
        c.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return c;
    }

    private Supplier createSupplier(String id, String name, String phone, String email, String address, String gstin,
                                    double openingBalance, String status) {
        Supplier s = new Supplier();
        s.setId(id);
        s.setName(name);
        s.setPhone(phone);
        s.setEmail(email);
        s.setAddress(address);
        s.setGstin(gstin);
        s.setOpeningBalance(openingBalance);
        s.setStatus(status);
        s.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return s;
    }

    private Product createProduct(String id, String name, String sku, String category, String brand,
                                  String unit, double purchasePrice, double sellingPrice, int stock,
                                  int minStock, double gstRate, String hsn, String productType, int piecesPerBox) {
        Product p = new Product();
        p.setId(id);
        p.setName(name);
        p.setSku(sku);
        p.setBarcode("89010" + (1000 + (int)(Math.random() * 8000)));
        p.setCategory(category);
        p.setBrand(brand);
        p.setUnit(unit);
        p.setPurchasePrice(purchasePrice);
        p.setSellingPrice(sellingPrice);
        p.setMrp((double) Math.round(sellingPrice * 1.1));
        p.setWholesalePrice(sellingPrice * 0.92);
        p.setTaxType("gst");
        p.setGstRate(gstRate);
        p.setHsn(hsn);
        p.setOpeningStock(stock);
        p.setCurrentStock(stock);
        p.setMinStock(minStock);
        p.setGodown("Main Godown");
        p.setStatus("active");
        p.setIsCrackers(true);

        CrackersInfo crackers = new CrackersInfo();
        crackers.setProductType(productType);
        crackers.setBoxQuantity(piecesPerBox);
        crackers.setPiecesPerBox(piecesPerBox);
        crackers.setPurchaseUnit(unit);
        crackers.setSellingUnit("Piece");
        crackers.setWholesalePrice(sellingPrice * 0.92);
        crackers.setRetailPrice(sellingPrice);
        crackers.setSeasonalPrice((double) Math.round(sellingPrice * 1.15));
        crackers.setBulkPricing("[{\"from\":1,\"to\":10,\"price\":" + sellingPrice + "},{\"from\":11,\"to\":null,\"price\":" + (sellingPrice * 0.92) + "}]");
        p.setCrackers(crackers);

        p.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return p;
    }

    private Expense createExpense(String id, String date, String category, String description, double amount,
                                  String paymentMethod, String status) {
        Expense e = new Expense();
        e.setId(id);
        e.setDate(date);
        e.setCategory(category);
        e.setDescription(description);
        e.setAmount(amount);
        e.setPaymentMethod(paymentMethod);
        e.setStatus(status);
        e.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));
        return e;
    }

    private Invoice createInvoice(String id, String invoiceNumber, String customerId, String customerName,
                                  Product p1, int q1, Product p2, int q2, String paymentStatus, String paymentMethod) {
        Invoice inv = new Invoice();
        inv.setId(id);
        inv.setInvoiceNumber(invoiceNumber);
        inv.setCustomerId(customerId);
        inv.setCustomerName(customerName);
        inv.setDate(LocalDate.now().toString());

        double t1 = p1.getSellingPrice() * q1;
        double t2 = p2.getSellingPrice() * q2;
        double subtotal = t1 + t2;
        double cgst = Math.round(subtotal * 0.09);
        double sgst = Math.round(subtotal * 0.09);
        double grandTotal = subtotal + cgst + sgst;

        inv.setSubtotal(subtotal);
        inv.setDiscount(0);
        inv.setCgst(cgst);
        inv.setSgst(sgst);
        inv.setIgst(0);
        inv.setGrandTotal(grandTotal);
        inv.setAmountPaid("paid".equals(paymentStatus) ? grandTotal : (grandTotal / 2));
        inv.setPaymentStatus(paymentStatus);
        inv.setPaymentMethod(paymentMethod);
        inv.setStatus("completed");
        inv.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        InvoiceItem it1 = new InvoiceItem();
        it1.setId(id + "-1");
        it1.setProductId(p1.getId());
        it1.setProductName(p1.getName());
        it1.setSku(p1.getSku());
        it1.setQty(q1);
        it1.setPrice(p1.getSellingPrice());
        it1.setGstRate(p1.getGstRate());
        it1.setGstAmount(Math.round(t1 * 0.18));
        it1.setTotal(t1);
        inv.addItem(it1);

        InvoiceItem it2 = new InvoiceItem();
        it2.setId(id + "-2");
        it2.setProductId(p2.getId());
        it2.setProductName(p2.getName());
        it2.setSku(p2.getSku());
        it2.setQty(q2);
        it2.setPrice(p2.getSellingPrice());
        it2.setGstRate(p2.getGstRate());
        it2.setGstAmount(Math.round(t2 * 0.18));
        it2.setTotal(t2);
        inv.addItem(it2);

        return inv;
    }

    private Purchase createPurchase(String id, String billNumber, String supplierId, String supplierName, String suppInv,
                                    Product p1, int q1, Product p2, int q2, String paymentStatus, String paymentMethod) {
        Purchase pur = new Purchase();
        pur.setId(id);
        pur.setBillNumber(billNumber);
        pur.setSupplierId(supplierId);
        pur.setSupplierName(supplierName);
        pur.setSupplierInvoiceNumber(suppInv);
        pur.setDate(LocalDate.now().toString());

        double t1 = p1.getPurchasePrice() * q1;
        double t2 = p2.getPurchasePrice() * q2;
        double subtotal = t1 + t2;
        double cgst = Math.round(subtotal * 0.09);
        double sgst = Math.round(subtotal * 0.09);
        double grandTotal = subtotal + cgst + sgst;

        pur.setSubtotal(subtotal);
        pur.setDiscount(0);
        pur.setCgst(cgst);
        pur.setSgst(sgst);
        pur.setGrandTotal(grandTotal);
        pur.setAmountPaid("paid".equals(paymentStatus) ? grandTotal : 15000.0);
        pur.setPaymentStatus(paymentStatus);
        pur.setPaymentMethod(paymentMethod);
        pur.setStatus("completed");
        pur.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        PurchaseItem it1 = new PurchaseItem();
        it1.setId(id + "-1");
        it1.setProductId(p1.getId());
        it1.setProductName(p1.getName());
        it1.setSku(p1.getSku());
        it1.setQty(q1);
        it1.setPrice(p1.getPurchasePrice());
        it1.setPurchasePrice(p1.getPurchasePrice());
        it1.setGstRate(p1.getGstRate());
        it1.setGstAmount(Math.round(t1 * 0.18));
        it1.setTotal(t1);
        pur.addItem(it1);

        PurchaseItem it2 = new PurchaseItem();
        it2.setId(id + "-2");
        it2.setProductId(p2.getId());
        it2.setProductName(p2.getName());
        it2.setSku(p2.getSku());
        it2.setQty(q2);
        it2.setPrice(p2.getPurchasePrice());
        it2.setPurchasePrice(p2.getPurchasePrice());
        it2.setGstRate(p2.getGstRate());
        it2.setGstAmount(Math.round(t2 * 0.18));
        it2.setTotal(t2);
        pur.addItem(it2);

        return pur;
    }

    private Quotation createQuotation(String id, String quotationNumber, String customerId, String customerName,
                                      Product p1, int q1, Product p2, int q2) {
        Quotation q = new Quotation();
        q.setId(id);
        q.setQuotationNumber(quotationNumber);
        q.setCustomerId(customerId);
        q.setCustomerName(customerName);
        q.setDate(LocalDate.now().toString());
        q.setValidUntil(LocalDate.now().plusDays(7).toString());

        double t1 = p1.getSellingPrice() * q1;
        double t2 = p2.getSellingPrice() * q2;
        double subtotal = t1 + t2;
        double tax = Math.round(subtotal * 0.18);
        double grandTotal = subtotal + tax;

        q.setSubtotal(subtotal);
        q.setDiscount(0);
        q.setTax(tax);
        q.setGrandTotal(grandTotal);
        q.setStatus("sent");
        q.setCreatedAt(LocalDateTime.now().format(DateTimeFormatter.ISO_DATE_TIME));

        QuotationItem it1 = new QuotationItem();
        it1.setId(id + "-1");
        it1.setProductId(p1.getId());
        it1.setProductName(p1.getName());
        it1.setSku(p1.getSku());
        it1.setQty(q1);
        it1.setPrice(p1.getSellingPrice());
        it1.setGstRate(p1.getGstRate());
        it1.setGstAmount(Math.round(t1 * 0.18));
        it1.setTotal(t1);
        q.addItem(it1);

        QuotationItem it2 = new QuotationItem();
        it2.setId(id + "-2");
        it2.setProductId(p2.getId());
        it2.setProductName(p2.getName());
        it2.setSku(p2.getSku());
        it2.setQty(q2);
        it2.setPrice(p2.getSellingPrice());
        it2.setGstRate(p2.getGstRate());
        it2.setGstAmount(Math.round(t2 * 0.18));
        it2.setTotal(t2);
        q.addItem(it2);

        return q;
    }
}
