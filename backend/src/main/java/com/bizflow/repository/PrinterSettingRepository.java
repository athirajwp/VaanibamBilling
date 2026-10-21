package com.bizflow.repository;

import com.bizflow.model.PrinterSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PrinterSettingRepository extends JpaRepository<PrinterSetting, String> {}
