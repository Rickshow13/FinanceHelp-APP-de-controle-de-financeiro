// Importa a memória da tela (os post-its)
import { useState } from 'react';
// Importa as peças da tela (ScrollView é uma caixa que deixa a tela rolar para baixo)
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o "router", o GPS do app, que sabe navegar entre as telas
import { router } from 'expo-router';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa o cardápio de categorias que acabamos de criar
import { CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '../lib/categorias';

// Cria a tela de nova transação
export default function NovaTransacao() {
  // Post-it do tipo: só aceita 'gasto' ou 'entrada'. Começa como gasto
  const [tipo, setTipo] = useState<'gasto' | 'entrada'>('gasto');
  // Post-it do valor, guardado em CENTAVOS (R$ 45,90 = 4590). Começa em zero
  const [centavos, setCentavos] = useState(0);
  // Post-it da categoria escolhida. Começa vazio (nenhuma)
  const [categoria, setCategoria] = useState('');
  // Post-it da descrição. Começa vazio
  const [descricao, setDescricao] = useState('');
  // Post-it de "está salvando?". Começa com não
  const [salvando, setSalvando] = useState(false);
  // Post-it da mensagem de aviso. Começa vazio
  const [mensagem, setMensagem] = useState('');

  // Escolhe o cardápio: se for gasto, as categorias de gasto. Se não, as de entrada
  const categorias = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_ENTRADA;
  // Escolhe a cor da tela: vermelho para gasto, verde para entrada
  const cor = tipo === 'gasto' ? '#E5484D' : '#1E8E5A';
  // Transforma os centavos em dinheiro no formato brasileiro: 4590 vira "R$ 45,90"
  const valorFormatado = (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // Função que volta para a tela anterior
  function voltar() {
    // Se existir uma tela anterior, volta para ela. Se não, vai para a tela inicial
    if (router.canGoBack()) router.back(); else router.replace('/');
  // Fecha
  }

  // Função que roda quando a pessoa troca entre gasto e entrada
  function trocarTipo(novoTipo: 'gasto' | 'entrada') {
    // Guarda o novo tipo
    setTipo(novoTipo);
    // Limpa a categoria, porque as categorias de gasto e de entrada são diferentes
    setCategoria('');
  // Fecha
  }

  // Função que roda a cada número digitado no campo de valor
  function aoDigitarValor(texto: string) {
    // Filtro: joga fora tudo que não for número (o "R$", a vírgula, os pontos...)
    const soNumeros = texto.replace(/\D/g, '');
    // Se passar de 10 números (mais de 99 milhões), ignora, para evitar valores absurdos
    if (soNumeros.length > 10) return;
    // Guarda como centavos (se ficar vazio, vira zero)
    setCentavos(Number(soNumeros || '0'));
  // Fecha
  }

  // Função que roda quando a pessoa aperta o botão de salvar
  async function salvar() {
    // Se o valor for zero...
    if (centavos === 0) {
      // ...avisa
      setMensagem('Digite um valor.');
      // ...e para por aqui
      return;
    // Fecha o "se"
    }
    // Se não escolheu nenhuma categoria...
    if (!categoria) {
      // ...avisa
      setMensagem('Escolha uma categoria.');
      // ...e para por aqui
      return;
    // Fecha o "se"
    }
    // Liga a rodinha
    setSalvando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Liga para o cofre: "na gaveta transacoes, coloca esta linha nova"
    const { error } = await supabase.from('transacoes').insert({
      // O tipo (gasto ou entrada)
      tipo,
      // O valor em reais (4590 centavos dividido por 100 = 45,90)
      valor: centavos / 100,
      // A categoria escolhida
      categoria,
      // A descrição sem espaços sobrando (se ficar vazia, manda "nada", que é o null)
      descricao: descricao.trim() || null,
    // Fecha o pedido
    });
    // Desliga a rodinha
    setSalvando(false);
    // Se o cofre respondeu com erro...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível salvar. Tente de novo.');
      // ...e para por aqui
      return;
    // Fecha o "se"
    }
    // Se deu tudo certo, volta para a tela anterior
    voltar();
  // Fecha a função salvar
  }
  
  // Devolve o que aparece na tela
  return (
    // Caixa que deixa a tela rolar. O keyboardShouldPersistTaps deixa tocar nos botões mesmo com o teclado aberto
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">

      {/* Linha de cima: título e botão de fechar */}
      <View style={estilos.topo}>
        {/* Título da tela */}
        <Text style={estilos.titulo}>Nova transação</Text>
        {/* Botão ✕: volta sem salvar (hitSlop aumenta a área de toque) */}
        <Pressable onPress={voltar} hitSlop={12}>
          {/* O desenho do ✕ */}
          <Text style={estilos.fechar}>✕</Text>
        {/* Fecha o botão ✕ */}
        </Pressable>
      {/* Fecha a linha de cima */}
      </View>

      {/* Seletor de tipo: dois botões lado a lado */}
      <View style={estilos.seletor}>
        {/* Botão "Gasto": se estiver escolhido, fica vermelho */}
        <Pressable style={[estilos.opcao, tipo === 'gasto' && { backgroundColor: '#E5484D' }]} onPress={() => trocarTipo('gasto')}>
          {/* Texto do botão */}
          <Text style={estilos.opcaoTexto}>💸 Gasto</Text>
        {/* Fecha o botão Gasto */}
        </Pressable>
        {/* Botão "Entrada": se estiver escolhido, fica verde */}
        <Pressable style={[estilos.opcao, tipo === 'entrada' && { backgroundColor: '#1E8E5A' }]} onPress={() => trocarTipo('entrada')}>
          {/* Texto do botão */}
          <Text style={estilos.opcaoTexto}>💰 Entrada</Text>
        {/* Fecha o botão Entrada */}
        </Pressable>
      {/* Fecha o seletor */}
      </View>

      {/* Rótulo do valor */}
      <Text style={estilos.rotulo}>Valor</Text>
      {/* Campo do valor: grande e com a cor do tipo */}
      <TextInput
        // Junta a roupa do valor com a cor do tipo (vermelho ou verde)
        style={[estilos.valor, { color: cor }]}
        // Mostra o valor já formatado (R$ 45,90)
        value={valorFormatado}
        // A cada número digitado, roda o truque do app de banco
        onChangeText={aoDigitarValor}
        // Abre o teclado só de números
        keyboardType="number-pad"
      // Fecha o campo do valor
      />

      {/* Rótulo das categorias */}
      <Text style={estilos.rotulo}>Categoria</Text>
      {/* Caixa que coloca as categorias lado a lado, pulando de linha quando acaba o espaço */}
      <View style={estilos.categorias}>
        {/* Para cada item do cardápio, desenha um botãozinho (a "forma de biscoito") */}
        {categorias.map((item) => (
          // O botãozinho. O key é o "RG" do item. Se for o escolhido, pinta com a cor do tipo
          <Pressable key={item.nome} style={[estilos.chip, categoria === item.nome && { backgroundColor: cor, borderColor: cor }]} onPress={() => setCategoria(item.nome)}>
            {/* Emoji e nome da categoria */}
            <Text style={estilos.chipTexto}>{item.emoji} {item.nome}</Text>
          {/* Fecha o botãozinho */}
          </Pressable>
        // Fecha a forma de biscoito
        ))}
      {/* Fecha a caixa das categorias */}
      </View>

      {/* Rótulo da descrição */}
      <Text style={estilos.rotulo}>Descrição (opcional)</Text>
      {/* Campo da descrição */}
      <TextInput
        // Roupa do campo
        style={estilos.campo}
        // Exemplo que aparece quando está vazio
        placeholder="Ex: Mercado, Uber, Salário..."
        // Cor do exemplo
        placeholderTextColor="#6B7F73"
        // Mostra o que está no post-it da descrição
        value={descricao}
        // Cada letra digitada atualiza o post-it
        onChangeText={setDescricao}
        // Limite de 60 letras, para não virar uma redação
        maxLength={60}
      // Fecha o campo da descrição
      />

      {/* Se tiver aviso, mostra em vermelho (o && quer dizer "só se") */}
      {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

      {/* Botão de salvar, com a cor do tipo. Fica "apagadinho" e travado enquanto salva */}
      <Pressable style={[estilos.botao, { backgroundColor: cor }, salvando && estilos.botaoDesativado]} onPress={salvar} disabled={salvando}>
        {/* Se estiver salvando, mostra a rodinha. Se não, mostra "Salvar gasto" ou "Salvar entrada" */}
        {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.botaoTexto}>Salvar {tipo}</Text>}
      {/* Fecha o botão de salvar */}
      </Pressable>

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela
}

// Estilos: a "roupa" da tela
const estilos = StyleSheet.create({
  // A tela inteira
  tela: {
    // Ocupa a tela toda
    flex: 1,
    // Fundo verde bem escuro (igual às outras telas)
    backgroundColor: '#0F1F17',
  // Fecha
  },
  // O conteúdo de dentro da caixa que rola
  conteudo: {
    // Espaço nas bordas
    padding: 24,
    // Espaço extra em cima, por causa do relógio do celular
    paddingTop: 60,
  // Fecha
  },
  // Linha de cima (título + ✕)
  topo: {
    // Coloca as peças uma do lado da outra
    flexDirection: 'row',
    // Empurra o título para a esquerda e o ✕ para a direita
    justifyContent: 'space-between',
    // Alinha os dois no meio, na altura
    alignItems: 'center',
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Título
  titulo: {
    // Letra grande
    fontSize: 24,
    // Negrito
    fontWeight: 'bold',
    // Branca
    color: '#FFFFFF',
  // Fecha
  },
  // O ✕ de fechar
  fechar: {
    // Tamanho
    fontSize: 22,
    // Cinza clarinho
    color: '#A7B8AE',
  // Fecha
  },
  // Caixa dos botões Gasto/Entrada
  seletor: {
    // Um do lado do outro
    flexDirection: 'row',
    // Fundo um pouco mais claro
    backgroundColor: '#1A2E23',
    // Pontas arredondadas
    borderRadius: 14,
    // Espacinho interno, para os botões não encostarem na borda
    padding: 4,
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Cada botão do seletor
  opcao: {
    // Os dois dividem o espaço igualmente (metade para cada)
    flex: 1,
    // Espaço interno, em cima e embaixo
    paddingVertical: 12,
    // Pontas arredondadas
    borderRadius: 10,
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // Texto do seletor
  opcaoTexto: {
    // Branco
    color: '#FFFFFF',
    // Negrito
    fontWeight: 'bold',
    // Tamanho
    fontSize: 15,
  // Fecha
  },
  // Rótulos ("Valor", "Categoria"...)
  rotulo: {
    // Cinza clarinho
    color: '#A7B8AE',
    // Letra pequena
    fontSize: 14,
    // Espaço abaixo
    marginBottom: 8,
  // Fecha
  },
  // O valor grande
  valor: {
    // Letra bem grande
    fontSize: 40,
    // Negrito
    fontWeight: 'bold',
    // Espaço abaixo
    marginBottom: 24,
    // Tira o espaço interno padrão do campo
    padding: 0,
  // Fecha
  },
  // Caixa das categorias
  categorias: {
    // Uma do lado da outra
    flexDirection: 'row',
    // Pula de linha quando acaba o espaço
    flexWrap: 'wrap',
    // Espaço entre os botõezinhos
    gap: 8,
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Cada botãozinho de categoria
  chip: {
    // Espaço interno nos lados
    paddingHorizontal: 14,
    // Espaço interno em cima e embaixo
    paddingVertical: 10,
    // Bem arredondado (formato de pílula)
    borderRadius: 20,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: '#2A4234',
    // Fundo
    backgroundColor: '#1A2E23',
  // Fecha
  },
  // Texto do botãozinho
  chipTexto: {
    // Branco
    color: '#FFFFFF',
    // Tamanho
    fontSize: 14,
  // Fecha
  },
  // Campo da descrição
  campo: {
    // Fundo um pouco mais claro
    backgroundColor: '#1A2E23',
    // Cor da letra
    color: '#FFFFFF',
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Tamanho da letra
    fontSize: 16,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: '#2A4234',
    // Espaço abaixo
    marginBottom: 16,
  // Fecha
  },
  // Mensagem de aviso
  mensagem: {
    // Vermelho suave
    color: '#FF8A80',
    // Centralizado
    textAlign: 'center',
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Botão de salvar
  botao: {
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // Botão enquanto salva
  botaoDesativado: {
    // Meio transparente
    opacity: 0.6,
  // Fecha
  },
  // Texto do botão de salvar
  botaoTexto: {
    // Branco
    color: '#FFFFFF',
    // Negrito
    fontWeight: 'bold',
    // Tamanho
    fontSize: 16,
  // Fecha
  },
// Fecha os estilos
});