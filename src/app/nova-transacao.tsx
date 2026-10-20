// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória (useState) e o "faça isso assim que abrir" (useEffect)
import { useEffect, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o GPS (router) e o leitor de bilhetes (useLocalSearchParams)
import { router, useLocalSearchParams } from 'expo-router';
// Importa o pincel de degradê (para o botão de salvar)
import { LinearGradient } from 'expo-linear-gradient';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa o cardápio de categorias
import { CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '../lib/categorias';
// Importa o guarda-roupa
import { cores, degradeOuro, fontes } from '../lib/tema';

// Degradê coral do botão de salvar gasto (do coral claro ao escuro)
const degradeCoral = ['#FF9A8C', '#FF7B6B', '#E0583F'] as const;

// ============ PARTE 2: AS MEMÓRIAS ============
// Cria a tela de nova transação (que também edita e apaga)
export default function NovaTransacao() {
  // Lê o bilhete que o GPS trouxe. Se veio um RG (id), é edição
  const { id } = useLocalSearchParams<{ id?: string }>();
  // "Estou editando?": sim se tem RG, não se não tem
  const editando = !!id;

  // Post-it do tipo: 'gasto' ou 'entrada'
  const [tipo, setTipo] = useState<'gasto' | 'entrada'>('gasto');
  // Post-it do valor, em CENTAVOS (R$ 45,90 = 4590)
  const [centavos, setCentavos] = useState(0);
  // Post-it da categoria escolhida
  const [categoria, setCategoria] = useState('');
  // Post-it da descrição
  const [descricao, setDescricao] = useState('');
  // Post-it de "está salvando?"
  const [salvando, setSalvando] = useState(false);
  // Post-it da mensagem de aviso
  const [mensagem, setMensagem] = useState('');
  // Post-it de "está buscando a transação no cofre?" (sim só se estiver editando)
  const [carregandoDados, setCarregandoDados] = useState(editando);
  // Post-it de "já deu o primeiro toque no apagar?"
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  // Post-it de "está digitando na descrição?" (para a borda dourada)
  const [descricaoAtiva, setDescricaoAtiva] = useState(false);

  // Escolhe o cardápio: de gasto ou de entrada
  const categorias = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_ENTRADA;
  // A cor do tipo: coral para gasto, ouro para entrada
  const cor = tipo === 'gasto' ? cores.coral : cores.ouro;
  // A tinta: cor escura para as letras escritas EM CIMA da cor do tipo
  const tinta = tipo === 'gasto' ? cores.coralTinta : cores.ouroTinta;
  // O degradê do botão de salvar: coral ou dourado
  const degradeBotao = tipo === 'gasto' ? degradeCoral : degradeOuro;
  // Transforma os centavos em dinheiro brasileiro: 4590 vira "R$ 45,90"
  const valorFormatado = (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  // Assim que a tela abrir (e se o RG mudar), busca a transação para editar
  useEffect(() => {
    // Se NÃO tem RG, é transação nova: não busca nada
    if (!id) return;
    // Função que busca a transação no cofre pelo RG
    async function buscar(rg: string) {
      // Pede ao cofre: a transação com este RG (eq), só uma (single)
      const { data, error } = await supabase.from('transacoes').select('*').eq('id', rg).single();
      // Avisa que terminou de buscar
      setCarregandoDados(false);
      // Se deu erro ou não veio nada...
      if (error || !data) {
        // ...avisa
        setMensagem('Não foi possível carregar esta transação. Volte e tente de novo.');
        // ...e para
        return;
      // Fecha o "se"
      }
      // Preenche o tipo
      setTipo(data.tipo);
      // Preenche o valor em centavos (o Math.round arredonda)
      setCentavos(Math.round(Number(data.valor) * 100));
      // Preenche a categoria
      setCategoria(data.categoria);
      // Preenche a descrição
      setDescricao(data.descricao ?? '');
    // Fecha a função buscar
    }
    // Chama a busca com o RG
    buscar(id);
  // Rode de novo se o RG mudar
  }, [id]);

  // ============ PARTE 3: AS FUNÇÕES (IGUAIS ÀS DA 4.4) ============
  // Volta para a tela anterior (ou para a inicial, se não tiver anterior)
  function voltar() {
    // Se tiver tela anterior, volta. Se não, vai para a inicial
    if (router.canGoBack()) router.back(); else router.replace('/');
  // Fecha
  }

  // Troca entre gasto e entrada
  function trocarTipo(novoTipo: 'gasto' | 'entrada') {
    // Guarda o novo tipo
    setTipo(novoTipo);
    // Limpa a categoria (as de gasto e de entrada são diferentes)
    setCategoria('');
  // Fecha
  }

  // O truque do app de banco: cada número digitado vira centavos
  function aoDigitarValor(texto: string) {
    // Joga fora tudo que não for número
    const soNumeros = texto.replace(/\D/g, '');
    // Se passar de 10 números, ignora
    if (soNumeros.length > 10) return;
    // Guarda como centavos
    setCentavos(Number(soNumeros || '0'));
  // Fecha
  }

  // Salva (cria uma nova ou atualiza a existente)
  async function salvar() {
    // Se o valor for zero...
    if (centavos === 0) {
      // ...avisa
      setMensagem('Digite um valor.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Se não escolheu categoria...
    if (!categoria) {
      // ...avisa
      setMensagem('Escolha uma categoria.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Liga a rodinha
    setSalvando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Junta as informações numa caixinha
    const dados = {
      // O tipo
      tipo,
      // O valor em reais
      valor: centavos / 100,
      // A categoria
      categoria,
      // A descrição (se vazia, "nada")
      descricao: descricao.trim() || null,
    // Fecha a caixinha
    };
    // Se tem RG, atualiza (update). Se não, coloca uma nova (insert)
    const { error } = id
      // Editando
      ? await supabase.from('transacoes').update(dados).eq('id', id)
      // Nova
      : await supabase.from('transacoes').insert(dados);
    // Desliga a rodinha
    setSalvando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível salvar. Confira sua internet e tente de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Deu certo: volta
    voltar();
  // Fecha a função salvar
  }

  // Apaga com dois toques
  async function apagar() {
    // Sem RG, não tem o que apagar
    if (!id) return;
    // Se é o PRIMEIRO toque...
    if (!confirmandoApagar) {
      // ...só muda o botão
      setConfirmandoApagar(true);
      // ...e para, sem apagar
      return;
    // Fecha o "se"
    }
    // Segundo toque: liga a rodinha
    setSalvando(true);
    // Pede ao cofre para apagar a transação com este RG
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    // Desliga a rodinha
    setSalvando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível apagar. Confira sua internet e tente de novo.');
      // ...volta o botão ao normal
      setConfirmandoApagar(false);
      // ...e para
      return;
    // Fecha o "se"
    }
    // Apagou: volta
    voltar();
  // Fecha a função apagar
  }

  // ============ PARTE 4: O DESENHO DA TELA ============
  // Enquanto busca a transação no cofre, mostra só a rodinha
  if (carregandoDados) {
    // Devolve a tela de espera
    return (
      // Caixa que ocupa tudo, com a rodinha no meio
      <View style={estilos.carregando}>
        {/* A rodinha dourada */}
        <ActivityIndicator size="large" color={cores.ouro} />
      {/* Fecha a caixa */}
      </View>
    // Fecha o return
    );
  // Fecha o "se"
  }

  // Devolve o que aparece na tela
  return (
    // Caixa que rola
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">

      {/* Linha de cima: título e botão de fechar */}
      <View style={estilos.topo}>
        {/* Título que muda conforme o modo */}
        <Text style={estilos.titulo}>{editando ? 'Editar transação' : 'Nova transação'}</Text>
        {/* Botão redondo de fechar */}
        <Pressable style={estilos.fechar} onPress={voltar} hitSlop={8} accessibilityLabel="Fechar sem salvar">
          {/* O ícone de X */}
          <Ionicons name="close" size={20} color={cores.prata} />
        {/* Fecha o botão */}
        </Pressable>
      {/* Fecha a linha de cima */}
      </View>

      {/* Seletor: gasto (seta para baixo) e entrada (seta para cima) */}
      <View style={estilos.seletor}>
        {/* Botão "Gasto": fica coral quando escolhido */}
        <Pressable style={[estilos.opcao, tipo === 'gasto' && { backgroundColor: cores.coral }]} onPress={() => trocarTipo('gasto')}>
          {/* Seta para baixo (o dinheiro sai) */}
          <Ionicons name="arrow-down" size={16} color={tipo === 'gasto' ? cores.coralTinta : cores.prata} />
          {/* Texto */}
          <Text style={[estilos.opcaoTexto, { color: tipo === 'gasto' ? cores.coralTinta : cores.prata }]}>Gasto</Text>
        {/* Fecha o botão Gasto */}
        </Pressable>
        {/* Botão "Entrada": fica dourado quando escolhido */}
        <Pressable style={[estilos.opcao, tipo === 'entrada' && { backgroundColor: cores.ouro }]} onPress={() => trocarTipo('entrada')}>
          {/* Seta para cima (o dinheiro entra) */}
          <Ionicons name="arrow-up" size={16} color={tipo === 'entrada' ? cores.ouroTinta : cores.prata} />
          {/* Texto */}
          <Text style={[estilos.opcaoTexto, { color: tipo === 'entrada' ? cores.ouroTinta : cores.prata }]}>Entrada</Text>
        {/* Fecha o botão Entrada */}
        </Pressable>
      {/* Fecha o seletor */}
      </View>

      {/* Rótulo do valor */}
      <Text style={estilos.rotulo}>Valor</Text>
      {/* O valor gigante, na cor do tipo */}
      <TextInput
        // Roupa do valor com a cor do tipo
        style={[estilos.valor, { color: cor }]}
        // Mostra o valor formatado
        value={valorFormatado}
        // Cada número digitado passa pelo truque do app de banco
        onChangeText={aoDigitarValor}
        // Teclado só de números
        keyboardType="number-pad"
      // Fecha o campo do valor
      />

      {/* Rótulo das categorias */}
      <Text style={estilos.rotulo}>Categoria</Text>
      {/* Caixa das categorias */}
      <View style={estilos.categorias}>
        {/* Para cada categoria do cardápio, um botãozinho com ícone e nome */}
        {categorias.map((item) => (
          // O botãozinho: se for o escolhido, pinta com a cor do tipo
          <Pressable key={item.nome} style={[estilos.chip, categoria === item.nome && { backgroundColor: cor, borderColor: cor }]} onPress={() => setCategoria(item.nome)}>
            {/* O ícone (tinta se escolhido, prata se não) */}
            <Ionicons name={item.icone} size={16} color={categoria === item.nome ? tinta : cores.prata} />
            {/* O nome (tinta se escolhido, marfim se não) */}
            <Text style={[estilos.chipTexto, { color: categoria === item.nome ? tinta : cores.marfim }]}>{item.nome}</Text>
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
        // Roupa do campo + borda dourada se estiver digitando
        style={[estilos.campo, descricaoAtiva && estilos.campoAtivo]}
        // Exemplo quando vazio
        placeholder="Ex: Mercado, Uber, Salário"
        // Cor do exemplo
        placeholderTextColor={cores.apagado}
        // Mostra o post-it
        value={descricao}
        // Atualiza o post-it
        onChangeText={setDescricao}
        // Quando tocar no campo, liga a borda dourada
        onFocus={() => setDescricaoAtiva(true)}
        // Quando sair do campo, desliga
        onBlur={() => setDescricaoAtiva(false)}
        // Limite de 60 letras
        maxLength={60}
      // Fecha o campo
      />

      {/* Se tiver aviso, mostra em coral */}
      {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

      {/* Botão de salvar: fica mais transparente enquanto o dedo aperta */}
      <Pressable onPress={salvar} disabled={salvando} style={({ pressed }) => [estilos.botaoToque, (pressed || salvando) && { opacity: 0.75 }]}>
        {/* O degradê do botão (coral ou dourado) */}
        <LinearGradient colors={degradeBotao} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.botao}>
          {/* Rodinha, ou "Salvar alterações", ou "Salvar gasto/entrada" */}
          {salvando ? <ActivityIndicator color={tinta} /> : <Text style={[estilos.botaoTexto, { color: tinta }]}>{editando ? 'Salvar alterações' : `Salvar ${tipo}`}</Text>}
        {/* Fecha o degradê */}
        </LinearGradient>
      {/* Fecha o botão de salvar */}
      </Pressable>

      {/* Botão de apagar: SÓ aparece se estiver editando */}
      {editando && (
        // O botão (fica coral cheio depois do primeiro toque)
        <Pressable style={[estilos.botaoApagar, confirmandoApagar && estilos.botaoApagarConfirmando]} onPress={apagar} disabled={salvando}>
          {/* Ícone de lixeira ou de alerta */}
          <Ionicons name={confirmandoApagar ? 'alert-circle-outline' : 'trash-outline'} size={18} color={confirmandoApagar ? cores.coralTinta : cores.coral} />
          {/* O texto muda depois do primeiro toque */}
          <Text style={[estilos.botaoApagarTexto, { color: confirmandoApagar ? cores.coralTinta : cores.coral }]}>{confirmandoApagar ? 'Toque de novo para apagar' : 'Apagar transação'}</Text>
        {/* Fecha o botão de apagar */}
        </Pressable>
      // Fecha o "só se estiver editando"
      )}

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela
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
  // Tela de espera
  carregando: {
    // Ocupa tudo
    flex: 1,
    // Rodinha no meio (vertical)
    justifyContent: 'center',
    // Rodinha no meio (horizontal)
    alignItems: 'center',
    // Fundo preto ônix
    backgroundColor: cores.onix,
  // Fecha
  },
  // Linha de cima
  topo: {
    // Lado a lado
    flexDirection: 'row',
    // Título na esquerda, X na direita
    justifyContent: 'space-between',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço abaixo
    marginBottom: 22,
  // Fecha
  },
  // Título
  titulo: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 32,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Botão redondo de fechar
  fechar: {
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
    // Ícone no meio (horizontal)
    alignItems: 'center',
    // Ícone no meio (vertical)
    justifyContent: 'center',
  // Fecha
  },
  // Caixa do seletor
  seletor: {
    // Lado a lado
    flexDirection: 'row',
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Pontas arredondadas
    borderRadius: 14,
    // Espacinho interno
    padding: 4,
    // Espaço abaixo
    marginBottom: 24,
  // Fecha
  },
  // Cada botão do seletor
  opcao: {
    // Metade do espaço para cada
    flex: 1,
    // Seta e texto lado a lado
    flexDirection: 'row',
    // Centralizados
    justifyContent: 'center',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre a seta e o texto
    gap: 6,
    // Espaço em cima e embaixo
    paddingVertical: 12,
    // Pontas arredondadas
    borderRadius: 10,
  // Fecha
  },
  // Texto do seletor
  opcaoTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 15,
  // Fecha
  },
  // Rótulos
  rotulo: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Pequena
    fontSize: 13,
    // Prata
    color: cores.prata,
    // Espaço abaixo
    marginBottom: 8,
  // Fecha
  },
  // O valor gigante
  valor: {
    // Letra do painel da bolsa, bem grossa
    fontFamily: fontes.marca,
    // Gigante
    fontSize: 64,
    // Sem espaço interno
    padding: 0,
    // Espaço abaixo
    marginBottom: 20,
  // Fecha
  },
  // Caixa das categorias
  categorias: {
    // Lado a lado
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
    // Ícone e texto lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre o ícone e o texto
    gap: 6,
    // Espaço nos lados
    paddingHorizontal: 14,
    // Espaço em cima e embaixo
    paddingVertical: 9,
    // Formato de pílula
    borderRadius: 20,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
    // Fundo grafite
    backgroundColor: cores.grafite,
  // Fecha
  },
  // Texto do botãozinho
  chipTexto: {
    // Letra simples, média
    fontFamily: fontes.textoMedio,
    // Tamanho
    fontSize: 14,
  // Fecha
  },
  // Campo da descrição
  campo: {
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Letra simples
    fontFamily: fontes.texto,
    // Cor da letra
    color: cores.marfim,
    // Tamanho
    fontSize: 16,
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
    // Espaço abaixo
    marginBottom: 16,
  // Fecha
  },
  // Campo da descrição enquanto digita
  campoAtivo: {
    // Borda dourada
    borderColor: cores.ouro,
  // Fecha
  },
  // Mensagem de aviso
  mensagem: {
    // Letra simples
    fontFamily: fontes.texto,
    // Coral
    color: cores.coral,
    // Centralizado
    textAlign: 'center',
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Área de toque do botão de salvar
  botaoToque: {
    // Pontas arredondadas
    borderRadius: 14,
    // Corta o degradê nas pontas
    overflow: 'hidden',
  // Fecha
  },
  // O degradê do botão de salvar
  botao: {
    // Espaço em cima e embaixo
    paddingVertical: 16,
    // Texto no meio
    alignItems: 'center',
  // Fecha
  },
  // Texto do botão de salvar
  botaoTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
  // Fecha
  },
  // Botão de apagar (discreto)
  botaoApagar: {
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
    padding: 14,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Borda coral
    borderColor: cores.coral,
  // Fecha
  },
  // Botão de apagar depois do primeiro toque (alerta!)
  botaoApagarConfirmando: {
    // Fundo coral cheio
    backgroundColor: cores.coral,
  // Fecha
  },
  // Texto do botão de apagar
  botaoApagarTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 15,
  // Fecha
  },
// Fecha os estilos
});