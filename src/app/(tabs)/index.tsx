// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória (useState) e o guardador de função (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o GPS (router) e o avisador de tela visível (useFocusEffect)
import { router, useFocusEffect } from 'expo-router';
// Importa o pincel de degradê (para o brilho do lingote)
import { LinearGradient } from 'expo-linear-gradient';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa o telefone do cofre
import { supabase } from '../../lib/supabase';
// Importa o cardápio de categorias e o tipo "nome de ícone"
import { CATEGORIAS_ENTRADA, CATEGORIAS_GASTO, type NomeIcone } from '../../lib/categorias';
// Importa o guarda-roupa: cores, letras e o degradê dourado
import { cores, degradeOuro, fontes } from '../../lib/tema';

// ============ PARTE 2: A FICHA E OS AJUDANTES ============
// A ficha de uma transação (igual às colunas da gaveta no cofre)
type Transacao = {
  // O RG da transação
  id: string;
  // Gasto ou entrada
  tipo: 'gasto' | 'entrada';
  // O valor em reais
  valor: number;
  // A categoria
  categoria: string;
  // A descrição (texto ou "nada")
  descricao: string | null;
  // A data no jeito do cofre: "2026-10-20"
  data: string;
// Fecha a ficha
};

// Nomes curtos dos meses (posição 0 é janeiro, porque o computador conta do zero)
const MESES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];

// Degradê coral: usado no lingote quando o saldo fica negativo
const degradeCoral = ['#FFB1A6', '#FF7B6B', '#B8432F'] as const;

// Ajudante 1: transforma número em dinheiro brasileiro (45.9 vira "R$ 45,90")
function formatarReais(valor: number) {
  // Usa o formatador do Brasil, no estilo moeda real
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Fecha
}

// Ajudante 2: transforma a data do cofre em "20 out"
function formatarData(data: string) {
  // Quebra a data nos tracinhos: ["2026", "10", "20"]
  const partes = data.split('-');
  // Junta o dia (sem o zero na frente) com o nome curto do mês (o -1 é porque a lista começa do zero)
  return Number(partes[2]) + ' ' + MESES[Number(partes[1]) - 1];
// Fecha
}

// Ajudante 3: acha o ícone da categoria de uma transação
function iconeDa(transacao: Transacao): NomeIcone {
  // Escolhe o cardápio certo
  const cardapio = transacao.tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_ENTRADA;
  // Procura a categoria com o mesmo nome
  const encontrada = cardapio.find((item) => item.nome === transacao.categoria);
  // Se achou, devolve o ícone dela. Se não, devolve os três pontinhos
  return encontrada ? encontrada.icone : 'ellipsis-horizontal';
// Fecha
}

// Ajudante 4: deixa a primeira letra maiúscula ("mercado" vira "Mercado")
function primeiraMaiuscula(texto: string) {
  // Pega a primeira letra, deixa maiúscula e junta com o resto
  return texto.charAt(0).toUpperCase() + texto.slice(1);
// Fecha
}

