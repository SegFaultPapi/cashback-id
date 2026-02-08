# Siguientes pasos: enlazar Sui y reflejar cashback al gastar

## Qué ya está enlazado

| Pieza | Estado | Cómo funciona |
|-------|--------|----------------|
| **ENS → Sui** | ✅ | Al reclamar `you.cashbackid.eth` y configurar Verify (chain, asset, pool, profileId), el resolve devuelve `profileId` y `suiAddress` para pagos. |
| **Recibir pago (cashback)** | ✅ | Alguien va a **Pay**, pone tu `nombre.cashbackid.eth`, manda cantidad → `POST /api/pay` → Move `checkout::process_payment` en Sui → el cashback se acredita en tu **perfil Sui**. |
| **Balance en Dashboard** | ✅ | El balance "Cashback balance (Sui)" viene de Sui (`getCashbackBalance`). Si te pagan, al recargar el dashboard o volver a la pestaña se ve el nuevo balance. |
| **Rewards / Claim** | ✅ | En **Rewards** puedes reclamar lo acumulado en el perfil (flujo Sui). |

Es decir: **cuando te pagan desde la app**, el cashback ya se refleja en Sui; lo que puede faltar es **refrescar el balance** sin recargar la página (ver abajo).

---

## Qué falta para “reflejar cashback cada vez que se gasta”

Hay dos escenarios:

### 1. Gastar = “alguien te paga” (flujo actual)

- **Ya está:** Pay → `/api/pay` → Sui.
- **Mejora recomendada:** Después de que alguien te pague, que el **dashboard refresque solo el balance de Sui** (sin recargar). Por ejemplo:
  - En **Pay**, tras un pago exitoso, el **pagador** ya ve el digest.
  - El **receptor** no tiene forma de saber que le pagaron salvo que refresque. Opciones:
    - **A)** En el **dashboard**, al entrar o al hacer foco en la ventana, llamar de nuevo a `getCashbackBalance()` (o un endpoint que devuelva balance + últimos movimientos).
    - **B)** Si en el futuro hay notificaciones o websockets, notificar “te acaban de pagar” y refrescar balance.

### 2. Gastar = “tú compras en una tienda” (comercio real)

Aquí el cashback lo genera la **compra en un merchant** (Amazon, Target, etc.). Para que eso se refleje en Sui hace falta este flujo:

1. **Origen del cashback**  
   Algún sistema (affiliate, partner, card-linked offers) debe decir: “Usuario X (identificado por ENS o Sui address) gastó Y en merchant Z y tiene cashback W (en chain C, token T)”.

2. **Backend que reciba el evento**  
   - Recibir “usuario, merchant, amount, cashback, chain, token”.
   - Resolver **ENS** del usuario para saber `profileId` y preferencias (destino Sui, asset, etc.).

3. **Bridge (si el cashback está en EVM)**  
   - Usar **LI.FI** (ya integrado: `buildCashbackRoute`, `getCashbackQuote`) para llevar el cashback de la chain de origen a Sui (o a la chain que tenga el usuario en preferencias).

4. **Registro de prueba (opcional pero recomendable)**  
   - Llamar **`recordCashback`** (Filecoin/IPFS) con: source chain, tx hash, amount, merchant, destino, etc. Así queda una prueba inmutable de cada cashback.

5. **Acreditar en Sui**  
   - Si el cashback llega en **Sui**: acreditar al perfil (llamada Move tipo `process_payment` o lo que exponga tu contrato).
   - Si el cashback llega en **EVM** y el usuario quiere recibir en Sui: usar LI.FI para bridge y luego acreditar en Sui (o que el usuario reciba ya en Sui vía LI.FI “to Sui”).

Resumen: **“Reflejar cashback cada vez que se gasta” en comercios reales** = integración con un **origen de datos de compras/cashback** (affiliate, API de merchant, etc.) + mismo flujo ENS → (opcional) bridge → proof → Sui.

---

## Orden sugerido de implementación

1. **Refresco de balance en Dashboard**  
   - Al montar el dashboard o al volver a la pestaña (o cada N segundos si quieres), llamar otra vez a `getCashbackBalance()` (o a un endpoint que devuelva balance reciente).  
   - Así, cuando te paguen, al abrir el dashboard verás el cashback sin recargar.

2. **Datos reales en Activity**  
   - Hoy la pestaña Activity usa **mock**. Cuando tengas eventos reales (pagos recibidos vía `/api/pay`, o más adelante proofs de Filecoin), sustituir el mock por:
     - eventos de Sui (si el contrato emite eventos por cada acreditación), o
     - un endpoint que liste “últimos cashbacks” (por ejemplo desde Filecoin/DB o desde índice de txs Sui).

3. **Record proof en el flujo de Pay**  
   - Después de un `POST /api/pay` exitoso, opcionalmente llamar **`recordCashback`** con los datos del pago (origen, amount, merchant = “Cashback ID Pay”, destino Sui, etc.) y guardar el CID. Así cada pago queda con una prueba en Filecoin.

4. **Integración con comercios / “gasto real”**  
   - Definir cómo recibirás eventos de cashback (API de partner, webhooks, etc.).
   - Implementar el flujo: evento → resolver ENS → (LI.FI si aplica) → recordCashback → acreditar en Sui.
   - Conectar el dashboard/Activity a esa fuente para mostrar “cashback por compra en X” en lugar de solo mock.

---

## Variables de entorno necesarias (recordatorio)

Para que Pay y Sui funcionen en producción:

- `SUI_PRIVATE_KEY` – clave del servidor (base64); debe tener SUI para gas.
- `NEXT_PUBLIC_CASHBACK_PACKAGE_ID` – package Move (profile + checkout) en testnet/mainnet.
- `NEXT_PUBLIC_SUI_NETWORK` – `testnet` o `mainnet`.

Con eso, el flujo “alguien paga a tu nombre → cashback en Sui” está cerrado; el siguiente paso es refrescar bien el balance en la UI y, cuando quieras cashback por compras reales, añadir el origen de datos y el pipeline anterior.
