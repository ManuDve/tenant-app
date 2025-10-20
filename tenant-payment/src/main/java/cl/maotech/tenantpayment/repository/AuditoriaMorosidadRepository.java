package cl.maotech.tenantpayment.repository;

import cl.maotech.tenantpayment.entity.AuditoriaMorosidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaMorosidadRepository extends JpaRepository<AuditoriaMorosidad, Long> {
    List<AuditoriaMorosidad> findAllByOrderByFechaAuditoriaDesc();
}

