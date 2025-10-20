package cl.maotech.tenantpayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaMorosidadResponse {
    private Long idAuditoria;
    private Long numrun;
    private BigDecimal montoMorosoAnterior;
    private BigDecimal montoMorosoNuevo;
    private LocalDate fechaAuditoria;
}

