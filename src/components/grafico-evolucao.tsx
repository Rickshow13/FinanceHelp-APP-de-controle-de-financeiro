// ============ AS FERRAMENTAS ============
// Importa a memória (useState) e o guardador de função (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { Pressable, StyleSheet, Text, View } from 'react-native';
// Importa o avisador de tela visível
import { useFocusEffect } from 'expo-router';
// Importa o telefone do cofre (o @/ é o atalho para a pasta src)
import { supabase } from '@/lib/supabase';
// Importa o guarda-roupa
import { cores, fontes } from '@/lib/tema';

// A ficha de uma transação (só o que o gráfico usa)
type Transacao = { tipo: 'gasto' | 'entrada'; valor: number; data: string };

// Nomes curtos dos meses (posição 0 é janeiro)
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
// A altura máxima das barras
const ALTURA = 140;

// Ajudante 1: transforma número em dinheiro brasileiro
function formatarReais(valor: number) {
  // Usa o formatador do Brasil, no estilo moeda real
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Fecha
}

// Ajudante 2: calcula a altura de uma barra (com altura mínima de 3 para valores pequenos)
function alturaDaBarra(valor: number, maximo: number) {
  // Se o valor for zero, a barra não aparece
  if (valor === 0) return 0;
  // Se não, a altura é proporcional ao máximo, mas nunca menor que 3
  return Math.max(3, (valor / maximo) * ALTURA);
// Fecha
}

