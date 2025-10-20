package cl.maotech.tenantpayment.controller;

import jakarta.persistence.EntityNotFoundException;
import org.springframework.dao.InvalidDataAccessResourceUsageException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class RestExceptionHandler {

    @ExceptionHandler(EntityNotFoundException.class)
    public ResponseEntity<String> handleNotFound(EntityNotFoundException ex) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(ex.getMessage());
    }

    @ExceptionHandler(InvalidDataAccessResourceUsageException.class)
    public ResponseEntity<Map<String, Object>> handleDatabaseAccessError(InvalidDataAccessResourceUsageException ex) {
        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("timestamp", LocalDateTime.now());
        errorResponse.put("status", HttpStatus.SERVICE_UNAVAILABLE.value());
        errorResponse.put("error", "Base de datos no inicializada");

        // Detectar si es un error de tabla no existente (ORA-00942)
        if (ex.getMessage() != null && ex.getMessage().contains("ORA-00942")) {
            errorResponse.put("message", "Las tablas de la base de datos no existen. Por favor, ejecute el endpoint de seed para inicializar la base de datos.");
            errorResponse.put("action", "POST /api/admin/database/seed");
        } else {
            errorResponse.put("message", "Error al acceder a la base de datos: " + ex.getMessage());
        }

        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE).body(errorResponse);
    }
}