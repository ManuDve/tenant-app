package cl.maotech.tenantpayment.controller;

import cl.maotech.tenantpayment.dto.*;
import cl.maotech.tenantpayment.service.MorosidadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/morosidades")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class MorosidadController {

    private final MorosidadService service;

    @PostMapping("/generar-reporte")
    public ResponseEntity<Map<String, Object>> generarReporte(@RequestBody ReporteMorosidadRequest request) {
        String mensaje = service.generarReporteMorosidades(request.getAnnoMes());
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", mensaje);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/detalle")
    public ResponseEntity<List<DetalleMorosidadResponse>> obtenerDetalles(
            @RequestParam(required = false) Long numrun) {
        return ResponseEntity.ok(service.obtenerDetallesMorosidad(numrun));
    }

    @GetMapping("/auditoria")
    public ResponseEntity<List<AuditoriaMorosidadResponse>> consultarAuditoria() {
        return ResponseEntity.ok(service.consultarAuditoriaMorosidades());
    }

    @GetMapping("/auditoria-pagos")
    public ResponseEntity<List<AuditoriaPagoResponse>> consultarAuditoriaPagos() {
        return ResponseEntity.ok(service.consultarAuditoriaPagos());
    }
}

