// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória (useState) e o guardador de função (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o avisador de tela visível
import { useFocusEffect } from 'expo-router';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa o telefone do cofre
import { supabase } from '../../lib/supabase';
// Importa o tipo "nome de ícone"
import type { NomeIcone } from '../../lib/categorias';
// Importa o guarda-roupa
import { cores, fontes } from '../../lib/tema';

// ============ PARTE 2: AS FICHAS, O DICIONÁRIO E AS DICAS FIXAS ============
// Os 3 tipos de dica: boa notícia, atenção ou informação
type Status = 'bom' | 'atencao' | 'info';
// A ficha de uma dica personalizada
type Dica = { status: Status; titulo: string; texto: string };
// A ficha de uma transação (só o que as dicas usam)
type Transacao = { tipo: 'gasto' | 'entrada'; valor: number; categoria: string };

// O dicionário: como cada tipo de dica aparece (cor, ícone e palavra)
const APARENCIA: Record<Status, { cor: string; icone: NomeIcone; rotulo: string }> = {
  // Boa notícia: dourado, ícone de "certo"
  bom: { cor: cores.ouro, icone: 'checkmark-circle', rotulo: 'Bom sinal' },
  // Atenção: coral, ícone de alerta
  atencao: { cor: cores.coral, icone: 'alert-circle', rotulo: 'Atenção' },
  // Informação: prata, ícone de "i"
  info: { cor: cores.prata, icone: 'information-circle', rotulo: 'Para começar' },
// Fecha o dicionário
};

// As dicas fixas de educação financeira (para adicionar uma, é só colocar mais uma linha)
const DICAS_GERAIS: { icone: NomeIcone; titulo: string; texto: string }[] = [
  // Dica 1: reserva de emergência
  { icone: 'shield-checkmark-outline', titulo: 'Monte uma reserva de emergência', texto: 'Guarde o equivalente a 6 meses dos seus gastos num lugar seguro e fácil de sacar. Ela evita que um imprevisto vire dívida.' },
  // Dica 2: regra 50-30-20
  { icone: 'pie-chart-outline', titulo: 'Use a regra 50-30-20', texto: 'Divida o que entra assim: 50% para o essencial (casa, contas e comida), 30% para desejos e 20% para guardar ou quitar dívidas.' },
  // Dica 3: compras por impulso
  { icone: 'time-outline', titulo: 'Espere 24 horas antes de comprar', texto: 'Viu algo que não estava nos planos? Anote e espere um dia. Se a vontade passar, era impulso.' },
  // Dica 4: pagar a si mesmo primeiro
  { icone: 'wallet-outline', titulo: 'Pague você primeiro', texto: 'Quando o dinheiro entrar, separe logo o valor que vai guardar. O que sobrar é o que dá para gastar no mês.' },
  // Dica 5: rotativo do cartão
  { icone: 'card-outline', titulo: 'Fuja do rotativo do cartão', texto: 'Pagar só o mínimo da fatura leva aos juros mais altos do mercado. Se não der para pagar tudo, converse com o banco sobre parcelar a fatura.' },
  // Dica 6: assinaturas
  { icone: 'repeat-outline', titulo: 'Revise suas assinaturas', texto: 'Streaming, aplicativos e academia que você não usa somam muito no fim do ano. Cancele o que ficou parado.' },
// Fecha a lista
];

// Ajudante: transforma número em dinheiro brasileiro
function formatarReais(valor: number) {
  // Usa o formatador do Brasil, no estilo moeda real
  return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
// Fecha
}

