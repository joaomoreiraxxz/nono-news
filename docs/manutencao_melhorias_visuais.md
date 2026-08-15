# Manutenção — Melhorias Visuais, Animações e Correções de Bug

**Data:** 14/08/2026  
**Conversa:** a9fde0b9-7877-43a2-a9a6-705accc8ee4f

---

## Correções de Bug (v2)

### Bug 1 — Logo do loader gigante
- **Causa:** `.loader-logo-wrap` não tinha `width` definido, então o `display: flex` deixava o container se expandir com o título grande (10rem), fazendo a imagem perder o limite
- **Fix:** Adicionado `width: min(90vw, 480px)` no container e `width: 80px !important; min-width: 80px; max-width: 80px; flex-shrink: 0` na `.loader-logo-img`
- **Arquivo:** `styles/animations.css`

### Bug 2 — Fotos com baixa qualidade
- **Causa:** `.carousel-slide img` tinha `filter: brightness(0.8)` que deixava as fotos 20% mais escuras e apagadas
- **Fix:** Removido o filtro de brightness
- **Arquivo:** `styles/redesign.css` linha 409

---

**Conversa:** a9fde0b9-7877-43a2-a9a6-705accc8ee4f

---

## O que foi feito

### 1. Correção — Grid sobrepondo o hero
O `patterns.css` tinha um seletor `.cinehero::after` que aplicava um grid quadriculado com `z-index: 3` por cima da foto da escola, destruindo o visual cinemático. Foi substituído por uma vinheta radial sutil nas bordas.

### 2. Nova tela de carregamento cinematográfica
O loader foi completamente reescrito. A sequência de animação é:
- `0.0s` — Fundo preto com orbes de luz dourados animados + grid de pontos
- `0.4s` — Logo entra com **clip-path reveal** de baixo para cima
- `1.0s` — Linha dourada expande abaixo da logo
- `1.1s` — "Nono" aparece com **mask reveal** (sobe de dentro do clip)
- `1.35s` — "News" (dourado gradiente) com mesmo efeito
- `1.9s` — Subtitle slide in
- `2.3s` — **Scan line dourada horizontal** atravessa a tela
- `2.8s` — Barra de progresso dourada completa
- `3.4s` — O loader inteiro **sobe (`translateY(-100%)`)** revelando o site — **sem fade!**
- Cantos decorativos dourados em todos os 4 cantos

### 3. Sincronização dos delays do hero
Todos os delays das animações do `redesign.css` foram ajustados para começar **depois que o loader saiu** (~4.3s+), garantindo que o conteúdo do hero revele de forma encadeada e cinematográfica.

### 4. Upgrades de fundo das seções
Todos os fundos foram melhorados em `patterns.css`:
- **Body**: 4 orbes de luz nos cantos (antes eram 2)
- **Hero**: Vinheta suave no lugar do grid destrutivo
- **Feed**: Adicionado orbe de luz azul central
- **Escola header**: Grid dourado mais intenso + orbe no canto
- **Rede Adventista**: Orbe maior (700px) com mix de dourado/azul
- **Quem Somos**: Cross dots mais visíveis
- **Avaliação**: Linhas horizontais + luz dourada central maior (800px)
- **Footer**: Adicionado orbe azul superior

### 5. Timing do JS ajustado
O `app.js` agora usa `dismissLoader` com delay de `3400ms` (antes era `2200ms`) para alinhar com a sequência de animação completa.

---

## Arquivos mudados

| Arquivo | Tipo de mudança |
|---|---|
| `styles/animations.css` | **Reescrito completamente** |
| `styles/patterns.css` | Grid hero removido, fundos melhorados |
| `styles/redesign.css` | Delays do hero sincronizados com novo loader |
| `index.html` | HTML do loader atualizado (nova estrutura) |
| `scripts/app.js` | Timing do dismissLoader atualizado |

---

## Código novo (estrutura HTML do loader)

```html
<div id="loader">
  <!-- Cantos decorativos dourados -->
  <div class="loader-corner loader-corner-tl"></div>
  <div class="loader-corner loader-corner-tr"></div>
  <div class="loader-corner loader-corner-bl"></div>
  <div class="loader-corner loader-corner-br"></div>
  <!-- Scan line dourada horizontal -->
  <div class="loader-scan"></div>
  <!-- Conteúdo central -->
  <div class="loader-logo-wrap">
    <img src="/assets/logo.png" alt="Logo" class="loader-logo-img">
    <div class="loader-logo-line"></div>
    <div class="loader-title">
      <span class="loader-word">Nono</span>
      <span class="loader-word loader-word-gold">News</span>
    </div>
    <div class="loader-subtitle">9º MA + MB — Reportagem Escolar</div>
  </div>
  <!-- Barra de progresso na base -->
  <div class="loader-bar"><div class="loader-bar-fill"></div></div>
</div>
```
