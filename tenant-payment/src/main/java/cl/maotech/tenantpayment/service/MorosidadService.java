package cl.maotech.tenantpayment.service;

import cl.maotech.tenantpayment.dto.*;
import cl.maotech.tenantpayment.entity.*;
import cl.maotech.tenantpayment.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class MorosidadService {

    private final JdbcTemplate jdbcTemplate;
    private final DetalleMorosidadRepository detalleMorosidadRepository;
    private final AuditoriaMorosidadRepository auditoriaMorosidadRepository;
    private final AuditoriaPagoRepository auditoriaPagoRepository;
    private final EdificioRepository edificioRepository;
    private final TenantRepository tenantRepository;

    @Transactional
    public String generarReporteMorosidades(Integer annoMes) {
        try {
            jdbcTemplate.execute(String.format(
                "BEGIN PKG_MOROSIDADES.generar_reporte_morosidades(%d); END;",
                annoMes
            ));
            return "Reporte de morosidades generado exitosamente";
        } catch (Exception e) {
            throw new RuntimeException("Error al generar reporte de morosidades: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<DetalleMorosidadResponse> obtenerDetallesMorosidad(Long numrun) {
        List<DetalleMorosidad> detalles;

        if (numrun != null) {
            detalles = detalleMorosidadRepository.findByNumrunRpgc(numrun);
        } else {
            detalles = detalleMorosidadRepository.findAll();
        }

        return detalles.stream()
            .map(this::toResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditoriaMorosidadResponse> consultarAuditoriaMorosidades() {
        return auditoriaMorosidadRepository.findAllByOrderByFechaAuditoriaDesc()
            .stream()
            .map(this::toAuditoriaResponse)
            .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AuditoriaPagoResponse> consultarAuditoriaPagos() {
        return auditoriaPagoRepository.findAllByOrderByFechaAuditoriaDesc()
            .stream()
            .map(this::toAuditoriaPagoResponse)
            .collect(Collectors.toList());
    }

    @Transactional
    public String registrarPagoParcial(PagoRequest request) {
        try {
            jdbcTemplate.execute(String.format(
                "BEGIN PKG_RESIDENTES.REGISTRAR_PAGO_PARCIAL(%d, %d, %d, %s); END;",
                request.getAnnoMes(),
                request.getIdEdif(),
                request.getNroDepto(),
                request.getMonto()
            ));
            return "Pago parcial registrado exitosamente";
        } catch (Exception e) {
            throw new RuntimeException("Error al registrar pago parcial: " + e.getMessage(), e);
        }
    }

    @Transactional(readOnly = true)
    public List<EdificioResponse> listarEdificiosConPromedioMorosidad() {
        List<Edificio> edificios = edificioRepository.findAll();

        return edificios.stream()
            .map(edificio -> {
                BigDecimal promedio = calcularPromedioMorosidad(edificio.getIdEdif());
                return new EdificioResponse(
                    edificio.getIdEdif(),
                    edificio.getNombreEdif(),
                    edificio.getDireccionEdif(),
                    promedio
                );
            })
            .collect(Collectors.toList());
    }

    private BigDecimal calcularPromedioMorosidad(Long idEdif) {
        try {
            String sql = "SELECT PKG_MOROSIDADES.CALCULAR_PROMEDIO_MOROSIDAD_EDIFICIO(?) FROM DUAL";
            BigDecimal promedio = jdbcTemplate.queryForObject(sql, BigDecimal.class, idEdif);
            return promedio != null ? promedio : BigDecimal.ZERO;
        } catch (Exception e) {
            return BigDecimal.ZERO;
        }
    }

    private DetalleMorosidadResponse toResponse(DetalleMorosidad detalle) {
        DetalleMorosidadResponse response = new DetalleMorosidadResponse();
        response.setIdMorosidad(detalle.getIdMorosidad());
        response.setNumrun(detalle.getNumrunRpgc());
        response.setMontoTotalMoroso(detalle.getMontoTotalMoroso());
        response.setFechaUltimaActualizacion(detalle.getFechaUltimaActualizacion());

        // Obtener información del residente
        tenantRepository.findById(detalle.getNumrunRpgc()).ifPresent(tenant -> {
            response.setDvrun(tenant.getDvrun());
            response.setNombreCompleto(
                String.format("%s %s %s %s",
                    tenant.getPrimerNombre(),
                    tenant.getSegundoNombre() != null ? tenant.getSegundoNombre() : "",
                    tenant.getApellidoPaterno(),
                    tenant.getApellidoMaterno() != null ? tenant.getApellidoMaterno() : ""
                ).replaceAll("\\s+", " ").trim()
            );
        });

        return response;
    }

    private AuditoriaMorosidadResponse toAuditoriaResponse(AuditoriaMorosidad auditoria) {
        AuditoriaMorosidadResponse response = new AuditoriaMorosidadResponse();
        response.setIdAuditoria(auditoria.getIdAuditoria());
        response.setNumrun(auditoria.getNumrunRpgc());
        response.setMontoMorosoAnterior(auditoria.getMontoMorosoAnterior());
        response.setMontoMorosoNuevo(auditoria.getMontoMorosoNuevo());
        response.setFechaAuditoria(auditoria.getFechaAuditoria());
        return response;
    }

    private AuditoriaPagoResponse toAuditoriaPagoResponse(AuditoriaPago auditoria) {
        AuditoriaPagoResponse response = new AuditoriaPagoResponse();
        response.setIdAuditoria(auditoria.getIdAuditoria());
        response.setAnnoMes(auditoria.getAnnoMesPcgc());
        response.setIdEdif(auditoria.getIdEdif());
        response.setNroDepto(auditoria.getNroDepto());
        response.setMontoCancelado(auditoria.getMontoCancelado());
        response.setFechaAuditoria(auditoria.getFechaAuditoria());
        response.setOperacion(auditoria.getOperacion());
        return response;
    }
}
