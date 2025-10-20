package cl.maotech.tenantpayment.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PagoRequest {
    private Integer annoMes;
    private Long idEdif;
    private Long nroDepto;
    private BigDecimal monto;
}

