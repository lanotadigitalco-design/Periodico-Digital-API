# Migraciones de Base de Datos

Este proyecto utiliza TypeORM para gestionar las migraciones de la base de datos PostgreSQL.

## Configuración

Las migraciones están configuradas en el archivo `ormconfig.ts` en la raíz del proyecto.

## Scripts Disponibles

### Verificar estado de las migraciones
```bash
pnpm run migration:show
```
Muestra todas las migraciones y su estado (ejecutadas o pendientes).

### Generar una nueva migración
```bash
pnpm run migration:generate src/migrations/NombreDeLaMigracion
```
Genera automáticamente una migración basada en los cambios detectados en las entidades.

### Ejecutar migraciones pendientes
```bash
pnpm run migration:run
```
Ejecuta todas las migraciones que aún no se han aplicado a la base de datos.

### Revertir la última migración
```bash
pnpm run migration:revert
```
Revierte la última migración ejecutada.

## Proceso de Desarrollo

1. **Modificar Entidades**: Realiza cambios en tus archivos de entidad en `src/entities/`

2. **Generar Migración**: Ejecuta el comando para generar la migración:
   ```bash
   pnpm run migration:generate src/migrations/DescripcionDelCambio
   ```

3. **Revisar Migración**: Verifica el archivo generado en `src/migrations/` para asegurarte de que los cambios son correctos

4. **Ejecutar Migración**: Aplica la migración a la base de datos:
   ```bash
   pnpm run migration:run
   ```

## Notas Importantes

- ⚠️ **Nunca** uses `synchronize: true` en producción
- Las migraciones se ejecutan de forma ordenada según su timestamp
- Siempre revisa el código generado antes de ejecutar una migración
- Mantén un backup de la base de datos antes de ejecutar migraciones en producción

## Estado Actual

✅ Migración inicial completada
- Tablas creadas: roles, usuarios, informacion_usuario, articulos, comentarios, log_visualizacion_articulos, log_visualizacion_sitio
- Relaciones configuradas correctamente
- Seed de roles ejecutado

## Base de Datos Inicial

Para configurar la base de datos desde cero:

```bash
# 1. Verificar/crear la base de datos
pnpm run db:check

# 2. Ejecutar migraciones
pnpm run migration:run

# 3. Poblar con datos iniciales
pnpm run seed
```

O usar el comando combinado:
```bash
pnpm run db:setup
```
