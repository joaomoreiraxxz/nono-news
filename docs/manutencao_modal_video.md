# Manutenção — Modal de Vídeo "Conheça Nossa Escola"

**Data:** 14/08/2026  
**Conversa:** a9fde0b9-7877-43a2-a9a6-705accc8ee4f

---

## O que foi feito

Adicionado um modal premium de vídeo YouTube na seção "Nossa Escola" do site.

### Botão trigger
- Botão com ícone de play dourado animado (anel pulsante + shimmer no hover)
- Texto "Conheça Nossa Escola" + subtítulo "Assista ao vídeo oficial"
- Posicionado no `escola-header-inner` à direita

### Modal
- Overlay com `backdrop-filter: blur(18px)` e fundo rgba escuro
- Card com animação de entrada `translateY(60px) scale(0.92) → translateY(0) scale(1)` (sem fade!)
- Linha dourada decorativa no topo do card
- Header: logo EACA + título + botão fechar (rotate 90° no hover)
- Vídeo YouTube 16:9 responsivo (embed com autoplay, hd1080, sem branding)
- Footer: tags da escola + link "Ver no YouTube" com ícone do YouTube
- Fecha com: clique no X, clique no backdrop, tecla ESC

### YouTube (vídeo)
- ID: `q_R-ZKMCUq4`
- URL: `https://www.youtube.com/watch?v=q_R-ZKMCUq4`
- Embed: `?autoplay=1&rel=0&modestbranding=1&color=white&vq=hd1080`
- Lazy load: iframe só carrega quando o modal abre (economiza dados)
- O vídeo para automaticamente quando o modal fecha

---

## Arquivos mudados/criados

| Arquivo | Mudança |
|---|---|
| `styles/video-modal.css` | **NOVO** — CSS completo do modal e botão |
| `index.html` | Botão trigger na seção escola + HTML do modal + link do CSS |
| `scripts/app.js` | Lógica JS do modal (seção 11) |
