package com.bizflow.repository;

import com.bizflow.model.TaxSetting;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface TaxSettingRepository extends JpaRepository<TaxSetting, String> {}