// Cria a peça do gráfico de evolução
export default function GraficoEvolucao() {
  // Post-it com as transações dos últimos 6 meses
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  // Post-it de qual coluna está escolhida (de 0 a 5). Começa na 5, que é o mês atual
  const [escolhido, setEscolhido] = useState(5);

  // ============ PARTE 1: OS 6 MESES ============
  // Pega a data de hoje
  const hoje = new Date();
  // Lista que vai guardar os 6 meses
  const meses: { chave: string; curto: string; longo: string }[] = [];
  // Repete 6 vezes: de 5 meses atrás (i = 5) até este mês (i = 0)
  for (let i = 5; i >= 0; i--) {
    // O primeiro dia daquele mês
    const dia = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
    // O nome longo, com só a primeira letra maiúscula: "Outubro de 2026"
    const longo = dia.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    // Adiciona o mês na lista
    meses.push({
      // O "nome da página" do caderno: "2026-10"
      chave: `${dia.getFullYear()}-${String(dia.getMonth() + 1).padStart(2, '0')}`,
      // O nome curto: "out"
      curto: MESES[dia.getMonth()],
      // O nome longo com a primeira letra maiúscula
      longo: longo.charAt(0).toUpperCase() + longo.slice(1),
    // Fecha o mês
    });
  // Fecha a repetição
  }

  // ============ PARTE 2: A BUSCA ============
  // Função que busca as transações dos últimos 6 meses
  async function carregar() {
    // Pede ao cofre: tipo, valor e data de tudo desde o primeiro dia do mês mais antigo da lista
    const { data } = await supabase.from('transacoes').select('tipo, valor, data').gte('data', `${meses[0].chave}-01`);
    // Guarda a lista (se vier "nada", uma lista vazia)
    setTransacoes(data ?? []);
  // Fecha a função carregar
  }

  // Toda vez que a tela aparecer, busca de novo
  useFocusEffect(
    // Guarda a função
    useCallback(() => {
      // Busca as transações
      carregar();
    // Não depende de nada
    }, [])
  // Fecha o avisador
  );

  // ============ PARTE 3: AS CONTAS ============
  // O caderno: uma página para cada mês, com quanto entrou e quanto saiu
  const totais: Record<string, { entrou: number; saiu: number }> = {};
  // Passa por cada transação...
  for (const t of transacoes) {
    // ...pega o "nome da página" do mês: "2026-10-20" vira "2026-10"
    const chave = t.data.slice(0, 7);
    // ...se a página ainda não existe, cria ela zerada
    if (!totais[chave]) totais[chave] = { entrou: 0, saiu: 0 };
    // ...se for entrada, soma em "entrou"
    if (t.tipo === 'entrada') totais[chave].entrou += Number(t.valor);
    // ...se for gasto, soma em "saiu"
    else totais[chave].saiu += Number(t.valor);
  // Fecha o "passa por cada"
  }
  // Junta cada mês com os seus totais (se o mês não tiver página, fica zerado)
  const colunas = meses.map((mes) => ({ ...mes, entrou: totais[mes.chave]?.entrou ?? 0, saiu: totais[mes.chave]?.saiu ?? 0 }));
  // O maior valor do gráfico inteiro (nunca menor que 1, para não dividir por zero)
  const maximo = Math.max(1, ...colunas.map((c) => Math.max(c.entrou, c.saiu)));
  // A coluna escolhida (para mostrar os números embaixo)
  const atual = colunas[escolhido];
  // Quanto sobrou no mês escolhido
  const sobrou = atual.entrou - atual.saiu;

  // ============ PARTE 4 e 5: O DESENHO ============
  // Devolve o desenho
  return (
    // A caixa do gráfico inteiro
    <View style={estilos.caixa}>

      {/* Título do gráfico */}
      <Text style={estilos.titulo}>Entrou e saiu nos últimos 6 meses</Text>

      {/* A legenda: bolinha + nome de cada cor */}
      <View style={estilos.legenda}>
        {/* Item da legenda: entrou */}
        <View style={estilos.legendaItem}>
          {/* Bolinha dourada */}
          <View style={[estilos.bolinha, { backgroundColor: cores.ouro }]} />
          {/* Nome */}
          <Text style={estilos.legendaTexto}>Entrou</Text>
        {/* Fecha o item */}
        </View>
        {/* Item da legenda: saiu */}
        <View style={estilos.legendaItem}>
          {/* Bolinha coral */}
          <View style={[estilos.bolinha, { backgroundColor: cores.coral }]} />
          {/* Nome */}
          <Text style={estilos.legendaTexto}>Saiu</Text>
        {/* Fecha o item */}
        </View>
      {/* Fecha a legenda */}
      </View>

      {/* As 6 colunas, lado a lado */}
      <View style={estilos.colunas}>
        {/* Para cada mês, uma coluna tocável (o "i" é a posição dela: 0 a 5) */}
        {colunas.map((coluna, i) => (
          // A coluna: ao tocar, vira a escolhida. O leitor de tela lê os números
          <Pressable key={coluna.chave} style={[estilos.coluna, escolhido === i && estilos.colunaEscolhida]} onPress={() => setEscolhido(i)} accessibilityLabel={`${coluna.longo}: entrou ${formatarReais(coluna.entrou)}, saiu ${formatarReais(coluna.saiu)}`}>
            {/* A área das barras, com a linha do chão embaixo */}
            <View style={estilos.areaBarras}>
              {/* Barra dourada (entrou), com altura proporcional */}
              <View style={[estilos.barra, { height: alturaDaBarra(coluna.entrou, maximo), backgroundColor: cores.ouro }]} />
              {/* Barra coral (saiu), com altura proporcional */}
              <View style={[estilos.barra, { height: alturaDaBarra(coluna.saiu, maximo), backgroundColor: cores.coral }]} />
            {/* Fecha a área das barras */}
            </View>
            {/* O nome curto do mês (marfim se escolhido, prata se não) */}
            <Text style={[estilos.mes, escolhido === i && { color: cores.marfim }]}>{coluna.curto}</Text>
          {/* Fecha a coluna */}
          </Pressable>
        // Fecha a forma de biscoito
        ))}
      {/* Fecha as colunas */}
      </View>

      {/* Os números do mês escolhido */}
      <Text style={estilos.detalheTitulo}>{atual.longo}</Text>
      {/* Linha com os 3 números lado a lado */}
      <View style={estilos.detalhes}>
        {/* Quanto entrou */}
        <View style={estilos.detalhe}>
          {/* Rótulo */}
          <Text style={estilos.detalheRotulo}>Entrou</Text>
          {/* Valor */}
          <Text style={estilos.detalheValor}>{formatarReais(atual.entrou)}</Text>
        {/* Fecha */}
        </View>
        {/* Quanto saiu */}
        <View style={estilos.detalhe}>
          {/* Rótulo */}
          <Text style={estilos.detalheRotulo}>Saiu</Text>
          {/* Valor */}
          <Text style={estilos.detalheValor}>{formatarReais(atual.saiu)}</Text>
        {/* Fecha */}
        </View>
        {/* Quanto sobrou (ou faltou, se for negativo) */}
        <View style={estilos.detalhe}>
          {/* Rótulo: "Sobrou" ou "Faltou" */}
          <Text style={estilos.detalheRotulo}>{sobrou < 0 ? 'Faltou' : 'Sobrou'}</Text>
          {/* Valor (sempre positivo, porque a palavra já diz se sobrou ou faltou) */}
          <Text style={estilos.detalheValor}>{formatarReais(Math.abs(sobrou))}</Text>
        {/* Fecha */}
        </View>
      {/* Fecha a linha dos 3 números */}
      </View>

    {/* Fecha a caixa do gráfico */}
    </View>
  // Fecha o return
  );
// Fecha a peça
}

