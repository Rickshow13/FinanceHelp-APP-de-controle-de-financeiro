// Importa a memória (useState) e o "guardador de função" (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o GPS (router) e o "avisador de tela visível" (useFocusEffect)
import { router, useFocusEffect } from 'expo-router';
// Importa o telefone do cofre
import { supabase } from '../../lib/supabase';
// Importa o cardápio de categorias (para achar o emoji de cada transação)
import { CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '../../lib/categorias';

// A "ficha" de uma transação: descreve as informações que cada uma tem (igual às colunas da gaveta)
type Transacao = {
  // O RG da transação
  id: string;
  // Se é gasto ou entrada
  tipo: 'gasto' | 'entrada';
  // O valor em reais
  valor: number;
  // A categoria
  categoria: string;
  // A descrição (pode ser texto ou "nada", que é o null)
  descricao: string | null;
  // A data, no jeito do cofre: "2026-10-20"
  data: string;
// Fecha a ficha
};

// Ajudante 1: transforma um número em dinheiro brasileiro (45.9 vira "R$ 45,90")
function formatarReais(valor: number) {
  // Usa o formatador do Brasil, no estilo moeda real
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Fecha
}

// Ajudante 2: transforma a data do cofre no jeito brasileiro ("2026-10-20" vira "20/10")
function formatarData(data: string) {
  // Quebra a data nos tracinhos: ["2026", "10", "20"]
  const partes = data.split('-');
  // Junta o dia (pedaço 2) e o mês (pedaço 1) com uma barra
  return partes[2] + '/' + partes[1];
// Fecha
}

// Ajudante 3: acha o emoji da categoria de uma transação
function emojiDa(transacao: Transacao) {
  // Escolhe o cardápio certo: de gasto ou de entrada
  const cardapio = transacao.tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_ENTRADA;
  // Procura no cardápio a categoria com o mesmo nome
  const encontrada = cardapio.find((item) => item.nome === transacao.categoria);
  // Se achou, devolve o emoji dela. Se não achou, devolve a caixinha 📦
  return encontrada ? encontrada.emoji : '📦';
// Fecha
}

// Cria a tela inicial
export default function TelaInicial() {
  // Post-it com a lista de transações do mês. Começa vazia ([] é uma lista sem nada)
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  // Post-it de "está buscando no cofre?". Começa com sim
  const [carregando, setCarregando] = useState(true);
  // Post-it do aviso de erro. Começa vazio
  const [erro, setErro] = useState('');

  // Pega a data de hoje
  const hoje = new Date();
  // Monta o primeiro dia do mês no jeito do cofre: "2026-10-01" (o +1 é porque, para o computador, janeiro é o mês 0)
  const primeiroDiaDoMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
  // Nome do mês por extenso, no jeito brasileiro: "outubro de 2026"
  const nomeDoMes = hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });

  // Função que busca as transações do mês no cofre
  async function carregar() {
    // Liga a rodinha
    setCarregando(true);
    // Liga para o cofre e pede...
    const { data, error } = await supabase
      // ...na gaveta transacoes...
      .from('transacoes')
      // ...todas as colunas (o * quer dizer "tudo")...
      .select('*')
      // ...só as com data maior ou igual ao primeiro dia do mês (gte = "maior ou igual")...
      .gte('data', primeiroDiaDoMes)
      // ...organizadas da data mais nova para a mais antiga...
      .order('data', { ascending: false })
      // ...e, no mesmo dia, da registrada por último para a primeira
      .order('criado_em', { ascending: false });
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setErro('Não foi possível carregar suas transações.');
      // ...e para por aqui
      return;
    // Fecha o "se"
    }
    // Apaga avisos antigos
    setErro('');
    // Guarda a lista no post-it (se vier "nada", guarda uma lista vazia)
    setTransacoes(data ?? []);
  // Fecha a função carregar
  }

  // O avisador: toda vez que esta tela aparecer (inclusive quando volta da tela de adicionar), busca de novo
  useFocusEffect(
    // O useCallback "guarda" a função, para ela não ser recriada à toa
    useCallback(() => {
      // Busca as transações no cofre
      carregar();
    // Os colchetes vazios: "não depende de nada"
    }, [])
  // Fecha o avisador
  );
  
  // Soma as entradas: separa só as entradas e vai somando no cofrinho, que começa com zero
  const totalEntradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((soma, t) => soma + Number(t.valor), 0);
  // Soma os gastos, do mesmo jeito
  const totalGastos = transacoes.filter((t) => t.tipo === 'gasto').reduce((soma, t) => soma + Number(t.valor), 0);
  // O saldo: tudo que entrou menos tudo que saiu
  const saldo = totalEntradas - totalGastos;
  
  // Devolve o que aparece na tela
  return (
    // Caixa que rola, para caber a lista inteira
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Saudação */}
      <Text style={estilos.titulo}>Olá! 👋</Text>
      {/* Nome do mês atual */}
      <Text style={estilos.subtitulo}>Resumo de {nomeDoMes}</Text>

      {/* Cartão do saldo: veste a roupa vermelha SÓ SE o saldo for negativo */}
      <View style={[estilos.cartao, saldo < 0 && estilos.cartaoNegativo]}>
        {/* Rótulo */}
        <Text style={estilos.cartaoRotulo}>Saldo do mês</Text>
        {/* O saldo, agora calculado de verdade! */}
        <Text style={estilos.cartaoValor}>{formatarReais(saldo)}</Text>
      {/* Fecha o cartão */}
      </View>

      {/* Linha com os dois mini cartões, lado a lado */}
      <View style={estilos.resumo}>
        {/* Mini cartão das entradas */}
        <View style={estilos.miniCartao}>
          {/* Rótulo */}
          <Text style={estilos.miniRotulo}>⬆️ Entradas</Text>
          {/* Total das entradas, em verde */}
          <Text style={[estilos.miniValor, { color: '#4ADE80' }]}>{formatarReais(totalEntradas)}</Text>
        {/* Fecha o mini cartão das entradas */}
        </View>
        {/* Mini cartão dos gastos */}
        <View style={estilos.miniCartao}>
          {/* Rótulo */}
          <Text style={estilos.miniRotulo}>⬇️ Gastos</Text>
          {/* Total dos gastos, em vermelho */}
          <Text style={[estilos.miniValor, { color: '#FF8A80' }]}>{formatarReais(totalGastos)}</Text>
        {/* Fecha o mini cartão dos gastos */}
        </View>
      {/* Fecha a linha dos mini cartões */}
      </View>

      {/* Botão de nova transação: o GPS coloca a tela de adicionar em cima desta */}
      <Pressable style={estilos.botaoNovo} onPress={() => router.push('/nova-transacao')}>
        {/* Texto do botão */}
        <Text style={estilos.botaoNovoTexto}>➕ Nova transação</Text>
      {/* Fecha o botão */}
      </Pressable>

      {/* Título da lista */}
      <Text style={estilos.secao}>Transações do mês</Text>

      {/* Situação 1: se estiver buscando, mostra a rodinha */}
      {carregando && <ActivityIndicator color="#1E8E5A" style={{ marginTop: 16 }} />}

      {/* Situação 2: se deu erro, mostra o aviso */}
      {erro !== '' && <Text style={estilos.erro}>{erro}</Text>}

      {/* Situação 3: se terminou, não deu erro e a lista está vazia, mostra o convite */}
      {!carregando && erro === '' && transacoes.length === 0 && (
        // O texto do convite ({'\n'} pula uma linha)
        <Text style={estilos.vazio}>Nenhuma transação este mês.{'\n'}Toque em ➕ para registrar a primeira!</Text>
      // Fecha a situação 3
      )}

      {/* Para cada transação da lista, desenha uma linha (a forma de biscoito!) */}
      {transacoes.map((t) => (
        // A linha da transação. O key é o RG dela
        <Pressable key={t.id} style={estilos.item} onPress={() => router.push({ pathname: '/nova-transacao', params: { id: t.id } })}>          {/* O emoji da categoria */}
          <Text style={estilos.itemEmoji}>{emojiDa(t)}</Text>
          {/* Caixa do meio: ocupa todo o espaço que sobrar (flex: 1) */}
          <View style={{ flex: 1 }}>
            {/* Se tiver descrição, mostra ela. Se não, mostra a categoria (o || quer dizer "ou então") */}
            <Text style={estilos.itemTitulo}>{t.descricao || t.categoria}</Text>
            {/* Embaixo, em cinza: a categoria e a data */}
            <Text style={estilos.itemDetalhe}>{t.categoria} · {formatarData(t.data)}</Text>
          {/* Fecha a caixa do meio */}
          </View>
          {/* O valor: "−" e vermelho se for gasto, "+" e verde se for entrada */}
          <Text style={[estilos.itemValor, { color: t.tipo === 'gasto' ? '#FF8A80' : '#4ADE80' }]}>{t.tipo === 'gasto' ? '− ' : '+ '}{formatarReais(Number(t.valor))}</Text>
        {/* Fecha a linha da transação */}
        </Pressable>      // Fecha a forma de biscoito
      ))}

      {/* Botão de sair: pede ao cofre para jogar fora o crachá */}
      <Pressable style={estilos.botaoSair} onPress={() => supabase.auth.signOut()}>
        {/* Texto do botão */}
        <Text style={estilos.botaoSairTexto}>Sair da conta</Text>
      {/* Fecha o botão */}
      </Pressable>

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela inicial
}

