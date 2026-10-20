// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória (useState) e o guardador de função (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o avisador de tela visível
import { useFocusEffect } from 'expo-router';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa o telefone do cofre
import { supabase } from '../../lib/supabase';
// Importa o cardápio de gastos e o tipo "nome de ícone"
import { CATEGORIAS_GASTO, type NomeIcone } from '../../lib/categorias';
// Importa o guarda-roupa
import { cores, fontes } from '../../lib/tema';

// ============ PARTE 2: A FICHA E OS AJUDANTES ============
// A ficha de um gasto (só as 2 informações que o gráfico usa)
type Gasto = { categoria: string; valor: number };

// Ajudante 1: transforma número em dinheiro brasileiro
function formatarReais(valor: number) {
  // Usa o formatador do Brasil, no estilo moeda real
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Fecha
}

// Ajudante 2: acha o ícone de uma categoria pelo nome
function iconeDaCategoria(nome: string): NomeIcone {
  // Procura no cardápio de gastos a categoria com esse nome
  const encontrada = CATEGORIAS_GASTO.find((item) => item.nome === nome);
  // Se achou, devolve o ícone. Se não, os três pontinhos
  return encontrada ? encontrada.icone : 'ellipsis-horizontal';
// Fecha
}

// Ajudante 3: transforma uma data no formato do cofre ("2026-10-01")
function paraTextoDoCofre(data: Date) {
  // Pega o ano
  const ano = data.getFullYear();
  // Pega o mês (+1 porque janeiro é 0) e coloca zero na frente se precisar
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  // Pega o dia e coloca zero na frente se precisar
  const dia = String(data.getDate()).padStart(2, '0');
  // Junta tudo com tracinhos
  return `${ano}-${mes}-${dia}`;
// Fecha
}