// ============ A ROUPA (ESTILOS) ============
const estilos = StyleSheet.create({
  // A caixa do gráfico inteiro
  caixa: {
    // Espaço acima, para afastar do ranking
    marginTop: 36,
  // Fecha
  },
  // Título do gráfico
  titulo: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 22,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // A legenda
  legenda: {
    // Itens lado a lado
    flexDirection: 'row',
    // Espaço entre os itens
    gap: 16,
    // Espaço acima
    marginTop: 8,
    // Espaço abaixo
    marginBottom: 16,
  // Fecha
  },
  // Cada item da legenda
  legendaItem: {
    // Bolinha e nome lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre a bolinha e o nome
    gap: 6,
  // Fecha
  },
  // A bolinha da legenda
  bolinha: {
    // Largura
    width: 10,
    // Altura
    height: 10,
    // Redonda
    borderRadius: 5,
  // Fecha
  },
  // Nome na legenda
  legendaTexto: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Pequena
    fontSize: 13,
    // Prata (o texto fica em cor de texto, a bolinha é que tem a cor)
    color: cores.prata,
  // Fecha
  },
  // A linha das 6 colunas
  colunas: {
    // Lado a lado
    flexDirection: 'row',
    // Espaço entre as colunas
    gap: 4,
  // Fecha
  },
  // Cada coluna
  coluna: {
    // As 6 dividem o espaço igualmente
    flex: 1,
    // Conteúdo centralizado
    alignItems: 'center',
    // Espaço em cima
    paddingTop: 8,
    // Espaço embaixo
    paddingBottom: 8,
    // Pontas arredondadas (aparecem quando está escolhida)
    borderRadius: 10,
  // Fecha
  },
  // A coluna escolhida
  colunaEscolhida: {
    // Fundo grafite
    backgroundColor: cores.grafite,
  // Fecha
  },
  // A área das barras
  areaBarras: {
    // Altura fixa (a altura máxima das barras)
    height: ALTURA,
    // Barras lado a lado
    flexDirection: 'row',
    // As barras "nascem" do chão e crescem para cima
    alignItems: 'flex-end',
    // Espaço entre as duas barras
    gap: 3,
    // A linha do chão
    borderBottomWidth: 1,
    // Cor da linha do chão
    borderBottomColor: cores.grafiteBorda,
    // Ocupa a largura toda da coluna (para a linha do chão ficar contínua)
    alignSelf: 'stretch',
    // Barras no meio da coluna
    justifyContent: 'center',
  // Fecha
  },
  // Cada barra
  barra: {
    // Largura fina
    width: 10,
    // Ponta de cima arredondada (esquerda)
    borderTopLeftRadius: 4,
    // Ponta de cima arredondada (direita)
    borderTopRightRadius: 4,
  // Fecha
  },
  // Nome curto do mês
  mes: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Pequena
    fontSize: 12,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 6,
  // Fecha
  },
  // Nome do mês escolhido
  detalheTitulo: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 15,
    // Marfim
    color: cores.marfim,
    // Espaço acima
    marginTop: 16,
    // Espaço abaixo
    marginBottom: 8,
  // Fecha
  },
  // Linha dos 3 números
  detalhes: {
    // Lado a lado
    flexDirection: 'row',
  // Fecha
  },
  // Cada número
  detalhe: {
    // Os 3 dividem o espaço igualmente
    flex: 1,
  // Fecha
  },
  // Rótulo do número
  detalheRotulo: {
    // Letra simples
    fontFamily: fontes.texto,
    // Pequena
    fontSize: 12,
    // Prata
    color: cores.prata,
  // Fecha
  },
  // O número
  detalheValor: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 15,
    // Marfim
    color: cores.marfim,
    // Espaço acima
    marginTop: 2,
  // Fecha
  },
// Fecha os estilos
});