// ============ PARTE 3: O CÉREBRO DAS DICAS PERSONALIZADAS ============
// Recebe os números do mês e devolve a lista de dicas (como um médico olhando um exame)
function gerarDicas(entradas: number, gastos: number, porCategoria: Record<string, number>, mes: string): Dica[] {
  // Começa com uma lista de dicas vazia
  const dicas: Dica[] = [];

  // Regra 1: se não tem nada registrado...
  if (entradas === 0 && gastos === 0) {
    // ...devolve só a dica de começar e para por aqui
    return [{ status: 'info', titulo: 'Comece registrando', texto: `Anote o que entrou e o que saiu em ${mes}. Com alguns registros, as dicas daqui passam a falar do seu dinheiro.` }];
  // Fecha a regra 1
  }

  // Regra 2: se tem gastos mas nenhuma entrada...
  if (entradas === 0) {
    // ...pede para registrar as entradas e para por aqui
    return [{ status: 'info', titulo: 'Registre também o que entra', texto: 'Sem as entradas, não dá para saber se seus gastos cabem no seu orçamento. Adicione seu salário ou outras entradas do mês.' }];
  // Fecha a regra 2
  }

  // Quanto sobrou, em porcentagem do que entrou
  const guardado = Math.round(((entradas - gastos) / entradas) * 100);

  // Regra 3: guardou 20% ou mais
  if (guardado >= 20) {
    // Adiciona um elogio
    dicas.push({ status: 'bom', titulo: `Você guardou ${guardado}% do que entrou`, texto: 'A meta de muitos planejadores é guardar 20% ou mais, e você chegou lá. Que tal separar esse valor numa conta só para a sua reserva?' });
  // Regra 4: guardou entre 0% e 20%
  } else if (guardado >= 0) {
    // Adiciona um incentivo
    dicas.push({ status: 'info', titulo: `Sobrou ${guardado}% do que entrou`, texto: 'Tente chegar a 20%. Cortar um gasto pequeno que se repete, como delivery ou uma assinatura parada, já ajuda bastante.' });
  // Regra 5: gastou mais do que entrou
  } else {
    // Adiciona um alerta, dizendo quanto passou
    dicas.push({ status: 'atencao', titulo: 'Os gastos passaram do que entrou', texto: `Você gastou ${formatarReais(gastos - entradas)} a mais do que recebeu em ${mes}. Veja na aba Gráficos qual categoria pesou mais.` });
  // Fecha as regras 3, 4 e 5
  }

  // Quanto a moradia levou, em porcentagem do que entrou
  const moradia = Math.round(((porCategoria['Moradia'] ?? 0) / entradas) * 100);
  // Regra 6: moradia passou de 30%
  if (moradia > 30) {
    // Adiciona um alerta sobre moradia
    dicas.push({ status: 'atencao', titulo: `Moradia levou ${moradia}% do que entrou`, texto: 'Uma referência comum é gastar até 30% da renda com moradia. Se puder, renegocie o aluguel ou divida custos como internet e condomínio.' });
  // Fecha a regra 6
  }

  // Quanto lazer + compras levaram, em porcentagem do que entrou
  const desejos = Math.round((((porCategoria['Lazer'] ?? 0) + (porCategoria['Compras'] ?? 0)) / entradas) * 100);
  // Regra 7: lazer + compras passaram de 30%
  if (desejos > 30) {
    // Adiciona um alerta sobre impulso
    dicas.push({ status: 'atencao', titulo: `Lazer e compras levaram ${desejos}% do que entrou`, texto: 'Pela regra 50-30-20, os desejos ficam em até 30%. Antes da próxima compra fora dos planos, tente esperar 24 horas.' });
  // Fecha a regra 7
  }

  // Devolve a lista de dicas
  return dicas;
// Fecha o cérebro
}

