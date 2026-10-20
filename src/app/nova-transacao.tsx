// Importa a memória (useState) e o "faça isso assim que abrir" (useEffect) 🆕
import { useEffect, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o GPS (router) e o leitor de bilhetes (useLocalSearchParams) 🆕
import { router, useLocalSearchParams } from 'expo-router';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa o cardápio de categorias
import { CATEGORIAS_ENTRADA, CATEGORIAS_GASTO } from '../lib/categorias';

// Cria a tela de nova transação (que agora também edita!)
export default function NovaTransacao() {
  // 🆕 Lê o bilhete que o GPS trouxe. Se veio um RG (id), é edição
  const { id } = useLocalSearchParams<{ id?: string }>();
  // 🆕 "Estou editando?": sim se tem RG, não se não tem (o !! transforma em sim ou não)
  const editando = !!id;

  // Post-it do tipo: 'gasto' ou 'entrada'. Começa como gasto
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
  // 🆕 Post-it de "está buscando a transação no cofre?". Começa com sim SÓ SE estiver editando
  const [carregandoDados, setCarregandoDados] = useState(editando);
  // 🆕 Post-it de "a pessoa já deu o primeiro toque no apagar?". Começa com não
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);

  // Escolhe o cardápio: de gasto ou de entrada
  const categorias = tipo === 'gasto' ? CATEGORIAS_GASTO : CATEGORIAS_ENTRADA;
  // Escolhe a cor: vermelho para gasto, verde para entrada
  const cor = tipo === 'gasto' ? '#E5484D' : '#1E8E5A';
  // Transforma os centavos em dinheiro brasileiro: 4590 vira "R$ 45,90"
  const valorFormatado = (centavos / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  
  // 🆕 Assim que a tela abrir (e sempre que o RG mudar), roda este bloco
  useEffect(() => {
    // Se NÃO tem RG, é transação nova: não precisa buscar nada
    if (!id) return;
    // Função que busca a transação no cofre, a partir do RG
    async function buscar(rg: string) {
      // Liga para o cofre: na gaveta transacoes, a que tem o RG igual (eq) a este, e é uma só (single)
      const { data, error } = await supabase.from('transacoes').select('*').eq('id', rg).single();
      // Avisa que terminou de buscar
      setCarregandoDados(false);
      // Se deu erro ou não veio nada...
      if (error || !data) {
        // ...avisa
        setMensagem('Não foi possível carregar esta transação.');
        // ...e para por aqui
        return;
      // Fecha o "se"
      }
      // Preenche o post-it do tipo
      setTipo(data.tipo);
      // Preenche o valor, voltando para centavos (o Math.round arredonda para não dar 4589,9999)
      setCentavos(Math.round(Number(data.valor) * 100));
      // Preenche a categoria
      setCategoria(data.categoria);
      // Preenche a descrição (se vier "nada", deixa vazio)
      setDescricao(data.descricao ?? '');
    // Fecha a função buscar
    }
    // Chama a função, entregando o RG do bilhete
    buscar(id);
  // Rode de novo se o RG mudar
  }, [id]);
  
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
    // Limpa a categoria, porque as de gasto e as de entrada são diferentes
    setCategoria('');
  // Fecha
  }

  // Função que roda a cada número digitado no valor (o truque do app de banco)
  function aoDigitarValor(texto: string) {
    // Joga fora tudo que não for número
    const soNumeros = texto.replace(/\D/g, '');
    // Se passar de 10 números, ignora
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
    // 🆕 Junta as informações numa caixinha só (para usar tanto no criar quanto no editar)
    const dados = {
      // O tipo
      tipo,
      // O valor em reais
      valor: centavos / 100,
      // A categoria
      categoria,
      // A descrição (se vazia, manda "nada")
      descricao: descricao.trim() || null,
    // Fecha a caixinha
    };
    // 🆕 Se tem RG, ATUALIZA a transação com esse RG. Se não tem, COLOCA uma nova
    const { error } = id
      // Editando: "atualiza (update) a transação cujo RG é igual (eq) a este"
      ? await supabase.from('transacoes').update(dados).eq('id', id)
      // Nova: "coloca (insert) esta linha nova"
      : await supabase.from('transacoes').insert(dados);
    // Desliga a rodinha
    setSalvando(false);
    // Se o cofre respondeu com erro...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível salvar. Tente de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Deu certo: volta para a tela anterior
    voltar();
  // Fecha a função salvar
  }

  // 🆕 Função que roda quando a pessoa aperta o botão de apagar
  async function apagar() {
    // Se não tem RG, não tem o que apagar (segurança extra)
    if (!id) return;
    // Se é o PRIMEIRO toque...
    if (!confirmandoApagar) {
      // ...só muda o botão para "toque de novo para confirmar"
      setConfirmandoApagar(true);
      // ...e para por aqui, sem apagar nada
      return;
    // Fecha o "se"
    }
    // Se chegou aqui, é o SEGUNDO toque. Liga a rodinha
    setSalvando(true);
    // Pede ao cofre: "apaga (delete) a transação cujo RG é igual (eq) a este"
    const { error } = await supabase.from('transacoes').delete().eq('id', id);
    // Desliga a rodinha
    setSalvando(false);
    // Se deu erro...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível apagar. Tente de novo.');
      // ...volta o botão ao normal
      setConfirmandoApagar(false);
      // ...e para
      return;
    // Fecha o "se"
    }
    // Apagou: volta para a tela inicial
    voltar();
  // Fecha a função apagar
  }
  
  // 🆕 Enquanto busca a transação no cofre, mostra só a rodinha
  if (carregandoDados) {
    // Devolve a tela de espera
    return (
      // Caixa que ocupa tudo e centraliza a rodinha
      <View style={estilos.carregando}>
        {/* A rodinha verde */}
        <ActivityIndicator size="large" color="#1E8E5A" />
      {/* Fecha a caixa */}
      </View>
    // Fecha o return
    );
  // Fecha o "se"
  }

  // Devolve o que aparece na tela
  return (
    // Caixa que deixa a tela rolar
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo} keyboardShouldPersistTaps="handled">

      {/* Linha de cima: título e botão de fechar */}
      <View style={estilos.topo}>
        {/* 🆕 Título que muda: "Editar transação" ou "Nova transação" */}
        <Text style={estilos.titulo}>{editando ? 'Editar transação' : 'Nova transação'}</Text>
        {/* Botão ✕: volta sem salvar */}
        <Pressable onPress={voltar} hitSlop={12}>
          {/* O desenho do ✕ */}
          <Text style={estilos.fechar}>✕</Text>
        {/* Fecha o botão ✕ */}
        </Pressable>
      {/* Fecha a linha de cima */}
      </View>

      {/* Seletor de tipo: dois botões lado a lado */}
      <View style={estilos.seletor}>
        {/* Botão "Gasto": se escolhido, fica vermelho */}
        <Pressable style={[estilos.opcao, tipo === 'gasto' && { backgroundColor: '#E5484D' }]} onPress={() => trocarTipo('gasto')}>
          {/* Texto */}
          <Text style={estilos.opcaoTexto}>💸 Gasto</Text>
        {/* Fecha */}
        </Pressable>
        {/* Botão "Entrada": se escolhido, fica verde */}
        <Pressable style={[estilos.opcao, tipo === 'entrada' && { backgroundColor: '#1E8E5A' }]} onPress={() => trocarTipo('entrada')}>
          {/* Texto */}
          <Text style={estilos.opcaoTexto}>💰 Entrada</Text>
        {/* Fecha */}
        </Pressable>
      {/* Fecha o seletor */}
      </View>

      {/* Rótulo do valor */}
      <Text style={estilos.rotulo}>Valor</Text>
      {/* Campo do valor */}
      <TextInput
        // Roupa do valor com a cor do tipo
        style={[estilos.valor, { color: cor }]}
        // Mostra o valor formatado
        value={valorFormatado}
        // A cada número digitado, roda o truque do app de banco
        onChangeText={aoDigitarValor}
        // Teclado só de números
        keyboardType="number-pad"
      // Fecha o campo do valor
      />

      {/* Rótulo das categorias */}
      <Text style={estilos.rotulo}>Categoria</Text>
      {/* Caixa das categorias */}
      <View style={estilos.categorias}>
        {/* Para cada item do cardápio, um botãozinho (a forma de biscoito) */}
        {categorias.map((item) => (
          // O botãozinho: se for o escolhido, pinta com a cor do tipo
          <Pressable key={item.nome} style={[estilos.chip, categoria === item.nome && { backgroundColor: cor, borderColor: cor }]} onPress={() => setCategoria(item.nome)}>
            {/* Emoji e nome */}
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
        // Exemplo quando vazio
        placeholder="Ex: Mercado, Uber, Salário..."
        // Cor do exemplo
        placeholderTextColor="#6B7F73"
        // Mostra o post-it
        value={descricao}
        // Atualiza o post-it
        onChangeText={setDescricao}
        // Limite de 60 letras
        maxLength={60}
      // Fecha o campo
      />

      {/* Se tiver aviso, mostra */}
      {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

      {/* Botão de salvar, com a cor do tipo */}
      <Pressable style={[estilos.botao, { backgroundColor: cor }, salvando && estilos.botaoDesativado]} onPress={salvar} disabled={salvando}>
        {/* 🆕 Rodinha, ou "Salvar alterações" (editando), ou "Salvar gasto/entrada" (nova) */}
        {salvando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.botaoTexto}>{editando ? 'Salvar alterações' : `Salvar ${tipo}`}</Text>}
      {/* Fecha o botão de salvar */}
      </Pressable>

      {/* 🆕 Botão de apagar: SÓ aparece se estiver editando */}
      {editando && (
        // O botão. Fica vermelho cheio depois do primeiro toque
        <Pressable style={[estilos.botaoApagar, confirmandoApagar && estilos.botaoApagarConfirmando]} onPress={apagar} disabled={salvando}>
          {/* O texto muda depois do primeiro toque */}
          <Text style={estilos.botaoApagarTexto}>{confirmandoApagar ? '⚠️ Toque de novo para confirmar' : '🗑️ Apagar transação'}</Text>
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
    // Espaço extra em cima
    paddingTop: 60,
  // Fecha
  },
  // Linha de cima (título + ✕)
  topo: {
    // Lado a lado
    flexDirection: 'row',
    // Título na esquerda, ✕ na direita
    justifyContent: 'space-between',
    // Alinhados no meio
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
  // O ✕
  fechar: {
    // Tamanho
    fontSize: 22,
    // Cinza clarinho
    color: '#A7B8AE',
  // Fecha
  },
  // Caixa dos botões Gasto/Entrada
  seletor: {
    // Lado a lado
    flexDirection: 'row',
    // Fundo um pouco mais claro
    backgroundColor: '#1A2E23',
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
    // Espaço em cima e embaixo
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
  // Rótulos
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
    // Sem espaço interno
    padding: 0,
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
    // Espaço nos lados
    paddingHorizontal: 14,
    // Espaço em cima e embaixo
    paddingVertical: 10,
    // Formato de pílula
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
    // Fundo
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
  // 🆕 Tela de espera (enquanto busca a transação)
  carregando: {
    // Ocupa tudo
    flex: 1,
    // Rodinha no meio, de cima para baixo
    justifyContent: 'center',
    // Rodinha no meio, de um lado ao outro
    alignItems: 'center',
    // Fundo verde bem escuro
    backgroundColor: '#0F1F17',
  // Fecha
  },
  // 🆕 Botão de apagar (discreto)
  botaoApagar: {
    // Espaço acima, para ficar longe do salvar
    marginTop: 16,
    // Espaço interno
    padding: 14,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Borda vermelha
    borderColor: '#E5484D',
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // 🆕 Botão de apagar depois do primeiro toque (alerta!)
  botaoApagarConfirmando: {
    // Fundo vermelho cheio
    backgroundColor: '#E5484D',
  // Fecha
  },
  // 🆕 Texto do botão de apagar
  botaoApagarTexto: {
    // Branco
    color: '#FFFFFF',
    // Negrito
    fontWeight: 'bold',
  // Fecha
  },
// Fecha os estilos
});