// ============ PARTE 3: AS MEMÓRIAS E A BUSCA ============
// Cria a tela dos gráficos
export default function TelaGraficos() {
  // Post-it de qual mês estamos vendo: 0 = este mês, -1 = mês passado, -2 = retrasado...
  const [deslocamento, setDeslocamento] = useState(0);
  // Post-it com a lista de gastos do mês
  const [gastos, setGastos] = useState<Gasto[]>([]);
  // Post-it de "está buscando no cofre?"
  const [carregando, setCarregando] = useState(true);
  // Post-it do aviso de erro
  const [erro, setErro] = useState('');

  // Pega a data de hoje
  const hoje = new Date();
  // Primeiro dia do mês que estamos vendo
  const inicio = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento, 1);
  // Primeiro dia do mês SEGUINTE (o JavaScript pula o ano sozinho se passar de dezembro)
  const fim = new Date(hoje.getFullYear(), hoje.getMonth() + deslocamento + 1, 1);
  // Nome do mês por extenso: "outubro de 2026"
  const nomeExtenso = inicio.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  // Deixa maiúscula SÓ a primeira letra da frase: "Outubro de 2026"
  const nomeDoMes = nomeExtenso.charAt(0).toUpperCase() + nomeExtenso.slice(1);  // Nome curto, só o mês: "outubro"
  const soOMes = inicio.toLocaleDateString('pt-BR', { month: 'long' });

  // Função que busca os gastos do mês no cofre
  async function carregar() {
    // Liga a rodinha
    setCarregando(true);
    // Pede ao cofre...
    const { data, error } = await supabase
      // ...na gaveta transacoes...
      .from('transacoes')
      // ...SÓ as colunas categoria e valor (mais rápido!)...
      .select('categoria, valor')
      // ...só os gastos...
      .eq('tipo', 'gasto')
      // ...com data maior ou igual ao primeiro dia do mês...
      .gte('data', paraTextoDoCofre(inicio))
      // ...e menor que (lt) o primeiro dia do mês seguinte
      .lt('data', paraTextoDoCofre(fim));
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setErro('Não foi possível carregar seus gastos. Confira sua internet e tente de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Apaga avisos antigos
    setErro('');
    // Guarda a lista
    setGastos(data ?? []);
  // Fecha a função carregar
  }

  // Toda vez que a tela aparecer OU o mês mudar, busca de novo
  useFocusEffect(
    // Guarda a função
    useCallback(() => {
      // Busca os gastos
      carregar();
    // Depende do deslocamento: mudou o mês, busca de novo
    }, [deslocamento])
  // Fecha o avisador
  );

  // ============ PARTE 4: AS CONTAS ============
  // O "caderno": uma página para cada categoria, com o total gasto nela
  const totais: Record<string, number> = {};
  // Passa por cada gasto da lista...
  for (const gasto of gastos) {
    // ...e soma o valor na página da categoria (se a página está em branco, começa do zero)
    totais[gasto.categoria] = (totais[gasto.categoria] ?? 0) + Number(gasto.valor);
  // Fecha o "passa por cada"
  }
  // Transforma o caderno numa lista e ordena do maior para o menor
  const ranking = Object.entries(totais)
    // Cada página vira uma fichinha { categoria, total }
    .map(([categoria, total]) => ({ categoria, total }))
    // Ordena: quem tem o total maior vai na frente
    .sort((a, b) => b.total - a.total);
  // O total gasto no mês (soma de todas as categorias)
  const totalGasto = ranking.reduce((soma, item) => soma + item.total, 0);
  // A categoria campeã (a primeira do ranking), se existir
  const maior = ranking[0];
  // A porcentagem da campeã (arredondada)
  const porcentagemMaior = maior ? Math.round((maior.total / totalGasto) * 100) : 0;

  // ============ PARTE 5: O DESENHO DA TELA ============
  // Devolve o que aparece na tela
  return (
    // Caixa que rola
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Título da tela */}
      <Text style={estilos.titulo}>Para onde foi seu dinheiro</Text>

      {/* Seletor de mês: ‹ outubro de 2026 › */}
      <View style={estilos.seletorMes}>
        {/* Seta para o mês anterior (diminui 1 no deslocamento) */}
        <Pressable style={estilos.seta} onPress={() => setDeslocamento(deslocamento - 1)} hitSlop={8} accessibilityLabel="Mês anterior">
          {/* Ícone da seta para a esquerda */}
          <Ionicons name="chevron-back" size={20} color={cores.marfim} />
        {/* Fecha a seta */}
        </Pressable>
        {/* O nome do mês */}
        <Text style={estilos.nomeMes}>{nomeDoMes}</Text>
        {/* Seta para o mês seguinte: travada se já estiver no mês atual (não existe futuro!) */}
        <Pressable style={[estilos.seta, deslocamento === 0 && { opacity: 0.3 }]} onPress={() => setDeslocamento(deslocamento + 1)} disabled={deslocamento === 0} hitSlop={8} accessibilityLabel="Próximo mês">
          {/* Ícone da seta para a direita */}
          <Ionicons name="chevron-forward" size={20} color={cores.marfim} />
        {/* Fecha a seta */}
        </Pressable>
      {/* Fecha o seletor de mês */}
      </View>

      {/* Situação 1: buscando no cofre */}
      {carregando && <ActivityIndicator color={cores.ouro} style={{ marginTop: 32 }} />}

      {/* Situação 2: deu erro */}
      {!carregando && erro !== '' && <Text style={estilos.aviso}>{erro}</Text>}

      {/* Situação 3: nenhum gasto no mês */}
      {!carregando && erro === '' && ranking.length === 0 && (
        // O convite
        <Text style={estilos.aviso}>Nenhum gasto em {soOMes}. Quando você registrar gastos, eles aparecem aqui separados por categoria.</Text>
      // Fecha a situação 3
      )}

      {/* Situação 4: tem gastos! Mostra o resumo e as barras */}
      {!carregando && erro === '' && maior && (
        // Caixa com tudo
        <View>
          {/* Rótulo do total */}
          <Text style={estilos.rotulo}>Total gasto em {soOMes}</Text>
          {/* O total, grande, na letra do painel da bolsa */}
          <Text style={estilos.total}>{formatarReais(totalGasto)}</Text>
          {/* A resposta em uma frase */}
          <Text style={estilos.resumo}>A maior parte foi para <Text style={estilos.resumoDestaque}>{maior.categoria}</Text>: {porcentagemMaior}% dos seus gastos.</Text>

          {/* Para cada categoria do ranking, uma barra (a forma de biscoito) */}
          {ranking.map((item) => {
            // Calcula a porcentagem desta categoria (arredondada)
            const porcentagem = Math.round((item.total / totalGasto) * 100);
            // Devolve a linha desta categoria
            return (
              // A linha inteira
              <View key={item.categoria} style={estilos.linha}>
                {/* Linha de cima: ícone, nome e valor */}
                <View style={estilos.linhaTopo}>
                  {/* Quadradinho com o ícone */}
                  <View style={estilos.icone}>
                    {/* O ícone da categoria */}
                    <Ionicons name={iconeDaCategoria(item.categoria)} size={18} color={cores.prata} />
                  {/* Fecha o quadradinho */}
                  </View>
                  {/* O nome da categoria (ocupa o espaço que sobrar) */}
                  <Text style={estilos.nomeCategoria}>{item.categoria}</Text>
                  {/* O valor gasto nela */}
                  <Text style={estilos.valorCategoria}>{formatarReais(item.total)}</Text>
                {/* Fecha a linha de cima */}
                </View>
                {/* Linha de baixo: a barra e a porcentagem */}
                <View style={estilos.linhaBarra}>
                  {/* O trilho (caixa grafite, sempre 100%) */}
                  <View style={estilos.trilho}>
                    {/* A barra coral, com largura igual à porcentagem */}
                    <View style={[estilos.barra, { width: `${porcentagem}%` }]} />
                  {/* Fecha o trilho */}
                  </View>
                  {/* A porcentagem escrita */}
                  <Text style={estilos.porcentagem}>{porcentagem}%</Text>
                {/* Fecha a linha de baixo */}
                </View>
              {/* Fecha a linha inteira */}
              </View>
            // Fecha o return desta linha
            );
          // Fecha a forma de biscoito
          })}
        {/* Fecha a caixa com tudo */}
        </View>
      // Fecha a situação 4
      )}

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela
}

