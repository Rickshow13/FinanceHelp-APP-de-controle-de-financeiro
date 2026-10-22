// ============ AS FERRAMENTAS ============
// Importa a memória (useState) e o guardador de função (useCallback)
import { useCallback, useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o avisador de tela visível
import Ionicons from '@expo/vector-icons/Ionicons';
import { router, useFocusEffect } from 'expo-router'; // Importa o telefone do cofre
import { supabase } from '../../lib/supabase';
// Importa o guarda-roupa
import { cores, fontes } from '../../lib/tema';

// ============ AS MEMÓRIAS ============
// Cria a tela de perfil
export default function TelaPerfil() {
  // Post-it do nome
  const [nome, setNome] = useState('');
  // Post-it do e-mail
  const [email, setEmail] = useState('');
  // Post-it de "já deu o primeiro toque no apagar?"
  const [confirmandoApagar, setConfirmandoApagar] = useState(false);
  // Post-it de "está apagando?"
  const [apagando, setApagando] = useState(false);
  // Post-it da mensagem de erro
  const [mensagem, setMensagem] = useState('');

  // Toda vez que a tela aparecer, lê o crachá
  useFocusEffect(
    // Guarda a função
    useCallback(() => {
      // Pega o crachá guardado no celular (não precisa de internet)
      supabase.auth.getSession().then(({ data }) => {
        // Lê o nome do bolsinho (se não tiver, fica vazio)
        setNome(data.session?.user.user_metadata?.nome ?? '');
        // Lê o e-mail (se não tiver, fica vazio)
        setEmail(data.session?.user.email ?? '');
      // Fecha a leitura do crachá
      });
      // Quando a pessoa sai da tela, o botão de apagar volta ao normal
      return () => setConfirmandoApagar(false);
    // Não depende de nada
    }, [])
  // Fecha o avisador
  );

  // A inicial para a bolinha: primeira letra do nome (ou do e-mail), maiúscula
  const inicial = (nome || email || '?').charAt(0).toUpperCase();

  // ============ O CÉREBRO DO APAGAR ============
  // Função que roda quando aperta "Apagar minha conta"
  async function apagarConta() {
    // Se é o PRIMEIRO toque...
    if (!confirmandoApagar) {
      // ...só muda o botão para o alerta
      setConfirmandoApagar(true);
      // ...e para, sem apagar
      return;
    // Fecha o "se"
    }
    // Segundo toque: liga a rodinha
    setApagando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Chama o "funcionário de confiança" que mora no cofre (rpc = chamar uma função do cofre)
    const { error } = await supabase.rpc('apagar_minha_conta');
    // Se deu erro...
    if (error) {
      // ...desliga a rodinha
      setApagando(false);
      // ...volta o botão ao normal
      setConfirmandoApagar(false);
      // ...avisa
      setMensagem('Não foi possível apagar a conta agora. Confira sua internet e tente de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Apagou: joga fora o crachá guardado no celular (sem avisar o cofre, porque a conta não existe mais)
    await supabase.auth.signOut({ scope: 'local' });
    // O porteiro percebe que não tem mais crachá e leva para o login sozinho
  // Fecha a função
  }

  // ============ O DESENHO ============
  // Devolve o que aparece na tela
  return (
    // Caixa que rola
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Título */}
      <Text style={estilos.titulo}>Perfil</Text>

      {/* Cartão com a bolinha, o nome e o e-mail */}
      <View style={estilos.cartao}>
        {/* A bolinha dourada com a inicial */}
        <View style={estilos.avatar}>
          {/* A inicial */}
          <Text style={estilos.avatarTexto}>{inicial}</Text>
        {/* Fecha a bolinha */}
        </View>
        {/* Nome e e-mail (ocupa o espaço que sobrar) */}
        <View style={{ flex: 1 }}>
          {/* O nome (se não tiver, mostra "Sem nome") */}
          <Text style={estilos.nome} numberOfLines={1}>{nome || 'Sem nome'}</Text>
          {/* O e-mail */}
          <Text style={estilos.email} numberOfLines={1}>{email}</Text>
        {/* Fecha nome e e-mail */}
        </View>
      {/* Fecha o cartão */}
      </View>

      {/* Botão de sair */}
      <Pressable style={estilos.botaoSair} onPress={() => supabase.auth.signOut()}>
        {/* Ícone da porta de saída */}
        <Ionicons name="log-out-outline" size={20} color={cores.marfim} />
        {/* Texto */}
        <Text style={estilos.botaoSairTexto}>Sair da conta</Text>
      {/* Fecha o botão de sair */}
      </Pressable>

          {/* Botão da política de privacidade (usa a mesma roupa do botão de sair) */}
      <Pressable style={estilos.botaoSair} onPress={() => router.push('/privacidade')}>
        {/* Ícone de escudo */}
        <Ionicons name="shield-checkmark-outline" size={20} color={cores.marfim} />
        {/* Texto */}
        <Text style={estilos.botaoSairTexto}>Política de privacidade</Text>
      {/* Fecha o botão */}
      </Pressable>
      {/* A zona de perigo: apagar a conta */}
      <Text style={estilos.secao}>Apagar conta</Text>
      {/* Explicação clara do que vai acontecer */}
      <Text style={estilos.explicacao}>Apaga sua conta e todas as suas movimentações para sempre. Não dá para desfazer.</Text>

      {/* Se tiver aviso, mostra em coral */}
      {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

      {/* Botão de apagar: fica coral cheio depois do primeiro toque */}
      <Pressable style={[estilos.botaoApagar, confirmandoApagar && estilos.botaoApagarConfirmando]} onPress={apagarConta} disabled={apagando}>
        {/* Rodinha (se apagando) ou ícone + texto */}
        {apagando ? <ActivityIndicator color={cores.coralTinta} /> : (
          // Ícone e texto lado a lado
          <View style={estilos.linhaBotao}>
            {/* Ícone: lixeira ou alerta */}
            <Ionicons name={confirmandoApagar ? 'alert-circle-outline' : 'trash-outline'} size={18} color={confirmandoApagar ? cores.coralTinta : cores.coral} />
            {/* Texto, que muda depois do primeiro toque */}
            <Text style={[estilos.botaoApagarTexto, { color: confirmandoApagar ? cores.coralTinta : cores.coral }]}>{confirmandoApagar ? 'Toque de novo para apagar para sempre' : 'Apagar minha conta'}</Text>
          {/* Fecha ícone e texto */}
          </View>
        // Fecha a escolha
        )}
      {/* Fecha o botão de apagar */}
      </Pressable>

    {/* Fecha a caixa que rola */}
    </ScrollView>
  // Fecha o return
  );
// Fecha a tela
}

// ============ A ROUPA (ESTILOS) ============
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
  // Título
  titulo: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 32,
    // Marfim
    color: cores.marfim,
    // Espaço abaixo
    marginBottom: 20,
  // Fecha
  },
  // Cartão do perfil
  cartao: {
    // Bolinha e texto lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre a bolinha e o texto
    gap: 14,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Borda fina
    borderWidth: 1,
    // Cor da borda
    borderColor: cores.grafiteBorda,
    // Pontas arredondadas
    borderRadius: 18,
    // Espaço interno
    padding: 16,
  // Fecha
  },
  // A bolinha dourada
  avatar: {
    // Largura
    width: 52,
    // Altura
    height: 52,
    // Redonda
    borderRadius: 26,
    // Dourada
    backgroundColor: cores.ouro,
    // Letra no meio (horizontal)
    alignItems: 'center',
    // Letra no meio (vertical)
    justifyContent: 'center',
  // Fecha
  },
  // A inicial dentro da bolinha
  avatarTexto: {
    // Letra do painel da bolsa
    fontFamily: fontes.marca,
    // Tamanho
    fontSize: 26,
    // Tinta escura (para ler bem em cima do dourado)
    color: cores.ouroTinta,
  // Fecha
  },
  // O nome
  nome: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 17,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // O e-mail
  email: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 14,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 2,
  // Fecha
  },
  // Botão de sair
  botaoSair: {
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
    padding: 15,
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
  // Texto do botão de sair
  botaoSairTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 15,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Título da zona de perigo
  secao: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Tamanho
    fontSize: 22,
    // Marfim
    color: cores.marfim,
    // Bastante espaço acima, para separar bem do resto
    marginTop: 48,
  // Fecha
  },
  // Explicação da zona de perigo
  explicacao: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Espaço entre linhas
    lineHeight: 22,
    // Espaço acima
    marginTop: 6,
    // Espaço abaixo
    marginBottom: 14,
  // Fecha
  },
  // Mensagem de erro
  mensagem: {
    // Letra simples
    fontFamily: fontes.texto,
    // Coral
    color: cores.coral,
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Botão de apagar
  botaoApagar: {
    // Espaço interno
    padding: 15,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Borda coral
    borderColor: cores.coral,
    // Conteúdo no meio
    alignItems: 'center',
  // Fecha
  },
  // Botão de apagar depois do primeiro toque
  botaoApagarConfirmando: {
    // Fundo coral cheio
    backgroundColor: cores.coral,
  // Fecha
  },
  // Ícone e texto do botão de apagar
  linhaBotao: {
    // Lado a lado
    flexDirection: 'row',
    // Alinhados no meio
    alignItems: 'center',
    // Espaço entre eles
    gap: 8,
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