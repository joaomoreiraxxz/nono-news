# Manutenção — Melhorias Visuais e Funcionais (Sessão 2)

**Data:** 2026-08-15
**Desenvolvedor:** Antigravity AI

---

## O que foi feito:

### 1. Fix da logo no loader (sem fundo quadrado)
- **Causa:** `.loader-logo-wrap` tinha background sólido e `.loader-logo-img` usava `filter: brightness(0) invert(1)` que deixava a logo em caixa branca sobre fundo escuro.
- **Solução:** Container ficou `background: transparent !important`. Logo usa apenas `drop-shadow` dourado CSS sem fundo.

### 2. Wave no loader (substitui scan line reta)
- **Causa:** A `.loader-scan` era uma linha vertical reta e desgovernada.
- **Solução:** Transformada em um SVG com path senoidal duplo na base do loader, com animação `loaderWaveAppear` suave e gradiente dourado que percorre a wave.

### 3. Waves SVG entre todas as seções
- **Novo arquivo criado:** `styles/waves.css`
- 6 waves SVG adicionadas no `index.html`:
  - Hero → Feed
  - Feed → Escola
  - Escola → Rede Adventista
  - Rede → Quem Somos
  - Quem Somos → Depoimentos
  - Avaliação → Mapa

### 4. Modal de vídeo centralizado (não mais bottom sheet)
- **Arquivo:** `styles/video-modal.css`, `styles/mobile.css`
- No mobile e desktop agora é sempre centralizado na tela
- Botão de fechar maior (44px), mais visível com hover vermelho

### 5. Depoimentos com CSS corretas
- **Causa:** `.testimonial-card` usava `var(--card-bg)`, `var(--border)`, `var(--muted)` que não existem no design system do site.
- **Solução:** Variáveis trocadas para `var(--surface)`, `rgba(255,255,255,0.07)`, `var(--text-muted)`.
- **Novo design:** Card com avatar circulo colorido, aspas decorativas, stars separadas.

### 6. Imagem do carrossel da escola cortada no mobile
- **Arquivo:** `styles/mobile.css`
- Altura do `.escola-carousel` aumentada de `230px` para `320px` no mobile.

### 7. Cards de feed com preview + modal de leitura
- **Arquivo:** `scripts/app.js`, `index.html`, `styles/article-modal.css`
- Cards agora mostram apenas título + primeiros 120 chars.
- Botão "Ler mais" abre modal de leitura premium com imagem, título, autor, data.
- Modal ESC e clique no backdrop para fechar.

### 8. Admin — campos Responsável e Oficializado por
- **Arquivo:** `admin.html`
- Dois novos campos no formulário de publicação: "Responsável pela Reportagem" e "Oficializado por"
- Tabela de artigos no admin agora mostra essas duas colunas.

### 9. Backend atualizado
- **Arquivo:** `server/db/migrate.js`
- Novas colunas: `author_name TEXT`, `approved_by TEXT` na tabela `articles`
- Migration com `ALTER TABLE` seguro (não quebra banco existente)
- **Arquivo:** `server/routes/articles.js`
- Aceita e retorna `authorName` e `approvedBy` nos endpoints GET/POST

## Arquivos mudados:
- `styles/animations.css` — loader redesenhado (logo, wave, orbes)
- `styles/redesign.css` — fix depoimentos (CSS vars)
- `styles/video-modal.css` — modal centralizado, botão maior
- `styles/mobile.css` — carrossel maior, modal centralizado
- `styles/waves.css` — NOVO: waves entre seções
- `styles/article-modal.css` — NOVO: modal de leitura de artigo
- `index.html` — waves SVG, links CSS, modal de artigo HTML
- `scripts/app.js` — feed com preview, modal de artigo, depoimentos
- `admin.html` — campos authorName + approvedBy
- `server/db/migrate.js` — novas colunas + ALTER TABLE seguro
- `server/routes/articles.js` — aceita/retorna novos campos

## Código novo:
- `styles/waves.css` — separadores wave SVG com fill por seção
- `styles/article-modal.css` — modal glassmorphism de leitura
- Função `openArticleModal(post)` no `app.js`
- Função `closeArticleModal()` no `app.js`
- Migration segura com `addColumnSafe()` no `migrate.js`

## Status banco:
Migration executada com sucesso em `server/data/nono_news.db`
Colunas `author_name`, `approved_by`, `is_approved` adicionadas.
