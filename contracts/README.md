# ENS Subname Registrar for cashbackid.eth

Contrato para emitir subdominios **on-chain** bajo `cashbackid.eth` (ej. `alice.cashbackid.eth`), usando el [Name Wrapper](https://docs.ens.domains/wrapper/overview/) de ENS.

**Dominio registrado:** [cashbackid.eth](https://etherscan.io/address/0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217) (owner: `0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217`).

Referencias:
- [ENS – Issuing Subdomains](https://docs.ens.domains/web/subdomains)
- [Creating a Subname Registrar](https://docs.ens.domains/wrapper/creating-subname-registrar/)
- [ENS Deployments](https://docs.ens.domains/learn/deployments)

---

## Prerrequisitos

1. **Wrap** el nombre `cashbackid.eth` en el Name Wrapper (en [app.ens.domains](https://app.ens.domains) → Manager → “Wrap Name”).
2. (Opcional) **Lock** el nombre si quieres subnodos con fuses “emancipated” sin poder deshacer el wrap.

---

## Direcciones Mainnet (ENS)

Estas direcciones son **oficiales** de ENS en Ethereum Mainnet. Fuente: [ENS Deployments](https://docs.ens.domains/learn/deployments).

| Contrato        | Dirección |
|-----------------|-----------|
| Name Wrapper    | `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401` |
| Public Resolver | `0xF29100983E058B709F3D539b0c765937B804AC15` |

No las despliegas tú; son contratos de ENS. Tu tx de wrap ya usó ese Name Wrapper.

---

## Namehash del padre (cashbackid.eth)

El `parentNode` es el **namehash** de `cashbackid.eth`. Tras hacer wrap, puedes leerlo en el evento **NameWrapped** de tu tx en Etherscan (campo `node`).

**Valor para cashbackid.eth:**

```
0xBC246139204AAAA7457FF8281BBEC8CC5A5B09011B9E095572F979AFEBFABAEA
```

**Comprobar en Node (desde la raíz del repo):**
```bash
node -e "const { namehash } = require('viem/ens'); console.log(namehash('cashbackid.eth'))"
```

**O en Remix:** Despliega `script/GetNamehash.s.sol` y llama a `getParentNode()`.

---

## Compilar (Foundry)

```bash
cd contracts
forge install foundry-rs/forge-std   # solo la primera vez
forge build
```

Si `forge build` falla por *timeout* o *error decoding response body*, Foundry está intentando descargar el compilador solc y la red puede estar lenta. Prueba:
1. **Reintentar** `forge build` más tarde.
2. **Instalar solc en el sistema:** `brew install solidity` (luego vuelve a `forge build`).
3. **Usar Remix** (ver más abajo) y no depender de Foundry para compilar.

Si no tienes Foundry: [install](https://book.getfoundry.sh/getting-started/installation). O compila y despliega con **Remix** (ver sección Deploy con Remix).

---

## Deploy en Mainnet y gas

Script: `script/DeployCashbackIdRegistrar.s.sol`.

**Clave del deployer:** pásala con `--private-key` (evita problemas al leer `PRIVATE_KEY` desde el `.env`). El `.env` está en la **raíz del repo**, no en `contracts/`.

**Solo estimar gas (dry-run, no envía tx):**
```bash
cd "$(git rev-parse --show-toplevel)"
export PRIVATE_KEY=$(grep '^PRIVATE_KEY=' .env | cut -d= -f2-)
export ETH_RPC_URL=$(grep -E '^(NEXT_PUBLIC_ETH_RPC_URL|ETH_RPC_URL)=' .env | cut -d= -f2-)
cd contracts
forge script script/DeployCashbackIdRegistrar.s.sol:DeployCashbackIdRegistrarScript \
  --rpc-url "${ETH_RPC_URL:-https://ethereum.publicnode.com}" --private-key "$PRIVATE_KEY" -vvvv
```
Al final del output verás el gas usado. Si da 429, pon `ETH_RPC_URL` en `.env` (Alchemy/Infura) o prueba `--rpc-url https://1rpc.io/eth`.

**Desplegar en mainnet** (desde la raíz del repo, cargar `PRIVATE_KEY` y opcionalmente `ETH_RPC_URL`):
```bash
cd "$(git rev-parse --show-toplevel)"
export PRIVATE_KEY=$(grep '^PRIVATE_KEY=' .env | cut -d= -f2-)
# Opcional: RPC con más cuota (evita 429). Si tienes NEXT_PUBLIC_ETH_RPC_URL o ETH_RPC_URL en .env:
export ETH_RPC_URL=$(grep -E '^(NEXT_PUBLIC_ETH_RPC_URL|ETH_RPC_URL)=' .env | cut -d= -f2-)
cd contracts
forge script script/DeployCashbackIdRegistrar.s.sol:DeployCashbackIdRegistrarScript \
  --rpc-url "${ETH_RPC_URL:-https://ethereum.publicnode.com}" --broadcast --private-key "$PRIVATE_KEY"
```
Si prefieres no usar `.env`, sustituye `"$PRIVATE_KEY"` por tu clave en hex (y no la dejes en el historial).

**Si ves error 429 (rate limit):** el RPC público está limitando peticiones. Usa un RPC con API key (recomendado para deploy):
- Añade en la raíz `.env`: `ETH_RPC_URL=https://eth-mainnet.g.alchemy.com/v2/TU_ALCHEMY_KEY` o `https://mainnet.infura.io/v3/TU_INFURA_KEY`.
- Vuelve a ejecutar el bloque de arriba (así `ETH_RPC_URL` se cargará y se usará en `--rpc-url`).
- Alternativas públicas (pueden seguir limitando): `https://1rpc.io/eth`, `https://rpc.ankr.com/eth`, `https://ethereum.publicnode.com`.

**Verificar en Etherscan (opcional):**
```bash
forge script ... --broadcast --verify --etherscan-api-key $ETHERSCAN_API_KEY
```

### Deploy con Remix (si Foundry falla por red)

1. Abre [remix.ethereum.org](https://remix.ethereum.org).
2. Crea dos archivos en `contracts/`:
   - `ens/INameWrapper.sol` (copia el contenido de `contracts/ens/INameWrapper.sol`).
   - `CashbackIdRegistrar.sol` (copia el de `contracts/CashbackIdRegistrar.sol`; en el `import` pon `./ens/INameWrapper.sol`).
3. Compila: Solidity 0.8.19, EVM Paris. Compila `CashbackIdRegistrar`.
4. Deploy: Inyectar wallet (la que tiene `PRIVATE_KEY`), red Mainnet. Constructor:
   - `_nameWrapper`: `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`
   - `_defaultResolver`: `0xF29100983E058B709F3D539b0c765937B804AC15`
   - `_parentNode`: `0xBC246139204AAAA7457FF8281BBEC8CC5A5B09011B9E095572F979AFEBFABAEA`
   - `_defaultExpiry`: `1809846971`
5. Transact. Anota la dirección del contrato desplegado y luego llama `setApprovalForAll(registrar, true)` en el Name Wrapper desde `0x04BEf...`.

### Estimación de gas y costo

| Concepto        | Valor aproximado |
|----------------|-------------------|
| Gas deploy     | ~350 000 – 450 000 |
| A 30 gwei      | ~0.013 – 0.017 ETH |
| A 50 gwei      | ~0.017 – 0.022 ETH |
| En USD (ETH $2000) | ~$26 – $44 |

Gas actual en mainnet: [Etherscan Gas Tracker](https://etherscan.io/gastracker). El deploy es una sola tx de creación de contrato; el costo depende del gas price en el momento.

---

## Desplegar

### Constructor

```text
_nameWrapper     = 0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401
_defaultResolver = 0xF29100983E058B709F3D539b0c765937B804AC15
_parentNode      = 0xBC246139204AAAA7457FF8281BBEC8CC5A5B09011B9E095572F979AFEBFABAEA
_defaultExpiry   = no puede superar el expiry del padre (en tu wrap: 1809846971). Usa 1809846971 o menor (ej. 2 años desde hoy).
```

El expiry del padre lo ves en la tx de wrap (evento NameWrapped, campo `expiry`). Los subnombres quedan limitados por ese valor.

### Después de desplegar

1. **Aprobar el registrar**  
   Desde la wallet que es **owner** de `cashbackid.eth` (wrapped) (`0x04BEf5bF293BB01d4946dBCfaaeC9a5140316217`):
   - Contrato: **Name Wrapper** `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401`
   - Llamar: `setApprovalForAll(address(registrar), true)`

2. (Opcional) Si desplegaste como “owner” del registrar y quieres que cualquiera reclame sin tu firma, no hagas nada más: `register(label)` es público.  
   Si quieres que solo un backend registre: mantén `onlyOwner` y usa `registerFor(label, userAddress)` desde ese owner.

---

## Uso del contrato

| Función | Quién | Descripción |
|--------|--------|-------------|
| `register(string label)` | Cualquiera | Crea `label.cashbackid.eth` y asigna el NFT al que llama (`msg.sender`). |
| `registerFor(string label, address registrant)` | Solo owner del contrato | Crea el subdominio y lo asigna a `registrant`. |
| `setDefaultExpiry(uint64)` | Solo owner | Cambia el expiry por defecto de nuevos subnodos. |
| `setOwner(address)` | Solo owner | Transfiere la propiedad del contrato. |

El resolver por defecto es el Public Resolver; los text records `cashbackid.*` se pueden configurar desde la app (Verify) como en cualquier nombre ENS.

---

## Integración con la app (qué sigue)

**Contrato desplegado:** `0x590992a59EB5b989030A75AB8f32d2DFF0c70073` (mainnet). Desplegado con `parentNode` correcto (…BAEA). **Siguiente paso:** desde la wallet owner de cashbackid.eth (0x04BEf...), llamar en el Name Wrapper `0xD4416b13d2b3a9aBae7AcD5D6C2BbDBE25686401` a `setApprovalForAll(0x590992a59EB5b989030A75AB8f32d2DFF0c70073, true)`. La app ya tiene esta dirección en `.env`.

1. **Configurar la app:** en la raíz del repo, en `.env`, está (o puedes añadir): `NEXT_PUBLIC_ENS_REGISTRAR_ADDRESS=0x590992a59EB5b989030A75AB8f32d2DFF0c70073`. La app usa `ENS_REGISTRAR_ADDRESS` de `lib/ens-resolver.ts` para el flujo on-chain.

2. **Registro on-chain (próximo paso):**
   - **Opción A (recomendada):** en “Get my .cashbackid.eth”, que la app abra la wallet del usuario y envíe una tx a `registrar.register(label)` en Mainnet. El usuario paga gas y el subdominio queda registrado on-chain.
   - **Opción B:** el backend (owner del contrato) llama `registerFor(label, userAddress)` y paga el gas; la app solo muestra “Claimed” sin tx del usuario.

3. Hoy la app usa el store local (`/api/ens/claim-subdomain`) para subdominios “virtuales”. Cuando implementes la tx on-chain, la resolución de `alice.cashbackid.eth` será vía ENS en mainnet (resolver estándar) además de tu API.
