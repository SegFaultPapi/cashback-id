# ENS: Custom Text Records y subdominios cashbackid.eth

## 1. Custom Text Records (resumen)

ENS no solo asocia un nombre (ej. `alice.eth`) a una dirección Ethereum. También permite guardar **registros de texto** (key-value) en ese nombre. Cualquier aplicación puede definir sus propias claves y leerlas/escribirlas on-chain.

- **Dónde viven:** En el contrato **Public Resolver** de ENS. Cada nombre tiene un `node` (namehash del nombre). El resolver guarda por `(node, key) → value`.
- **Quién escribe:** Solo el **owner** del nombre (o un contrato autorizado) puede llamar `setText(node, key, value)` en el resolver.
- **Quién lee:** Cualquiera puede llamar `getEnsText(name, key)` (o el método equivalente en el resolver) sin gas; es lectura.

Así, tu nombre `alice.eth` puede tener a la vez:

- Resolución estándar: `alice.eth` → `0x1234...`
- Text records: `"avatar"` → `"https://..."`, `"com.twitter"` → `"alice"`, **`"cashbackid.chain"`** → `"8453"`, etc.

---

## 2. Custom Text Records en detalle

### 2.1 Cómo funcionan técnicamente

1. **Nombre → node**  
   Se usa el **namehash** del nombre (ej. `namehash("alice.eth")`). Ese `bytes32` es el `node` que identifica al nombre en ENS.

2. **Resolver del nombre**  
   El registro ENS apunta a un “resolver” (contrato). El más usado es el **Public Resolver** (`0x231b0Ee14048e9dCcD1d247744d114a4EB5E8E63` en mainnet). Ese contrato implementa, entre otras cosas:
   - `setText(node, key, value)` — escribe un texto (solo el owner del nombre).
   - `text(node, key)` — lee el texto (cualquiera).

3. **Keys y valores**  
   - `key` y `value` son strings. No hay lista “oficial” de keys; por convención se usan namespaces, ej. `com.twitter`, `avatar`, o en nuestro caso **`cashbackid.chain`**, **`cashbackid.asset`**, etc.
   - Los valores los define la app (números como string, direcciones, URLs, etc.).

En Cashback ID usamos el **mismo** Public Resolver y las mismas funciones; solo usamos keys con prefijo `cashbackid.` para no chocar con otras apps.

### 2.2 Keys que usa Cashback ID

Definidas en `lib/ens-resolver.ts` como `ENS_RECORD_KEYS`:

| Key | Descripción | Ejemplo de valor |
|-----|-------------|-------------------|
| `cashbackid.chain` | Chain ID de destino preferido | `"8453"` (Base) |
| `cashbackid.asset` | Activo de pago (ENS o dirección) | `"usdc.tkn.eth"` |
| `cashbackid.pool` | Pool de auto-inversión | id del pool |
| `cashbackid.sui` | Dirección Sui para settlement | `0x...` |
| `cashbackid.threshold` | Mínimo en USD antes de sweep cross-chain | `"50"` |
| `cashbackid.profile_id` | Object ID del CashbackProfile en Sui | `0x...` (Sui object ID) |

- **Lectura:** `resolvePaymentPreferences(ensName)` hace varias llamadas `getEnsText(name, key)` en paralelo y devuelve un objeto `CashbackPreferences`.
- **Escritura:** No llamamos al contrato desde la app directamente. Generamos **calldata** con `buildSetPreferencesTx(ensName, preferences)` (multicall de `setText` por cada key que quieras actualizar). El usuario firma esa tx en su wallet (o Safe); así el owner del nombre es quien escribe.

### 2.3 Flujo actual en la app

1. **Vincular ENS:** El usuario escribe su nombre (ej. `alice.eth`) en “Link ENS Name”. La app llama a `resolvePaymentPreferences("alice.eth")` y guarda las preferencias en estado (y en localStorage).
2. **Verify / actualizar preferencias:** Si el usuario quiere guardar chain, asset, profileId, etc., la app construye la tx con `buildSetPreferencesTx(wallet.ensName, prefs)` y muestra el calldata para firmar en Safe (o envía la tx si es EOA).
3. **Pagar a un ENS:** En `/pay?to=alice.eth` se resuelve `resolvePaymentPreferences("alice.eth")` para obtener `profileId` (y resto de prefs) y ejecutar el pago en Sui.

Todo esto funciona igual para **cualquier** nombre ENS que tenga (o vaya a tener) estos text records: tanto `alice.eth` como, en el futuro, `alice.cashbackid.eth`.

---

