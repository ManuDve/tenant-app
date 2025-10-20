package cl.maotech.tenantpayment.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.List;
import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class DatabaseAdminService {

    private final JdbcTemplate jdbcTemplate;

    @Transactional
    public void clearDatabase(String sqlFilePath) {
        log.warn("Limpiando base de datos con: {}", sqlFilePath);
        executeSqlFile(sqlFilePath);
        log.warn("Base de datos limpiada");
    }

    @Transactional
    public void seedDatabase(String sqlFilePath) {
        log.info("Poblando base de datos con: {}", sqlFilePath);
        executeSqlFile(sqlFilePath);
        log.info("Base de datos poblada");
    }

    @Transactional
    public void executeMorosidadesScript(String sqlFilePath) {
        log.info("Ejecutando script de morosidades con: {}", sqlFilePath);
        executePlSqlFile(sqlFilePath);
        log.info("Script de morosidades ejecutado");
    }

    @Transactional(readOnly = true)
    public Map<String, Object> ejecutarDiagnostico() {
        Map<String, Object> resultado = new java.util.HashMap<>();

        try {
            // Verificar privilegios
            List<Map<String, Object>> privilegios = jdbcTemplate.queryForList(
                    "SELECT PRIVILEGE FROM USER_SYS_PRIVS WHERE PRIVILEGE LIKE '%CREATE%'"
            );
            resultado.put("privilegios", privilegios);

            // Verificar estado de objetos
            List<Map<String, Object>> objetos = jdbcTemplate.queryForList(
                    "SELECT object_name, object_type, status FROM USER_OBJECTS " +
                            "WHERE object_type IN ('PACKAGE', 'PACKAGE BODY', 'TRIGGER', 'TYPE') " +
                            "ORDER BY object_type, object_name"
            );
            resultado.put("objetos", objetos);

            // Verificar errores de compilación
            List<Map<String, Object>> errores = jdbcTemplate.queryForList(
                    "SELECT name, type, line, position, text FROM USER_ERRORS " +
                            "WHERE name IN ('PKG_MOROSIDADES', 'PKG_RESIDENTES') " +
                            "ORDER BY name, type, sequence"
            );
            resultado.put("errores_compilacion", errores);

            // Verificar tablas
            List<Map<String, Object>> tablas = jdbcTemplate.queryForList(
                    "SELECT table_name FROM USER_TABLES " +
                            "WHERE table_name IN ('DETALLE_MOROSIDAD', 'AUDITORIA_MOROSIDADES', 'AUDITORIA_PAGOS') " +
                            "ORDER BY table_name"
            );
            resultado.put("tablas", tablas);

            log.info("Diagnóstico completado. Errores encontrados: {}", errores.size());

        } catch (Exception e) {
            log.error("Error ejecutando diagnóstico: {}", e.getMessage());
            resultado.put("error", e.getMessage());
        }

        return resultado;
    }

    private void executeSqlFile(String filePath) {
        try {
            String content = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);

            String[] statements = content.split(";");

            int executed = 0;
            int errors = 0;

            for (String statement : statements) {
                String cleaned = statement.lines()
                        .filter(line -> !line.trim().startsWith("--"))
                        .map(String::trim)
                        .filter(line -> !line.isEmpty())
                        .reduce((a, b) -> a + " " + b)
                        .orElse("");

                if (!cleaned.isEmpty()) {
                    try {
                        jdbcTemplate.execute(cleaned);
                        executed++;
                        log.debug("OK: {}", cleaned.substring(0, Math.min(60, cleaned.length())));
                    } catch (Exception e) {
                        errors++;
                        log.warn("Error (continuando): {} - {}",
                                cleaned.substring(0, Math.min(60, cleaned.length())),
                                e.getMessage());
                    }
                }
            }

            log.info("Completado: {} ejecutados, {} errores", executed, errors);

        } catch (Exception e) {
            log.error("Error leyendo archivo: {}", filePath, e);
            throw new RuntimeException("Error: " + e.getMessage());
        }
    }

    private void executePlSqlFile(String filePath) {
        try {
            String content = Files.readString(Paths.get(filePath), StandardCharsets.UTF_8);

            log.info("Ejecutando script PL/SQL desde: {}", filePath);

            // Dividir por el delimitador / en su propia línea (estándar de Oracle SQL Developer)
            // Usar un patrón más robusto que maneje diferentes formatos
            String[] blocks = content.split("(?m)^\\s*/\\s*$");

            int executed = 0;
            int errors = 0;

            for (String block : blocks) {
                String cleaned = block.trim();

                // Ignorar bloques vacíos o solo comentarios
                if (cleaned.isEmpty()) {
                    continue;
                }

                // Remover comentarios de línea completa pero mantener la estructura del código
                String[] lines = cleaned.split("\n");
                StringBuilder processedBlock = new StringBuilder();
                boolean hasContent = false;

                for (String line : lines) {
                    String trimmedLine = line.trim();
                    // Solo remover comentarios que ocupan toda la línea
                    if (trimmedLine.isEmpty() || trimmedLine.startsWith("--")) {
                        continue; // Saltar líneas vacías y comentarios completos
                    }
                    // Mantener líneas con código (aunque tengan comentarios inline)
                    processedBlock.append(line).append("\n");
                    hasContent = true;
                }

                String finalBlock = processedBlock.toString().trim();
                if (!hasContent || finalBlock.isEmpty()) {
                    continue;
                }

                try {
                    log.info("Ejecutando bloque ({} caracteres)...", finalBlock.length());
                    jdbcTemplate.execute(finalBlock);
                    executed++;
                    log.info("✓ Bloque ejecutado correctamente");
                } catch (Exception e) {
                    errors++;
                    log.error("✗ Error ejecutando bloque: {}", e.getMessage());
                    log.debug("Bloque con error: {}", finalBlock);
                    // No lanzar excepción, continuar con el siguiente bloque
                }
            }

            log.info("Script PL/SQL completado: {} bloques ejecutados exitosamente, {} errores", executed, errors);

            if (errors > 0) {
                log.warn("Se encontraron {} errores durante la ejecución. Revisa los logs para más detalles.", errors);
            }

        } catch (Exception e) {
            log.error("Error leyendo archivo PL/SQL: {}", filePath, e);
            throw new RuntimeException("Error ejecutando script PL/SQL: " + e.getMessage());
        }
    }
}
