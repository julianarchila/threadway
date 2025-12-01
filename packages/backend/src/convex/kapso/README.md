# Integración con Kapso Platform

Esta integración permite que los usuarios conecten sus cuentas de WhatsApp Business a Threadway usando Kapso Platform.

## Características

- ✅ Conectar cuenta de WhatsApp Business existente
- ✅ Provisionar nuevo número de teléfono automáticamente
- ✅ Soporte para modo Coexistence (App + API) y Dedicated (solo API)
- ✅ Webhooks para detectar conexión exitosa/fallida
- ✅ UI completa para el flujo de conexión

## Configuración

### 1. Variable de entorno

Agrega la siguiente variable a tu archivo `.env`:

```bash
KAPSO_API_KEY=your_kapso_api_key_here
```

### 2. Arquitectura

```
packages/backend/src/
├── lib/kapso/              # Cliente y configuración de Kapso
│   ├── client.ts          # Funciones para interactuar con la API
│   ├── config.ts          # Configuración (URLs, temas, etc.)
│   └── types.ts           # TypeScript types
│
└── convex/kapso/          # Lógica de backend en Convex
    ├── mutations.ts       # Crear setup links, actualizar conexiones
    ├── queries.ts         # Obtener estado de conexión
    ├── webhooks.ts        # Handlers para callbacks de Kapso
    ├── helpers.ts         # Funciones auxiliares internas
    ├── validation.ts      # Schemas de validación Zod
    └── error.ts           # Errores personalizados

apps/webapp/src/
├── components/auth/
│   └── phone-registration-form.tsx  # UI para conectar WhatsApp
│
└── routes/_dashboard/whatsapp/
    ├── connected.tsx      # Página de éxito
    └── failed.tsx         # Página de error
```

## Flujo de Usuario

### Opción 1: Conectar WhatsApp Business Existente

1. Usuario hace clic en "Connect Your WhatsApp Business"
2. Sistema crea un customer en Kapso (si no existe)
3. Sistema genera un setup link
4. Usuario es redirigido a Kapso
5. Usuario inicia sesión con Facebook
6. Usuario selecciona su cuenta de WhatsApp Business
7. Usuario elige modo Coexistence o Dedicated
8. Kapso redirige a `/api/webhooks/kapso/success`
9. Sistema actualiza la base de datos con `whatsappPhoneNumberId`
10. Usuario es redirigido a `/whatsapp/connected`

### Opción 2: Solicitar Nuevo Número

1. Usuario hace clic en "Get a New WhatsApp Number"
2. Sistema crea setup link con `provision_phone_number: true`
3. Kapso provisiona un número automáticamente
4. Resto del flujo es igual

## Schema de Base de Datos

```typescript
users: {
  phoneNumber: string
  name?: string
  
  // Campos de Kapso
  kapsoCustomerId?: string
  whatsappPhoneNumberId?: string
  whatsappConnectionType?: "coexistence" | "dedicated"
  whatsappConnectedAt?: number
}
```

## API de Convex

### Mutations

**`api.kapso.mutations.createWhatsAppSetupLink`**
```typescript
{
  provisionPhoneNumber: boolean
  connectionTypes?: ("coexistence" | "dedicated")[]
}
```
Retorna: `{ setupUrl: string, expiresAt: string, kapsoCustomerId: string }`

**`api.kapso.mutations.updateWhatsAppConnection`** (internal)
```typescript
{
  userId: Id<"users">
  phoneNumberId: string
  connectionType: "coexistence" | "dedicated"
}
```

### Queries

**`api.kapso.queries.getWhatsAppConnectionStatus`**

Retorna:
```typescript
{
  isConnected: boolean
  phoneNumberId?: string
  connectionType?: "coexistence" | "dedicated"
  connectedAt?: number
  kapsoCustomerId?: string
}
```

**`api.kapso.queries.hasKapsoCustomer`**

Retorna: `boolean`

## Webhooks

### Success: `/api/webhooks/kapso/success`

Query params:
- `customer_id`: ID del customer en Kapso
- `phone_number_id`: ID del número de WhatsApp
- `connection_type`: "coexistence" o "dedicated"
- `phone_number`: (opcional) Número de teléfono

### Failure: `/api/webhooks/kapso/failed`

Query params:
- `customer_id`: ID del customer en Kapso
- `error`: (opcional) Código de error
- `error_description`: (opcional) Descripción del error

## Configuración de Kapso

En `lib/kapso/config.ts` puedes personalizar:

```typescript
{
  defaultConnectionTypes: ["coexistence", "dedicated"]
  defaultTheme: {
    primary_color: "#6366f1"
    background_color: "#ffffff"
    // ... más colores
  }
  defaultCountries: ["US", "CO"]
}
```

## Testing

### 1. Desarrollo Local

```bash
# Terminal 1: Backend
cd packages/backend
pnpm dev

# Terminal 2: Frontend
cd apps/webapp
pnpm dev
```

### 2. Probar Setup Link

1. Ve a la app en `localhost:3000`
2. Inicia sesión
3. Abre el diálogo de registro de teléfono
4. Selecciona una opción de conexión
5. Serás redirigido a Kapso

**Nota:** Para testing local, necesitas usar ngrok o similar para exponer los webhooks públicamente.

## Troubleshooting

### Error: "KAPSO_API_KEY environment variable is required"

- Asegúrate de tener `KAPSO_API_KEY` en tu `.env`
- Reinicia el servidor de desarrollo

### Webhook no se ejecuta

- Verifica que las URLs de redirect estén configuradas correctamente
- Usa ngrok para exponer tu localhost: `ngrok http 3000`
- Actualiza las URLs en `lib/kapso/config.ts`

### Usuario no se actualiza después de conectar

- Revisa los logs del webhook en la consola
- Verifica que el `customer_id` coincida con el almacenado en la DB

## Próximos Pasos

1. [ ] Implementar envío de mensajes usando `whatsappPhoneNumberId`
2. [ ] Agregar UI para desconectar WhatsApp
3. [ ] Mostrar información del número conectado
4. [ ] Implementar rate limiting basado en `connectionType`

## Referencias

- [Kapso Platform Docs](https://docs.kapso.ai)
- [Setup Links](https://docs.kapso.ai/platform/setup-links)
- [Connection Detection](https://docs.kapso.ai/platform/detecting-whatsapp-connection)
