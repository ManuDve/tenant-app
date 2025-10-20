package cl.maotech.tenantpayment.repository;

import cl.maotech.tenantpayment.entity.DetalleMorosidad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface DetalleMorosidadRepository extends JpaRepository<DetalleMorosidad, Long> {

    @Query(value = "SELECT dm.* FROM DETALLE_MOROSIDAD dm WHERE dm.monto_total_moroso > :monto", nativeQuery = true)
    List<DetalleMorosidad> findByMontoMayorA(BigDecimal monto);

    List<DetalleMorosidad> findByNumrunRpgc(Long numrun);
}

