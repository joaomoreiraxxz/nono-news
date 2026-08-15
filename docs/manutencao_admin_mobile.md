# Manutenção — Fix Admin + Mobile Layout

## O que foi feito:

### Admin (login.html)
- **Fix botões congelados**: O login-page ficava invisível mas ainda cobria a tela bloqueando cliques. Agora ao fazer login, o login-page recebe `display:none`, `pointer-events:none`, `visibility:hidden`, `position:absolute`, `z-index:-1` — 5 camadas de segurança para sumir completamente
- **Bottom navigation mobile**: No celular, sidebar some e aparece barra inferior com 5 botões (Dashboard, Publicar, Artigos, Avaliações, Sair)
- **z-index no admin-page**: Adicionado `position:relative; z-index:10` para ficar acima de qualquer elemento residual

### Site mobile (mobile.css)
- **Footer compacto 2 colunas**: Footer-grid usa `1fr 1fr` no mobile. Brand ocupa 2 colunas centralizada no topo, colunas de links ficam lado a lado
- **nav-links invisível**: `visibility:hidden !important; pointer-events:none !important` para impedir que o menu mobile fantasma bloqueie interações
- **Botões hero lado a lado**: `flex-direction: row` nos botões do hero para não ficarem empilhados
- **Info cards 2 colunas**: escola-info-row mantém 2 colunas compactas no mobile

## Arquivos mudados:
- `login.html` — admin mobile-first com bottom nav
- `styles/mobile.css` — layout mobile completo
- `styles/main.css` — container width fix

## Código novo:
- Arquivo `styles/mobile.css` reescrito do zero
- Função `showAdmin()` com 5 propriedades de hide no login-page
