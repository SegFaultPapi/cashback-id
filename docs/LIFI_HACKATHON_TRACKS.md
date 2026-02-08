# Cómo encaja Cashback ID en los tracks de LI.FI (HackMoney)

Resumen de requisitos de cada track y cómo tu proyecto los cumple (y qué enfatizar en la submission / video).

---

## Lo que ya tienes (LI.FI)

- **SDK:** `@lifi/sdk` en `lib/lifi-client.ts`: `getRoutes`, `getQuote`, `getStatus`, `convertQuoteToRoute`.
- **Cross-chain:** `buildCashbackRoute()` construye rutas **origen (chain A + token) → destino (chain B + token)**. El destino sale de las preferencias ENS (chain, asset).
- **Varias chains:** Omnipin usa balances en **Base** y **Arbitrum** (mock) y puede enviar a **Sui** o a otra chain que el usuario elija. El usuario ve rutas entre varias chains.
- **Frontend:** Dashboard con tarjeta “Omnipin sweep”, “View route” y modal con resumen de ruta + enlace a li.fi.
- **Integraciones:** ENS (identidad y preferencias), Sui (settlement de cashback). LI.FI es la capa de routing cross-chain hacia esa settlement.

---

## 🥇 Best Use of LI.FI Composer in DeFi — $2,500

**Requisitos:**
- Usar LI.FI SDK o APIs para **al menos una acción cross-chain** (swap, bridge, o swap+bridge+contract call).
- **Al menos dos chains EVM** en el user journey.
- **Frontend funcional** que un juez pueda usar.
- Repo en Github + **video demo** del proyecto.

**Cómo encaja Cashback ID:**

| Requisito | Cumplimiento |
|-----------|----------------|
| SDK para acción cross-chain | ✅ `getRoutes()` (y `getQuote()`) para construir rutas swap/bridge desde Base/Arbitrum hacia la chain de destino. La “acción” es la **obtención y visualización de la ruta**; la ejecución la hace el usuario en li.fi (enlace desde tu app). |
| Dos chains EVM en el journey | ✅ **Base** y **Arbitrum** como orígenes en Omnipin. El usuario configura destino (p. ej. Sui u otra EVM). El journey incluye al menos dos EVM (origen + opcionalmente destino EVM). |
| Frontend clickeable | ✅ Dashboard → Omnipin sweep → “View route” → modal con ruta y “Open in LI.FI”. |

**Cómo contarlo en la submission / video:**

- “Usamos **LI.FI Composer/SDK** (`getRoutes`) para orquestar rutas cross-chain: el usuario tiene cashback en varias chains (Base, Arbitrum); sus preferencias ENS definen **una sola** chain/asset de destino. Construimos la ruta óptima en un solo flujo y la mostramos en nuestra UI; el usuario puede ejecutarla en LI.FI con un clic.”
- En el video: **Sign in → Verify (elegir chain/asset destino) → Dashboard → Omnipin sweep → “View route”** y enseñar el modal (resumen, gas, tiempo, link a li.fi). Mencionar que el destino viene de ENS y que LI.FI unifica liquidez de varias chains hacia ese destino.

**Nota:** El track pide “multi-step DeFi workflows … in a **single, user-friendly experience**”. Tu experiencia es “configurar destino una vez (ENS) → ver rutas listas para ejecutar en LI.FI”. Si en el futuro añades **ejecución in-app** (firmar la tx de LI.FI desde tu frontend), encajaría aún más en “single experience”; con lo actual ya cumples uso claro del SDK y dos chains EVM.

---

## 🥈 Best AI x LI.FI Smart App — $2,000

**Requisito central:** App o agente **con AI** que use LI.FI como capa de ejecución cross-chain (monitor → decide → actuar con LI.FI).

Cashback ID hoy **no** es un agente ni tiene AI. Este track no aplica salvo que añadas, por ejemplo, un agente que decida cuándo hacer sweep o qué ruta elegir usando LI.FI. No es necesario para probar LI.FI; solo para este premio concreto.

---

## 🥉 Best LI.FI-Powered DeFi Integration — $1,500 + podio

**Requisitos:**
- Usar **LI.FI API/SDK** para swaps/bridges o deposits cross-chain.
- Integrar **al menos un protocolo DeFi o wallet externo** (lending, restaking, LP, on-chain fund, etc.).
- Foco en **fiabilidad y UX** (slippage, errores, gas).
- Video demo + Github.

**Cómo encaja Cashback ID:**

| Requisito | Cumplimiento |
|-----------|----------------|
| LI.FI para cross-chain | ✅ SDK para rutas (swap/bridge) desde múltiples chains hacia la chain de preferencia del usuario. |
| Protocolo/wallet externo | ✅ **Sui** (profiles + checkout) como protocolo de settlement; **ENS** como identidad y configuración. LI.FI “alimenta” ese flujo trayendo liquidez de otras chains hacia donde el usuario recibe (Sui u otra). |
| UX / fiabilidad | ✅ Mostrar gas, tiempo estimado y resumen de ruta; enlace a LI.FI para ejecutar con su UX. Opcional: en el video mencionar manejo de errores o límites (p. ej. umbral de sweep). |

**Cómo contarlo:**

- “**LI.FI** es nuestra capa de liquidez cross-chain: el usuario define **una** chain/asset de destino en ENS; nosotros usamos LI.FI para **enrutar** cashback desde cualquier chain soportada (Base, Arbitrum, etc.) hacia esa destino. Integramos con **Sui** (settlement) y **ENS** (identidad y preferencias) para un flujo DeFi unificado.”
- En el video: mismo flujo que para Composer (Verify → Dashboard → Omnipin → View route) y destacar la integración con Sui y ENS.

---

## Resumen práctico

| Track | ¿Encaja? | Qué hacer |
|-------|----------|-----------|
| **Best Use of LI.FI Composer** | ✅ Sí | Enfocar en: SDK (`getRoutes`/`getQuote`), dos chains EVM en el journey (Base, Arbitrum), flujo “preferencias ENS → una ruta lista para ejecutar en LI.FI”. Video: Verify → Dashboard → View route. |
| **Best AI x LI.FI** | ❌ No (sin AI/agente) | Omitir o solo mencionar si añades un agente con LI.FI más adelante. |
| **Best LI.FI-Powered DeFi Integration** | ✅ Sí | Enfocar en: LI.FI como capa de routing, integración con Sui + ENS, UX (resumen de ruta, gas, link a li.fi). Mismo video que Composer. |

Puedes **presentarte a los dos premios que encajan** (Composer y DeFi Integration) con el mismo repo y video, cambiando solo el énfasis del texto: en uno subrayas “orquestación de rutas multi-chain en una experiencia unificada” y en el otro “integración DeFi con Sui/ENS usando LI.FI para liquidez cross-chain”.
