package cl.maotech.tenantpayment.controller;

import cl.maotech.tenantpayment.dto.PagoRequest;
import cl.maotech.tenantpayment.service.MorosidadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/pagos")
@RequiredArgsConstructor
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true",
    maxAge = 3600
)
public class PagoController {

    private final MorosidadService service;

    @PostMapping("/registrar-parcial")
    public ResponseEntity<Map<String, Object>> registrarPagoParcial(@RequestBody PagoRequest request) {
        String mensaje = service.registrarPagoParcial(request);
        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("message", mensaje);
        return ResponseEntity.ok(response);
    }
}