## 3. Subdominios `*.cashbackid.eth`

### 3.1 Qué quieres lograr

Que un usuario pueda tener un nombre tipo **`alice.cashbackid.eth`** (subdominio bajo `cashbackid.eth`) aunque no tenga su propio `alice.eth`. Ese subdominio:

- Lo **crea** el proyecto (o un contrato del proyecto), no el usuario comprando un .eth.
- Puede usar los **mismos** text records `cashbackid.*`; la app ya los lee/escribe por nombre (`resolvePaymentPreferences`, `buildSetPreferencesTx`).

### 3.2 Requisitos

1. **Tener el nombre padre `cashbackid.eth`**  
   Alguien (el proyecto o un multisig) debe ser **registrante** del nombre `cashbackid.eth` en ENS (registrado como cualquier .eth, normalmente vía ENS app).

2. **Wrap del nombre**  
   Para crear subdominios con el flujo moderno hay que **wrap** `cashbackid.eth` en el contrato **Name Wrapper** de ENS. Así el padre se convierte en un NFT (ERC-1155) y permite llamar a `setSubnodeOwner` / `setSubnodeRecord`.

3. **Contrato “Subname Registrar”** (recomendado)  
   En lugar de que una EOA cree subdominios a mano, se despliega un contrato que:
   - Recibe el namehash del padre (`cashbackid.eth`) y un label (ej. `alice`).
   - Llama a **Name Wrapper** `setSubnodeRecord(parentNode, label, owner, resolver, ttl, fuses, expiry)` para crear `alice.cashbackid.eth`.
   - Opcionalmente en la misma tx: el contrato se pone como owner temporal, llama al resolver para setear los `cashbackid.*` iniciales, y luego traspasa el owner al usuario.

   ENS tiene [ejemplos de referencia](https://github.com/ensdomains/ens-contracts/tree/feature/subdomain-registrar/contracts/subdomainregistrar) (Forever Subname Registrar, Rental Subname Registrar).

4. **Permisos**  
   El owner de `cashbackid.eth` (wrap) debe hacer `setApprovalForAll` en el Name Wrapper a favor del contrato registrar, para que el contrato pueda crear subnodos.

### 3.3 Flujo de usuario con subdominios

1. Usuario entra a Cashback ID y no tiene ENS (o elige “Crear subdominio”).
2. Elige un label, ej. `alice` → nombre final `alice.cashbackid.eth`.
3. La app llama a tu backend o al contrato registrar (ej. `register(parentNode, "alice")`). La tx crea el subdominio y, si está en el contrato, setea el resolver y opcionalmente records por defecto.
4. A partir de ahí, ese nombre se trata como cualquier otro ENS en la app: **mismos** Custom Text Records. `resolvePaymentPreferences("alice.cashbackid.eth")` y `buildSetPreferencesTx("alice.cashbackid.eth", prefs)` funcionan igual.

### 3.4 Qué hay en el repo ahora

- **Constante y helper:** En `lib/ens-resolver.ts` están (o se añaden) la constante del padre `CASHBACKID_ENS_PARENT = "cashbackid.eth"` y un helper `isCashbackIdSubdomain(name)` para detectar nombres `*.cashbackid.eth`. La UI puede usarlos para mostrar “Subdominio Cashback ID” o para ofrecer “Reclamar subdominio” cuando tengas el registrar.
- **Registrar / backend:** Aún no hay contrato desplegado ni API que cree subdominios; eso depende de tener el dominio `cashbackid.eth` y desplegar el registrar (y opcionalmente un backend que firme o relée txs).

Cuando tengas el dominio y el contrato, solo faltaría en la app:
- Opción “Obtener subdominio cashbackid.eth” que pida el label y llame a `register` (o a tu API),
- Y seguir usando los mismos `cashbackid.*` text records sobre `alice.cashbackid.eth`.

---

## 4. Resumen

| Tema | Estado |
|------|--------|
| **Custom Text Records** | Implementados: lectura con `resolvePaymentPreferences`, escritura vía calldata con `buildSetPreferencesTx`. Keys `cashbackid.*` documentadas arriba. |
| **Subdominios `*.cashbackid.eth`** | Diseño listo; falta: poseer `cashbackid.eth`, wrap, desplegar Subname Registrar, y conectar la UI (ej. “Reclamar subdominio”) cuando exista el contrato/API. |

Los Custom Text Records son los mismos para un nombre “normal” (`alice.eth`) y para un subdominio (`alice.cashbackid.eth`); la única diferencia es quién crea el nombre (usuario vs. tu proyecto vía registrar).
