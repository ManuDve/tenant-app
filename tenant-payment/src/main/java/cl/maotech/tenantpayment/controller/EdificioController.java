package cl.maotech.tenantpayment.controller;

import cl.maotech.tenantpayment.dto.EdificioResponse;
import cl.maotech.tenantpayment.service.MorosidadService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/edificios")
@RequiredArgsConstructor
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.PATCH, RequestMethod.OPTIONS},
    allowedHeaders = "*",
    allowCredentials = "true",
    maxAge = 3600
)
public class EdificioController {

    private final MorosidadService service;

    @GetMapping
    public ResponseEntity<List<EdificioResponse>> listarEdificios() {
        return ResponseEntity.ok(service.listarEdificiosConPromedioMorosidad());
    }
}

