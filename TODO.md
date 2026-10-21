# CineVerse — Entregas

## Aplicação funcional com TMDB
- [x] A página inicial carrega uma seleção real de filmes do TMDB sem exigir pesquisa. Validado no Preview com `discover/movie` e 20 resultados.
- [x] A pesquisa por título usa `/search/movie` quando não há filtro de género e envia o ano como parâmetro real. Validado com “Matrix”, ano 1999 e resultado real.
- [x] A pesquisa com género usa `/discover/movie` com `with_text_query`, `with_genres` e `primary_release_year`, alterando de facto a requisição. Validado com “Matrix”, ano 1999, género Ação e etiqueta de endpoint exibida.
- [x] Os resultados aparecem em cards dinâmicos com pôster, título, ano, avaliação e ação para abrir detalhes.
- [x] A vista individual usa `/movie/{movie_id}` e apresenta dados opcionais sem quebrar quando ausentes. Validado na rota `#/movie/603`.
- [x] Os créditos usam `/movie/{movie_id}/credits` e exibem todo o elenco devolvido pela API, mantendo a ordem da resposta. Validado com 37 participantes de Matrix.
- [x] Cada card de elenco apresenta nome, personagem quando disponível, fotografia quando disponível e ligação acessível para o perfil. Cards sem fotografia foram verificados com fallback de iniciais.
- [x] O perfil usa `/person/{person_id}` e inclui biografia, nascimento, local e outros dados retornados. Validado com Keanu Reeves.
- [x] A filmografia usa `/person/{person_id}/movie_credits` e permite abrir outros filmes. Validado com 133 títulos retornados.
- [x] Loading, erros HTTP/autenticação/rede, respostas vazias, imagens ausentes e campos opcionais são tratados com estados próprios no código. Loading, resposta vazia e campos/imagens ausentes foram executados; as branches de erro de autenticação e rede permanecem prontas para uma chave inválida ou indisponibilidade.

## Experiência e acessibilidade
- [x] Identidade visual original em grafite, dourado e vermelho cinematográfico, com tipografia elegante, cards refinados, hover subtil e transições suaves.
- [x] Navegação por hash funciona em GitHub Pages e subdiretórios; o manifesto declara as rotas com hash.
- [x] Layout responsivo para computador, tablet e telemóvel. Capturas desktop e 390px foram verificadas.
- [x] Estrutura semântica, labels, foco visível, textos alternativos e regiões `aria-live`.
- [x] Rodapé com campo editável para nome do aluno, disciplina Unoesc e atribuição TMDB com declaração de não endosso.

## Documentação e publicação
- [x] README explica REST, `fetch`, `async/await`, JSON para HTML, IDs, filtros, endpoints, chave e publicação na branch `gh-pages`.
- [x] `manus-routes.json` declara as rotas principais com hash.
- [x] Configuração de build estático pronta para publicação, com `dist` como saída.
- [x] Fluxos principais, sintaxe JavaScript, rotas, endpoints reais e responsividade foram validados antes da entrega.
- [ ] Publicação efetiva em um repositório GitHub Pages na branch `gh-pages`: aguarda a conexão/URL do repositório do aluno; não foi declarada como concluída.
