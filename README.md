# Cambio-MZ

Aplicação de consulta, conversão e tendências cambiais em Moçambique, com taxas de referência obtidas por uma API pública.

## Desenvolvimento

```sh
npm install
npm run dev
```

A aplicação consulta a API pública [Frankfurter](https://frankfurter.dev/) para obter taxas de referência com base no metical (MZN). O catálogo da API disponibiliza mais de 200 moedas e ativos com taxas suportadas. Se a API estiver indisponível, usa os valores locais de demonstração em `src/data/demoCurrencies.js`. As taxas são indicativas, podem ter atraso e diferir das praticadas por instituições financeiras; confirme sempre a taxa antes de uma transação.

## Build e GitHub Pages

```sh
npm run build
npm run preview
```

O workflow `.github/workflows/deploy.yml` compila o site e publica `dist` no GitHub Pages a cada push para `main` (ou manualmente em **Actions → Deploy to GitHub Pages → Run workflow**). Em **Settings → Pages**, selecione **GitHub Actions** como origem de publicação.

O build usa `/cambio-mz/` como base para o repositório `jrdimande/cambio-mz`, e o Vue Router usa navegação por hash para funcionar em páginas de projeto.

## Conversão

O conversor calcula estimativas a partir das taxas carregadas pela API (ou dos valores locais de demonstração, quando a API falha). A página **Tendências** apresenta séries históricas em gráficos de barras para períodos de 30 dias, 90 dias e um ano. Os dados históricos são taxas de referência diárias, não previsões nem cotações de transação.
