package com.bizflow.repository;

import com.bizflow.model.InvoiceSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface InvoiceSettingsRepository extends JpaRepository<InvoiceSettings, String> {}