// ============ PARTE 4: AS MEMÓRIAS E A BUSCA ============
// Cria a tela de dicas
export default function TelaDicas() {
  // Post-it com as transações do mês
  const [transacoes, setTransacoes] = useState<Transacao[]>([]);
  // Post-it de "está buscando no cofre?"
  const [carregando, setCarregando] = useState(true);

  // Pega a data de hoje
  const hoje = new Date();
  // Primeiro dia do mês no formato do cofre: "2026-10-01"
  const primeiroDiaDoMes = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}-01`;
  // Nome do mês: "outubro"
  const mes = hoje.toLocaleDateString('pt-BR', { month: 'long' });

  // Função que busca as transações do mês
  async function carregar() {
    // Liga a rodinha
    setCarregando(true);
    // Pede ao cofre: tipo, valor e categoria das transações deste mês
    const { data } = await supabase.from('transacoes').select('tipo, valor, categoria').gte('data', primeiroDiaDoMes);
    // Guarda a lista (se vier "nada", guarda uma lista vazia)
    setTransacoes(data ?? []);
    // Desliga a rodinha
    setCarregando(false);
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

  // ============ PARTE 5: AS CONTAS ============
  // Soma as entradas
  const entradas = transacoes.filter((t) => t.tipo === 'entrada').reduce((soma, t) => soma + Number(t.valor), 0);
  // Soma os gastos
  const gastos = transacoes.filter((t) => t.tipo === 'gasto').reduce((soma, t) => soma + Number(t.valor), 0);
  // O caderno: total gasto em cada categoria
  const porCategoria: Record<string, number> = {};
  // Passa por cada transação...
  for (const t of transacoes) {
    // ...e, se for gasto, soma na página da categoria
    if (t.tipo === 'gasto') porCategoria[t.categoria] = (porCategoria[t.categoria] ?? 0) + Number(t.valor);
  // Fecha o "passa por cada"
  }
  // Entrega os números para o cérebro e recebe as dicas personalizadas
  const dicas = gerarDicas(entradas, gastos, porCategoria, mes);

  // ============ PARTE 6: O DESENHO DA TELA ============
  // Devolve o que aparece na tela
  return (
    // Caixa que rola
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Título da tela */}
      <Text style={estilos.titulo}>Dicas</Text>
      {/* Subtítulo com o mês */}
      <Text style={estilos.subtitulo}>Feitas a partir do seu {mes}</Text>

      {/* Título da seção personalizada */}
      <Text style={estilos.secao}>Sobre o seu mês</Text>

      {/* Se estiver buscando, mostra a rodinha. Se não, mostra os cartões */}
      {carregando ? <ActivityIndicator color={cores.ouro} style={{ marginVertical: 16 }} /> : dicas.map((dica) => (
        // O cartão de uma dica personalizada (o título serve de RG)
        <View key={dica.titulo} style={estilos.cartao}>
          {/* Linha do status: ícone + palavra, na cor do status */}
          <View style={estilos.status}>
            {/* O ícone do status */}
            <Ionicons name={APARENCIA[dica.status].icone} size={18} color={APARENCIA[dica.status].cor} />
            {/* A palavra do status ("Bom sinal", "Atenção"...) */}
            <Text style={[estilos.statusTexto, { color: APARENCIA[dica.status].cor }]}>{APARENCIA[dica.status].rotulo}</Text>
          {/* Fecha a linha do status */}
          </View>
          {/* Título da dica */}
          <Text style={estilos.cartaoTitulo}>{dica.titulo}</Text>
          {/* Texto da dica */}
          <Text style={estilos.cartaoTexto}>{dica.texto}</Text>
        {/* Fecha o cartão */}
        </View>
      // Fecha a forma de biscoito
      ))}

      {/* Título da seção geral */}
      <Text style={estilos.secao}>Para organizar o dinheiro</Text>

      {/* Para cada dica fixa, uma linha simples */}
      {DICAS_GERAIS.map((dica) => (
        // A linha da dica (o título serve de RG)
        <View key={dica.titulo} style={estilos.item}>
          {/* Quadradinho com o ícone */}
          <View style={estilos.itemIcone}>
            {/* O ícone, dourado */}
            <Ionicons name={dica.icone} size={20} color={cores.ouro} />
          {/* Fecha o quadradinho */}
          </View>
          {/* Caixa do texto (ocupa o espaço que sobrar) */}
          <View style={{ flex: 1 }}>
            {/* Título da dica */}
            <Text style={estilos.itemTitulo}>{dica.titulo}</Text>
            {/* Texto da dica */}
            <Text style={estilos.itemTexto}>{dica.texto}</Text>
          {/* Fecha a caixa do texto */}
          </View>
        {/* Fecha a linha */}
        </View>
      // Fecha a forma de biscoito
      ))}

      {/* O aviso de responsabilidade */}
      <Text style={estilos.aviso}>Estas dicas são educativas e não substituem a orientação de um profissional de finanças.</Text>

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela
}

// ============ PARTE 7: A ROUPA (ESTILOS) ============
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
  // Subtítulo
  subtitulo: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 4,
  // Fecha
  },
  // Títulos das seções
  secao: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 22,
    // Marfim
    color: cores.marfim,
    // Espaço acima
    marginTop: 28,
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Cartão de dica personalizada
  cartao: {
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
    // Pontas arredondadas
    borderRadius: 18,
    // Espaço interno
    padding: 18,
    // Espaço abaixo, entre um cartão e outro
    marginBottom: 12,
  // Fecha
  },
  // Linha do status
  status: {
    // Ícone e palavra lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre o ícone e a palavra
    gap: 6,
    // Espaço abaixo
    marginBottom: 8,
  // Fecha
  },
  // Palavra do status
  statusTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Pequena
    fontSize: 13,
  // Fecha
  },
  // Título do cartão
  cartaoTitulo: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 17,
    // Marfim
    color: cores.marfim,
    // Espaço abaixo
    marginBottom: 6,
  // Fecha
  },
  // Texto do cartão
  cartaoTexto: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Espaço entre as linhas (texto longo fica mais fácil de ler)
    lineHeight: 22,
  // Fecha
  },
  // Linha de dica geral
  item: {
    // Ícone e texto lado a lado
    flexDirection: 'row',
    // Espaço entre o ícone e o texto
    gap: 14,
    // Espaço em cima e embaixo
    paddingVertical: 14,
    // Linha fina embaixo
    borderBottomWidth: 1,
    // Cor da linha fina
    borderBottomColor: cores.grafite,
  // Fecha
  },
  // Quadradinho do ícone
  itemIcone: {
    // Largura
    width: 40,
    // Altura
    height: 40,
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
  // Título da dica geral
  itemTitulo: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 16,
    // Marfim
    color: cores.marfim,
    // Espaço abaixo
    marginBottom: 4,
  // Fecha
  },
  // Texto da dica geral
  itemTexto: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 14,
    // Prata
    color: cores.prata,
    // Espaço entre as linhas
    lineHeight: 21,
  // Fecha
  },
  // Aviso de responsabilidade
  aviso: {
    // Letra simples
    fontFamily: fontes.texto,
    // Pequena
    fontSize: 12,
    // Cinza apagado (discreto)
    color: cores.apagado,
    // Centralizado
    textAlign: 'center',
    // Espaço acima
    marginTop: 28,
    // Espaço entre linhas
    lineHeight: 18,
  // Fecha
  },
// Fecha os estilos
});