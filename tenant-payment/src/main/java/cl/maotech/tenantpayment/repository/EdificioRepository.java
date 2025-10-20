package cl.maotech.tenantpayment.repository;

import cl.maotech.tenantpayment.entity.Edificio;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EdificioRepository extends JpaRepository<Edificio, Long> {
}

