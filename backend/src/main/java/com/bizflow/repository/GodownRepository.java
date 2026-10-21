package com.bizflow.repository;

import com.bizflow.model.Godown;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GodownRepository extends JpaRepository<Godown, String> {
}
