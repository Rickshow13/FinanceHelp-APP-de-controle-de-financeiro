// Importa a caixa de ícones (Ionicons)
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa um ajudante de "tipos" do React
import type { ComponentProps } from 'react';

// Tipo: "o nome de um ícone que EXISTE na caixa Ionicons" (o corretor avisa se o nome estiver errado)
export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

// A ficha de uma categoria: nome e ícone
type Categoria = { nome: string; icone: NomeIcone };

// Lista das categorias de GASTO (para onde o dinheiro sai)
export const CATEGORIAS_GASTO: Categoria[] = [
  // Comida, mercado, restaurante (ícone: lanche)
  { nome: 'Alimentação', icone: 'fast-food-outline' },
  // Ônibus, Uber, gasolina (ícone: carro)
  { nome: 'Transporte', icone: 'car-outline' },
  // Aluguel, condomínio (ícone: casa)
  { nome: 'Moradia', icone: 'home-outline' },
  // Luz, água, internet (ícone: raio)
  { nome: 'Contas', icone: 'flash-outline' },
  // Farmácia, consultas (ícone: maleta de remédios)
  { nome: 'Saúde', icone: 'medkit-outline' },
  // Cursos, livros (ícone: chapéu de formatura)
  { nome: 'Educação', icone: 'school-outline' },
  // Cinema, jogos (ícone: controle de videogame)
  { nome: 'Lazer', icone: 'game-controller-outline' },
  // Roupas, eletrônicos (ícone: sacola)
  { nome: 'Compras', icone: 'bag-handle-outline' },
  // Qualquer outra coisa (ícone: três pontinhos)
  { nome: 'Outros', icone: 'ellipsis-horizontal' },
// Fecha a lista de gastos
];

// Lista das categorias de ENTRADA (de onde o dinheiro vem)
export const CATEGORIAS_ENTRADA: Categoria[] = [
  // Salário (ícone: maleta de trabalho)
  { nome: 'Salário', icone: 'briefcase-outline' },
  // Trabalhos extras (ícone: notebook)
  { nome: 'Freelance', icone: 'laptop-outline' },
  // Rendimentos (ícone: gráfico subindo)
  { nome: 'Investimentos', icone: 'trending-up-outline' },
  // Presentes (ícone: caixa de presente)
  { nome: 'Presente', icone: 'gift-outline' },
  // Qualquer outra entrada (ícone: três pontinhos)
  { nome: 'Outros', icone: 'ellipsis-horizontal' },
// Fecha a lista de entradas
];