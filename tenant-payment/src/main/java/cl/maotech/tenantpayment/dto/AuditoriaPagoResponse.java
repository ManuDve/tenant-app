package cl.maotech.tenantpayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuditoriaPagoResponse {
    private Long idAuditoria;
    private Integer annoMes;
    private Long idEdif;
    private Long nroDepto;
    private BigDecimal montoCancelado;
    private LocalDate fechaAuditoria;
    private String operacion;
}