// ============ PARTE 3: MEMÓRIAS, BUSCA E CONTAS ============
// Cria a tela inicial
export default function TelaInicial() {
  // Post-it com a lista de transações do mês
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  // Post-it de "está buscando no cofre?"
  const [carregando, setCarregando] = useState(true);
  // Post-it do aviso de erro
  const [erro, setErro] = useState('');

  // Pega a data de hoje
  const hoje = new Date();
  // Monta o primeiro dia do mês no jeito do cofre: "2026-10-01"
  const primeiroDiaDoMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
  // Nome do mês por extenso: "outubro"
  const mesExtenso = hoje.toLocaleDateString('pt-BR', { month: 'long' });

  // Função que busca as transações do mês no cofre
  async function carregar() {
    // Liga a rodinha
    setCarregando(true);
    // Pede ao cofre: tudo da gaveta transacoes, deste mês, da mais nova para a mais antiga
    const { data, error } = await supabase
      // Na gaveta transacoes...
      .from('transacoes')
      // ...todas as colunas...
      .select('*')
      // ...com data maior ou igual ao primeiro dia do mês...
      .gte('data', primeiroDiaDoMes)
      // ...da data mais nova para a mais antiga...
      .order('data', { ascending: false })
      // ...e, no mesmo dia, da registrada por último para a primeira
      .order('criado_em', { ascending: false });
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setErro('Não foi possível carregar suas movimentações. Puxe a tela ou abra o app de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Apaga avisos antigos
    setErro('');
    // Guarda a lista
    setTransacoes(data ?? []);
  // Fecha a função carregar
  }

  // Toda vez que esta tela aparecer, busca de novo
  useFocusEffect(
    // Guarda a função para não ser recriada à toa
    useCallback(() => {
      // Busca as transações
      carregar();
    // Não depende de nada
    }, [])
  // Fecha o avisador
  );

  // Soma as entradas (o cofrinho que começa com zero)
  const totalEntradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((soma, t) => soma + Number(t.valor), 0);
  // Soma os gastos
  const totalGastos = transacoes.filter((t) => t.tipo === 'gasto').reduce((soma, t) => soma + Number(t.valor), 0);
  // O saldo: entradas menos gastos
  const saldo = totalEntradas - totalGastos;
  // O saldo está abaixo de zero? (decide a cor do lingote)
  const negativo = saldo < 0;
  // Cor das letras em cima do lingote: tinta coral se negativo, tinta dourada se positivo
  const tinta = negativo ? cores.coralTinta : cores.ouroTinta;

  // ============ PARTE 4: O DESENHO DA TELA ============
  // Devolve o que aparece na tela
  return (
    // Caixa que rola
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Linha de cima: nome do app e botão de sair */}
      <View style={estilos.topo}>
        {/* "Finance" em marfim e "Help" em ouro, na letra do painel da bolsa */}
        <Text style={estilos.marca}>Finance<Text style={{ color: cores.ouro }}>Help</Text></Text>
        {/* Botão de sair: um ícone. O accessibilityLabel é lido em voz alta por leitores de tela */}
        <Pressable style={estilos.botaoSair} onPress={() => supabase.auth.signOut()} hitSlop={12} accessibilityLabel="Sair da conta">
          {/* O ícone de "porta de saída" */}
          <Ionicons name="log-out-outline" size={20} color={cores.prata} />
        {/* Fecha o botão de sair */}
        </Pressable>
      {/* Fecha a linha de cima */}
      </View>

      {/* Saudação com o mês */}
      <Text style={estilos.saudacao}>Este é o seu {mesExtenso}.</Text>

      {/* O LINGOTE: degradê na diagonal ↘️, dourado se positivo e coral se negativo */}
      <LinearGradient colors={negativo ? degradeCoral : degradeOuro} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.lingote}>
        {/* O reflexo de luz: branco transparente na metade de cima, que faz parecer metal */}
        <LinearGradient colors={['rgba(255,255,255,0.35)', 'rgba(255,255,255,0)']} style={estilos.reflexo} />
        {/* Rótulo: muda quando o saldo fica negativo */}
        <Text style={[estilos.lingoteRotulo, { color: tinta }]}>{negativo ? 'Você gastou mais do que entrou' : `Saldo de ${mesExtenso}`}</Text>
        {/* O saldo, grande, na letra do painel da bolsa (com sinal de menos se negativo) */}
        <Text style={[estilos.lingoteSaldo, { color: tinta }]}>{(negativo ? '−' : '') + formatarReais(Math.abs(saldo))}</Text>
        {/* Linha de baixo do lingote: quanto entrou e quanto saiu */}
        <View style={[estilos.lingotePartes, { borderTopColor: tinta }]}>
          {/* Metade da esquerda: entradas */}
          <View style={{ flex: 1 }}>
            {/* Rótulo */}
            <Text style={[estilos.parteRotulo, { color: tinta }]}>Entrou</Text>
            {/* Valor */}
            <Text style={[estilos.parteValor, { color: tinta }]}>{formatarReais(totalEntradas)}</Text>
          {/* Fecha a metade da esquerda */}
          </View>
          {/* Metade da direita: gastos */}
          <View style={{ flex: 1 }}>
            {/* Rótulo */}
            <Text style={[estilos.parteRotulo, { color: tinta }]}>Saiu</Text>
            {/* Valor */}
            <Text style={[estilos.parteValor, { color: tinta }]}>{formatarReais(totalGastos)}</Text>
          {/* Fecha a metade da direita */}
          </View>
        {/* Fecha a linha de baixo */}
        </View>
      {/* Fecha o lingote */}
      </LinearGradient>

      {/* Botão de nova transação */}
      <Pressable style={estilos.botaoNovo} onPress={() => router.push('/nova-transacao')}>
        {/* Ícone de "mais" */}
        <Ionicons name="add" size={20} color={cores.ouro} />
        {/* Texto do botão */}
        <Text style={estilos.botaoNovoTexto}>Nova transação</Text>
      {/* Fecha o botão */}
      </Pressable>

      {/* Título da lista */}
      <Text style={estilos.secao}>Movimentações</Text>

      {/* Situação 1: buscando no cofre */}
      {carregando && <ActivityIndicator color={cores.ouro} style={{ marginTop: 16 }} />}

      {/* Situação 2: deu erro */}
      {erro !== '' && <Text style={estilos.erro}>{erro}</Text>}

      {/* Situação 3: lista vazia */}
      {!carregando && erro === '' && transacoes.length === 0 && (
        // Convite para registrar a primeira
        <Text style={estilos.vazio}>Nada registrado em {mesExtenso} ainda. Toque em Nova transação para anotar o primeiro gasto ou entrada.</Text>
      // Fecha a situação 3
      )}
      {/* Para cada transação, uma linha tocável (a forma de biscoito) */}
      {transacoes.map((t) => (
        // A linha: ao tocar, abre a edição levando o RG no bilhete
        <Pressable key={t.id} style={estilos.item} onPress={() => router.push({ pathname: '/nova-transacao', params: { id: t.id } })}>
          {/* Quadradinho com o ícone da categoria (dourado se for entrada, prata se for gasto) */}
          <View style={estilos.itemIcone}>
            {/* O ícone */}
            <Ionicons name={iconeDa(t)} size={20} color={t.tipo === 'entrada' ? cores.ouro : cores.prata} />
          {/* Fecha o quadradinho */}
          </View>
          {/* Caixa do meio: ocupa o espaço que sobrar */}
          <View style={{ flex: 1 }}>
            {/* Descrição (ou categoria), com a primeira letra maiúscula e cortada em 1 linha */}
            <Text style={estilos.itemTitulo} numberOfLines={1}>{primeiraMaiuscula(t.descricao || t.categoria)}</Text>
            {/* Categoria e data, em prata */}
            <Text style={estilos.itemDetalhe}>{t.descricao ? `${t.categoria}, ${formatarData(t.data)}` : formatarData(t.data)}</Text>          {/* Fecha a caixa do meio */}
          </View>
          {/* Valor: "−" e coral se gasto, "+" e dourado se entrada */}
          <Text style={[estilos.itemValor, { color: t.tipo === 'gasto' ? cores.coral : cores.ouro }]}>{(t.tipo === 'gasto' ? '−' : '+') + formatarReais(Number(t.valor))}</Text>
        {/* Fecha a linha */}
        </Pressable>
      // Fecha a forma de biscoito
      ))}
    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela inicial
}