// ============ PARTE 6: A ROUPA (ESTILOS) ============
const estilos = StyleSheet.create({
  // A tela inteira
  tela: {
    // Ocupa tudo
    flex: 1,
    // Fundo preto ônix
    backgroundColor: cores.onix,
  // Fecha
  },
  // O conteúdo de dentro
  conteudo: {
    // Espaço nas bordas
    padding: 20,
    // Espaço extra em cima
    paddingTop: 56,
    // Espaço extra embaixo
    paddingBottom: 40,
    // No computador, não passa de 560 de largura
    maxWidth: 560,
    // Ocupa a largura toda até o limite
    width: '100%',
    // Centralizado
    alignSelf: 'center',
  // Fecha
  },
  // Título da tela
  titulo: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 32,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Seletor de mês
  seletorMes: {
    // Lado a lado
    flexDirection: 'row',
    // Setas nas pontas, mês no meio
    justifyContent: 'space-between',
    // Alinhados no meio
    alignItems: 'center',
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Pontas arredondadas
    borderRadius: 14,
    // Espacinho interno
    padding: 6,
    // Espaço acima
    marginTop: 16,
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Cada seta
  seta: {
    // Largura
    width: 38,
    // Altura
    height: 38,
    // Ícone no meio (horizontal)
    alignItems: 'center',
    // Ícone no meio (vertical)
    justifyContent: 'center',
  // Fecha
  },
  // Nome do mês
  nomeMes: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 15,
    // Marfim
    color: cores.marfim,
   
  // Fecha
  },
  // Avisos (erro ou lista vazia)
  aviso: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Espaço entre linhas
    lineHeight: 22,
  // Fecha
  },
  // Rótulo do total
  rotulo: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Pequena
    fontSize: 13,
    // Prata
    color: cores.prata,
  // Fecha
  },
  // O total gasto
  total: {
    // Letra do painel da bolsa, bem grossa
    fontFamily: fontes.marca,
    // Grande
    fontSize: 52,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // A frase de resumo
  resumo: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 16,
    // Prata
    color: cores.prata,
    // Espaço entre linhas
    lineHeight: 23,
    // Espaço abaixo, para afastar das barras
    marginBottom: 24,
  // Fecha
  },
  // O nome da categoria campeã, dentro da frase
  resumoDestaque: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Cada linha do ranking
  linha: {
    // Espaço abaixo, entre uma categoria e outra
    marginBottom: 18,
  // Fecha
  },
  // Linha de cima (ícone, nome, valor)
  linhaTopo: {
    // Lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre eles
    gap: 10,
    // Espaço abaixo, para afastar da barra
    marginBottom: 8,
  // Fecha
  },
  // Quadradinho do ícone
  icone: {
    // Largura
    width: 32,
    // Altura
    height: 32,
    // Pontas arredondadas
    borderRadius: 10,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Ícone no meio (horizontal)
    alignItems: 'center',
    // Ícone no meio (vertical)
    justifyContent: 'center',
  // Fecha
  },
  // Nome da categoria
  nomeCategoria: {
    // Ocupa o espaço que sobrar (empurra o valor para a direita)
    flex: 1,
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 15,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Valor da categoria
  valorCategoria: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 15,
    // Marfim (o número fica em cor de texto, NÃO em coral)
    color: cores.marfim,
  // Fecha
  },
  // Linha de baixo (barra + porcentagem)
  linhaBarra: {
    // Lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre a barra e a porcentagem
    gap: 10,
    // Alinha a barra com o nome (pula o espaço do ícone)
    paddingLeft: 42,
  // Fecha
  },
  // O trilho
  trilho: {
    // Ocupa o espaço que sobrar
    flex: 1,
    // Altura da barra
    height: 10,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Pontas arredondadas
    borderRadius: 5,
    // Corta a barra nas pontas arredondadas
    overflow: 'hidden',
  // Fecha
  },
  // A barra coral
  barra: {
    // Ocupa a altura toda do trilho
    height: '100%',
    // Coral (a cor dos gastos)
    backgroundColor: cores.coral,
    // Pontas arredondadas
    borderRadius: 5,
  // Fecha
  },
  // A porcentagem escrita
  porcentagem: {
    // Largura fixa, para todas as porcentagens ficarem alinhadas
    width: 40,
    // Alinhada à direita
    textAlign: 'right',
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Tamanho
    fontSize: 13,
    // Prata
    color: cores.prata,
  // Fecha
  },
// Fecha os estilos
});