package com.bizflow.service;

import com.bizflow.dto.*;
import com.bizflow.model.*;
import com.bizflow.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final InvoiceRepository invoiceRepository;
    private final PurchaseRepository purchaseRepository;
    private final ExpenseRepository expenseRepository;
    private final ProductRepository productRepository;
    private final CustomerRepository customerRepository;

    public ReportService(InvoiceRepository invoiceRepository,
                         PurchaseRepository purchaseRepository,
                         ExpenseRepository expenseRepository,
                         ProductRepository productRepository,
                         CustomerRepository customerRepository) {
        this.invoiceRepository = invoiceRepository;
        this.purchaseRepository = purchaseRepository;
        this.expenseRepository = expenseRepository;
        this.productRepository = productRepository;
        this.customerRepository = customerRepository;
    }

    private boolean withinRange(String date, String from, String to) {
        if (date == null) return false;
        String d = date.length() >= 10 ? date.substring(0, 10) : date;
        if (from != null && !from.isEmpty() && d.compareTo(from) < 0) return false;
        if (to != null && !to.isEmpty() && d.compareTo(to) > 0) return false;
        return true;
    }

    public SalesSummaryDto getSalesSummary(String from, String to) {
        List<Invoice> salesList = invoiceRepository.findAll().stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()) && withinRange(i.getDate(), from, to))
                .collect(Collectors.toList());

        List<Purchase> purchaseList = purchaseRepository.findAll().stream()
                .filter(p -> !"cancelled".equalsIgnoreCase(p.getStatus()) && withinRange(p.getDate(), from, to))
                .collect(Collectors.toList());

        Map<String, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        double sales = salesList.stream().mapToDouble(Invoice::getGrandTotal).sum();
        double purchases = purchaseList.stream().mapToDouble(Purchase::getGrandTotal).sum();

        double costOfGoods = 0.0;
        for (Invoice inv : salesList) {
            if (inv.getItems() != null) {
                for (InvoiceItem it : inv.getItems()) {
                    Product p = productMap.get(it.getProductId());
                    double purchasePrice = p != null ? p.getPurchasePrice() : it.getPrice();
                    costOfGoods += purchasePrice * it.getQty();
                }
            }
        }

        double profit = sales - costOfGoods;
        int orders = salesList.size();

        double outstanding = 0.0;
        for (Customer c : customerRepository.findAll()) {
            double opening = c.getOpeningBalance() != null ? c.getOpeningBalance() : 0.0;
            outstanding += opening;
        }
        for (Invoice inv : invoiceRepository.findAll()) {
            if (!"cancelled".equalsIgnoreCase(inv.getStatus())) {
                outstanding += Math.max(0, inv.getGrandTotal() - inv.getAmountPaid());
            }
        }

        return new SalesSummaryDto(sales, purchases, profit, orders, outstanding);
    }

    public List<DailySeriesDto> getDailySeries(String from, String to) {
        List<Invoice> salesList = invoiceRepository.findAll().stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()) && withinRange(i.getDate(), from, to))
                .collect(Collectors.toList());

        List<Purchase> purchaseList = purchaseRepository.findAll().stream()
                .filter(p -> !"cancelled".equalsIgnoreCase(p.getStatus()) && withinRange(p.getDate(), from, to))
                .collect(Collectors.toList());

        Map<String, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        Map<String, DailySeriesDto> map = new TreeMap<>();

        for (Invoice inv : salesList) {
            String key = inv.getDate() != null && inv.getDate().length() >= 10 ? inv.getDate().substring(0, 10) : "unknown";
            DailySeriesDto dto = map.computeIfAbsent(key, k -> new DailySeriesDto(k, 0, 0, 0));
            dto.setSales(dto.getSales() + inv.getGrandTotal());

            double cost = 0.0;
            if (inv.getItems() != null) {
                for (InvoiceItem it : inv.getItems()) {
                    Product p = productMap.get(it.getProductId());
                    cost += (p != null ? p.getPurchasePrice() : it.getPrice()) * it.getQty();
                }
            }
            dto.setProfit(dto.getProfit() + (inv.getGrandTotal() - cost));
        }

        for (Purchase bill : purchaseList) {
            String key = bill.getDate() != null && bill.getDate().length() >= 10 ? bill.getDate().substring(0, 10) : "unknown";
            DailySeriesDto dto = map.computeIfAbsent(key, k -> new DailySeriesDto(k, 0, 0, 0));
            dto.setPurchases(dto.getPurchases() + bill.getGrandTotal());
        }

        return new ArrayList<>(map.values());
    }

    public List<TopProductDto> getTopProducts(String from, String to, int limit) {
        List<Invoice> salesList = invoiceRepository.findAll().stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()) && withinRange(i.getDate(), from, to))
                .collect(Collectors.toList());

        Map<String, Product> productMap = productRepository.findAll().stream()
                .collect(Collectors.toMap(Product::getId, p -> p, (a, b) -> a));

        Map<String, TopProductDto> counter = new HashMap<>();

        for (Invoice inv : salesList) {
            if (inv.getItems() != null) {
                for (InvoiceItem it : inv.getItems()) {
                    Product p = productMap.get(it.getProductId());
                    TopProductDto entry = counter.computeIfAbsent(it.getProductId(), id ->
                            new TopProductDto(id, it.getProductName(), 0, 0, 0));
                    entry.setUnits(entry.getUnits() + it.getQty());
                    double rev = (it.getPrice() * it.getQty()) - it.getDiscount();
                    entry.setRevenue(entry.getRevenue() + rev);
                    double cost = (p != null ? p.getPurchasePrice() : it.getPrice()) * it.getQty();
                    entry.setProfit(entry.getProfit() + (rev - cost));
                }
            }
        }

        return counter.values().stream()
                .sorted(Comparator.comparingDouble(TopProductDto::getRevenue).reversed())
                .limit(limit > 0 ? limit : 6)
                .collect(Collectors.toList());
    }

    public GstSummaryDto getGstSummary(String from, String to) {
        List<Invoice> sales = invoiceRepository.findAll().stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()) && withinRange(i.getDate(), from, to))
                .collect(Collectors.toList());

        List<Purchase> purchases = purchaseRepository.findAll().stream()
                .filter(p -> !"cancelled".equalsIgnoreCase(p.getStatus()) && withinRange(p.getDate(), from, to))
                .collect(Collectors.toList());

        double taxableSales = sales.stream().mapToDouble(i -> i.getSubtotal() - i.getDiscount()).sum();
        double cgst = sales.stream().mapToDouble(Invoice::getCgst).sum();
        double sgst = sales.stream().mapToDouble(Invoice::getSgst).sum();
        double igst = sales.stream().mapToDouble(Invoice::getIgst).sum();
        double totalGst = cgst + sgst + igst;

        double purchaseTaxable = purchases.stream().mapToDouble(p -> p.getSubtotal() - p.getDiscount()).sum();
        double purchaseCgst = purchases.stream().mapToDouble(Purchase::getCgst).sum();
        double purchaseSgst = purchases.stream().mapToDouble(Purchase::getSgst).sum();
        double purchaseGst = purchaseCgst + purchaseSgst;

        double netPayable = totalGst - purchaseGst;

        return new GstSummaryDto(taxableSales, cgst, sgst, igst, totalGst,
                purchaseTaxable, purchaseCgst, purchaseSgst, purchaseGst, netPayable);
    }

    public List<CustomerReportDto> getCustomerReports(String from, String to) {
        List<Invoice> salesList = invoiceRepository.findAll().stream()
                .filter(i -> !"cancelled".equalsIgnoreCase(i.getStatus()) && withinRange(i.getDate(), from, to))
                .collect(Collectors.toList());

        List<Customer> customers = customerRepository.findAll();
        List<CustomerReportDto> result = new ArrayList<>();

        for (Customer c : customers) {
            List<Invoice> cInvoices = salesList.stream()
                    .filter(i -> c.getId().equals(i.getCustomerId()))
                    .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                    .collect(Collectors.toList());

            double totalSales = cInvoices.stream().mapToDouble(Invoice::getGrandTotal).sum();
            double totalPaid = cInvoices.stream().mapToDouble(Invoice::getAmountPaid).sum();
            double opening = c.getOpeningBalance() != null ? c.getOpeningBalance() : 0.0;
            double outstanding = totalSales - totalPaid + opening;
            String lastPurchase = cInvoices.isEmpty() ? null : cInvoices.get(0).getDate();

            result.add(new CustomerReportDto(c.getId(), c.getName(), c.getPhone(), c.getEmail(),
                    c.getGstin(), totalSales, totalPaid, outstanding, lastPurchase));
        }

        return result;
    }

    public DashboardStatsDto getDashboardStats() {
        LocalDate now = LocalDate.now();
        String from = now.withDayOfMonth(1).toString();
        String to = now.toString();

        SalesSummaryDto summary = getSalesSummary(from, to);

        long totalInvoices = invoiceRepository.count();
        long totalCustomers = customerRepository.count();
        long totalProducts = productRepository.count();
        long lowStockCount = productRepository.findLowStockProducts().size();

        return new DashboardStatsDto(
                summary.getSales(),
                summary.getPurchases(),
                summary.getProfit(),
                totalInvoices,
                totalCustomers,
                totalProducts,
                lowStockCount,
                summary.getOutstanding()
        );
    }
}