// Estilos: a "roupa" da tela
const estilos = StyleSheet.create({
  // A tela inteira
  tela: {
    // Ocupa tudo
    flex: 1,
    // Fundo verde bem escuro
    backgroundColor: '#0F1F17',
  // Fecha
  },
  // O conteúdo de dentro da caixa que rola
  conteudo: {
    // Espaço nas bordas
    padding: 24,
    // Espaço extra em cima, por causa do relógio do celular
    paddingTop: 60,
    // Espaço extra embaixo, para o último item não ficar colado no fim
    paddingBottom: 40,
  // Fecha
  },
  // Saudação
  titulo: {
    // Letra grande
    fontSize: 28,
    // Negrito
    fontWeight: 'bold',
    // Branca
    color: '#FFFFFF',
  // Fecha
  },
  // Nome do mês
  subtitulo: {
    // Letra média
    fontSize: 16,
    // Cinza clarinho
    color: '#A7B8AE',
    // Espaço acima
    marginTop: 4,
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Cartão do saldo
  cartao: {
    // Verde vivo
    backgroundColor: '#1E8E5A',
    // Espaço interno
    padding: 24,
    // Pontas arredondadas
    borderRadius: 20,
  // Fecha
  },
  // Roupa vermelha do cartão (quando o saldo é negativo)
  cartaoNegativo: {
    // Vermelho
    backgroundColor: '#B42318',
  // Fecha
  },
  // Texto "Saldo do mês"
  cartaoRotulo: {
    // Letra pequena
    fontSize: 14,
    // Branco um pouco transparente
    color: 'rgba(255,255,255,0.8)',
  // Fecha
  },
  // Valor do saldo
  cartaoValor: {
    // Letra bem grande
    fontSize: 36,
    // Negrito
    fontWeight: 'bold',
    // Branca
    color: '#FFFFFF',
    // Espaço acima
    marginTop: 8,
  // Fecha
  },
  // Linha dos dois mini cartões
  resumo: {
    // Um do lado do outro
    flexDirection: 'row',
    // Espaço entre eles
    gap: 12,
    // Espaço acima
    marginTop: 12,
  // Fecha
  },
  // Cada mini cartão
  miniCartao: {
    // Os dois dividem o espaço meio a meio
    flex: 1,
    // Fundo um pouco mais claro que a tela
    backgroundColor: '#1A2E23',
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 16,
  // Fecha
  },
  // Rótulo do mini cartão
  miniRotulo: {
    // Cinza clarinho
    color: '#A7B8AE',
    // Letra pequena
    fontSize: 13,
  // Fecha
  },
  // Valor do mini cartão
  miniValor: {
    // Tamanho médio
    fontSize: 18,
    // Negrito
    fontWeight: 'bold',
    // Espaço acima
    marginTop: 6,
  // Fecha
  },
  // Botão de nova transação
  botaoNovo: {
    // Espaço acima
    marginTop: 20,
    // Fundo branco, para chamar atenção
    backgroundColor: '#FFFFFF',
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // Texto do botão de nova transação
  botaoNovoTexto: {
    // Verde bem escuro
    color: '#0F1F17',
    // Negrito
    fontWeight: 'bold',
    // Tamanho
    fontSize: 16,
  // Fecha
  },
  // Título "Transações do mês"
  secao: {
    // Branco
    color: '#FFFFFF',
    // Tamanho
    fontSize: 18,
    // Negrito
    fontWeight: 'bold',
    // Espaço acima
    marginTop: 28,
    // Espaço abaixo
    marginBottom: 8,
  // Fecha
  },
  // Aviso de erro
  erro: {
    // Vermelho suave
    color: '#FF8A80',
    // Espaço acima
    marginTop: 16,
  // Fecha
  },
  // Convite de lista vazia
  vazio: {
    // Cinza clarinho
    color: '#A7B8AE',
    // Centralizado
    textAlign: 'center',
    // Espaço acima
    marginTop: 24,
    // Espaço entre as linhas
    lineHeight: 22,
  // Fecha
  },
  // Cada linha da lista
  item: {
    // Emoji, texto e valor lado a lado
    flexDirection: 'row',
    // Alinha tudo no meio, na altura
    alignItems: 'center',
    // Espaço em cima e embaixo
    paddingVertical: 14,
    // Linha fininha embaixo, para separar as transações
    borderBottomWidth: 1,
    // Cor da linha fininha
    borderBottomColor: '#1A2E23',
  // Fecha
  },
  // Emoji da linha
  itemEmoji: {
    // Tamanho do emoji
    fontSize: 26,
    // Espaço à direita, para afastar do texto
    marginRight: 12,
  // Fecha
  },
  // Descrição da linha
  itemTitulo: {
    // Branco
    color: '#FFFFFF',
    // Tamanho
    fontSize: 16,
  // Fecha
  },
  // Categoria e data da linha
  itemDetalhe: {
    // Cinza clarinho
    color: '#A7B8AE',
    // Letra pequena
    fontSize: 13,
    // Espaço acima
    marginTop: 2,
  // Fecha
  },
  // Valor da linha
  itemValor: {
    // Tamanho
    fontSize: 16,
    // Negrito
    fontWeight: 'bold',
    // Espaço à esquerda, para afastar do texto
    marginLeft: 8,
  // Fecha
  },
  // Botão de sair
  botaoSair: {
    // Bastante espaço acima, para ficar longe da lista
    marginTop: 40,
    // Espaço interno
    padding: 14,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Borda vermelha suave
    borderColor: '#FF8A80',
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // Texto do botão de sair
  botaoSairTexto: {
    // Vermelho suave
    color: '#FF8A80',
    // Negrito
    fontWeight: 'bold',
  // Fecha
  },
// Fecha os estilos
});