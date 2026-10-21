package com.bizflow.repository;

import com.bizflow.model.OnlineStoreSettings;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface OnlineStoreSettingsRepository extends JpaRepository<OnlineStoreSettings, String> {}
