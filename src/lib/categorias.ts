// Importa a caixa de ícones (Ionicons)
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa um ajudante de "tipos" do React
import type { ComponentProps } from 'react';

// Tipo: "o nome de um ícone que EXISTE na caixa Ionicons" (o corretor avisa se o nome estiver errado)
export type NomeIcone = ComponentProps<typeof Ionicons>['name'];

// A ficha de uma categoria: nome, emoji (vai sair na V4) e ícone
type Categoria = { nome: string; emoji: string; icone: NomeIcone };

// Lista das categorias de GASTO (para onde o dinheiro sai)
export const CATEGORIAS_GASTO: Categoria[] = [
  // Comida, mercado, restaurante (ícone: lanche)
  { nome: 'Alimentação', emoji: '🍔', icone: 'fast-food-outline' },
  // Ônibus, Uber, gasolina (ícone: carro)
  { nome: 'Transporte', emoji: '🚗', icone: 'car-outline' },
  // Aluguel, condomínio (ícone: casa)
  { nome: 'Moradia', emoji: '🏠', icone: 'home-outline' },
  // Luz, água, internet (ícone: raio)
  { nome: 'Contas', emoji: '💡', icone: 'flash-outline' },
  // Farmácia, consultas (ícone: maleta de remédios)
  { nome: 'Saúde', emoji: '🏥', icone: 'medkit-outline' },
  // Cursos, livros (ícone: chapéu de formatura)
  { nome: 'Educação', emoji: '📚', icone: 'school-outline' },
  // Cinema, jogos (ícone: controle de videogame)
  { nome: 'Lazer', emoji: '🎮', icone: 'game-controller-outline' },
  // Roupas, eletrônicos (ícone: sacola)
  { nome: 'Compras', emoji: '🛍️', icone: 'bag-handle-outline' },
  // Qualquer outra coisa (ícone: três pontinhos)
  { nome: 'Outros', emoji: '📦', icone: 'ellipsis-horizontal' },
// Fecha a lista de gastos
];

// Lista das categorias de ENTRADA (de onde o dinheiro vem)
export const CATEGORIAS_ENTRADA: Categoria[] = [
  // Salário (ícone: maleta de trabalho)
  { nome: 'Salário', emoji: '💼', icone: 'briefcase-outline' },
  // Trabalhos extras (ícone: notebook)
  { nome: 'Freelance', emoji: '💻', icone: 'laptop-outline' },
  // Rendimentos (ícone: gráfico subindo)
  { nome: 'Investimentos', emoji: '📈', icone: 'trending-up-outline' },
  // Presentes (ícone: caixa de presente)
  { nome: 'Presente', emoji: '🎁', icone: 'gift-outline' },
  // Qualquer outra entrada (ícone: três pontinhos)
  { nome: 'Outros', emoji: '📦', icone: 'ellipsis-horizontal' },
// Fecha a lista de entradas
];