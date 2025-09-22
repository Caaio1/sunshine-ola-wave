
# Melhorias aplicadas
- Máscaras e validações (CNPJ, Telefone) em `src/lib/masks.ts` e integradas nos formulários de Hospital e Colaborador.
- Paginação e busca client-side padrão via `useClientTable` em `components/ui/data-table.tsx` e aplicado a principais listas.
- Gráficos (Recharts) na página `EstatisticasGeraisPage.tsx` com suporte a séries genéricas:
  - `series.categorias`: array de `{ label, value }` → BarChart
  - `series.timeline`: array de `{ data, valor }` → LineChart