// ============ PARTE 5: A ROUPA (ESTILOS) ============
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
    // Espaço extra em cima, por causa do relógio do celular
    paddingTop: 56,
    // Espaço extra embaixo
    paddingBottom: 48,
    // No computador, não passa de 560 de largura (fica com cara de celular)
    maxWidth: 560,
    // Ocupa a largura toda até esse limite
    width: '100%',
    // Fica centralizado
    alignSelf: 'center',
  // Fecha
  },
  // Linha de cima
  topo: {
    // Lado a lado
    flexDirection: 'row',
    // Nome na esquerda, botão na direita
    justifyContent: 'space-between',
    // Alinhados no meio
    alignItems: 'center',
  // Fecha
  },
  // O nome do app
  marca: {
    // Letra do painel da bolsa, bem grossa
    fontFamily: fontes.marca,
    // Tamanho
    fontSize: 28,
    // Cor marfim (o "Help" fica dourado)
    color: cores.marfim,
  // Fecha
  },
  // Botão de sair
  botaoSair: {
    // Largura
    width: 38,
    // Altura
    height: 38,
    // Redondo
    borderRadius: 19,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
    // Ícone no meio (na horizontal)
    alignItems: 'center',
    // Ícone no meio (na vertical)
    justifyContent: 'center',
  // Fecha
  },
  // Saudação
  saudacao: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 18,
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // O lingote
  lingote: {
    // Pontas arredondadas
    borderRadius: 22,
    // Espaço interno
    padding: 20,
    // Corta o reflexo nas pontas arredondadas
    overflow: 'hidden',
  // Fecha
  },
  // O reflexo de luz
  reflexo: {
    // Posição livre, por cima do lingote
    position: 'absolute',
    // Colado em cima
    top: 0,
    // Colado na esquerda
    left: 0,
    // Colado na direita
    right: 0,
    // Só a metade de cima
    height: '55%',
  // Fecha
  },
  // Rótulo do lingote
  lingoteRotulo: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 14,
    // Um pouco transparente
    opacity: 0.85,
  // Fecha
  },
  // O saldo grande
  lingoteSaldo: {
    // Letra do painel da bolsa, bem grossa
    fontFamily: fontes.marca,
    // Bem grande
    fontSize: 52,
    // Espaço acima
    marginTop: 2,
    // Espaço abaixo
    marginBottom: 14,
  // Fecha
  },
  // Linha de baixo do lingote
  lingotePartes: {
    // Lado a lado
    flexDirection: 'row',
    // Linha fina em cima, separando do saldo
    borderTopWidth: StyleSheet.hairlineWidth,
    // Espaço acima
    paddingTop: 12,
  // Fecha
  },
  // Rótulo "Entrou" / "Saiu"
  parteRotulo: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Pequena
    fontSize: 12,
    // Um pouco transparente
    opacity: 0.75,
  // Fecha
  },
  // Valor de "Entrou" / "Saiu"
  parteValor: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
    // Espaço acima
    marginTop: 2,
  // Fecha
  },
  // Botão de nova transação
  botaoNovo: {
    // Ícone e texto lado a lado
    flexDirection: 'row',
    // Centralizados
    justifyContent: 'center',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre o ícone e o texto
    gap: 8,
    // Espaço acima
    marginTop: 14,
    // Espaço interno
    paddingVertical: 15,
    // Pontas arredondadas
    borderRadius: 14,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
  // Fecha
  },
  // Texto do botão de nova transação
  botaoNovoTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
    // Dourado
    color: cores.ouro,
  // Fecha
  },
  // Título "Movimentações"
  secao: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 24,
    // Marfim
    color: cores.marfim,
    // Espaço acima
    marginTop: 28,
    // Espaço abaixo
    marginBottom: 4,
  // Fecha
  },
  // Aviso de erro
  erro: {
    // Letra simples
    fontFamily: fontes.texto,
    // Coral
    color: cores.coral,
    // Espaço acima
    marginTop: 16,
  // Fecha
  },
  // Convite de lista vazia
  vazio: {
    // Letra simples
    fontFamily: fontes.texto,
    // Prata
    color: cores.prata,
    // Tamanho
    fontSize: 15,
    // Espaço entre linhas
    lineHeight: 22,
    // Espaço acima
    marginTop: 16,
  // Fecha
  },
  // Cada linha da lista
  item: {
    // Lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre o ícone, o texto e o valor
    gap: 12,
    // Espaço em cima e embaixo
    paddingVertical: 12,
    // Linha fina embaixo
    borderBottomWidth: 1,
    // Cor da linha fina
    borderBottomColor: cores.grafite,
  // Fecha
  },
  // Quadradinho do ícone
  itemIcone: {
    // Largura
    width: 42,
    // Altura
    height: 42,
    // Pontas arredondadas
    borderRadius: 12,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Ícone no meio (horizontal)
    alignItems: 'center',
    // Ícone no meio (vertical)
    justifyContent: 'center',
  // Fecha
  },
  // Descrição da linha
  itemTitulo: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 16,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Categoria e data
  itemDetalhe: {
    // Letra simples
    fontFamily: fontes.texto,
    // Pequena
    fontSize: 13,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 2,
  // Fecha
  },
  // Valor da linha
  itemValor: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
  // Fecha
  },
// Fecha os estilos
});