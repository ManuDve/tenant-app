package cl.maotech.tenantpayment.controller;

import cl.maotech.tenantpayment.service.DatabaseAdminService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@Slf4j
@RestController
@RequestMapping("/api/admin/database")
@RequiredArgsConstructor
@ConditionalOnProperty(name = "app.admin.endpoints.enabled", havingValue = "true")
public class DatabaseAdminController {

    private final DatabaseAdminService service;

    @Value("${app.admin.sql.clear-path}")
    private String clearSqlPath;

    @Value("${app.admin.sql.seed-path}")
    private String seedSqlPath;

    @Value("${app.admin.sql.morosidades-path}")
    private String morosidadesSqlPath;

    @PostMapping("/clear")
    public ResponseEntity<Map<String, String>> clear() {
        log.warn("Ejecutando limpieza de BD");
        service.clearDatabase(clearSqlPath);
        return ResponseEntity.ok(Map.of("status", "success", "message", "BD limpiada"));
    }

    @PostMapping("/seed")
    public ResponseEntity<Map<String, String>> seed() {
        log.info("Ejecutando seed de BD");
        service.seedDatabase(seedSqlPath);
        return ResponseEntity.ok(Map.of("status", "success", "message", "BD poblada"));
    }

    @PostMapping("/morosidades")
    public ResponseEntity<Map<String, String>> executeMorosidades() {
        log.info("Ejecutando script de morosidades");
        service.executeMorosidadesScript(morosidadesSqlPath);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Script de morosidades ejecutado"));
    }

    @GetMapping("/diagnostico")
    public ResponseEntity<Map<String, Object>> diagnostico() {
        log.info("Ejecutando diagnóstico de base de datos");
        Map<String, Object> resultado = service.ejecutarDiagnostico();
        return ResponseEntity.ok(resultado);
    }

    @PostMapping("/datos-morosidad")
    public ResponseEntity<Map<String, String>> insertarDatosMorosidad() {
        log.info("Insertando datos de prueba de morosidad");
        String datosPath = morosidadesSqlPath.replace("setup_morosidades.sql", "datos_morosidad.sql");
        service.executeMorosidadesScript(datosPath);
        return ResponseEntity.ok(Map.of("status", "success", "message", "Datos de morosidad insertados correctamente"));
    }

//    @PostMapping("/reset")
//    public ResponseEntity<Map<String, String>> reset() {
//        log.warn("Ejecutando reset de BD");
//        service.clearDatabase(clearSqlPath);
//        service.seedDatabase(seedSqlPath);
//        return ResponseEntity.ok(Map.of("status", "success", "message", "BD reseteada"));
//    }
}