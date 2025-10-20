package cl.maotech.tenantpayment.repository;

import cl.maotech.tenantpayment.entity.AuditoriaPago;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuditoriaPagoRepository extends JpaRepository<AuditoriaPago, Long> {
    List<AuditoriaPago> findAllByOrderByFechaAuditoriaDesc();
}
