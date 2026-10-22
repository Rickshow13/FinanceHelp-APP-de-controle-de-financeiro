// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória da tela (os post-its)
import { useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o GPS do app
import { router } from 'expo-router';
// Importa o pincel de degradê (para o botão de ouro)
import { LinearGradient } from 'expo-linear-gradient';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa o guarda-roupa
import { cores, degradeOuro, fontes } from '../lib/tema';

// ============ PARTE 2: AS MEMÓRIAS ============
// Cria a tela de recuperar a senha
export default function EsqueciSenha() {
  // Post-it da etapa: 'email' (pedir o código) ou 'codigo' (digitar o código e a senha nova)
  const [etapa, setEtapa] = useState<'email' | 'codigo'>('email');
  // Post-it do e-mail
  const [email, setEmail] = useState('');
  // Post-it do código que chegou por e-mail
  const [codigo, setCodigo] = useState('');
  // Post-it da senha nova
  const [novaSenha, setNovaSenha] = useState('');
  // Post-it de "está carregando?"
  const [carregando, setCarregando] = useState(false);
  // Post-it da mensagem de aviso (erro)
  const [mensagem, setMensagem] = useState('');
  // Post-it de qual campo está ativo (para a borda dourada)
  const [campoAtivo, setCampoAtivo] = useState<'email' | 'codigo' | 'senha' | null>(null);

  // ============ PARTE 3: OS CÉREBROS ============
  // Volta para o login
  function voltar() {
    // Se tiver tela anterior, volta. Se não, vai para o login
    if (router.canGoBack()) router.back(); else router.replace('/login');
  // Fecha
  }

  // Etapa 1: pede ao cofre para mandar o código por e-mail
  async function enviarCodigo() {
    // Se o e-mail estiver vazio...
    if (!email.trim()) {
      // ...avisa
      setMensagem('Digite o e-mail da sua conta.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Liga a rodinha
    setCarregando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Pede ao cofre: "manda o e-mail de redefinir senha para este endereço"
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim());
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro (ex: muitos pedidos seguidos)...
    if (error) {
      // ...avisa
      setMensagem('Não foi possível enviar o código agora. Espere alguns minutos e tente de novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Deu certo: vai para a etapa do código
    setEtapa('codigo');
  // Fecha a etapa 1
  }

  // Etapa 2: confere o código e troca a senha
  async function salvarNovaSenha() {
    // Se o código estiver vazio...
    if (!codigo.trim()) {
      // ...avisa
      setMensagem('Digite o código que chegou no seu e-mail.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Se a senha nova for curta demais...
    if (novaSenha.length < 6) {
      // ...avisa
      setMensagem('A senha nova precisa ter pelo menos 6 caracteres.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Liga a rodinha
    setCarregando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Passo 1: pergunta ao cofre se o código está certo (OTP = senha de uso único)
    const conferencia = await supabase.auth.verifyOtp({ email: email.trim(), token: codigo.trim(), type: 'recovery' });
    // Se o código estiver errado ou vencido...
    if (conferencia.error) {
      // ...desliga a rodinha
      setCarregando(false);
      // ...avisa
      setMensagem('Código errado ou vencido. Confira o e-mail ou peça um código novo.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Passo 2: troca a senha pela nova
    const troca = await supabase.auth.updateUser({ password: novaSenha });
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro na troca...
    if (troca.error) {
      // ...avisa
      setMensagem('Não foi possível salvar a senha nova. Tente uma senha diferente.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Deu tudo certo: vai para a tela inicial (o replace tira esta tela da pilha)
    router.replace('/');
  // Fecha a etapa 2
  }

  // ============ PARTE 4: O DESENHO ============
  // Devolve o que aparece na tela
  return (
    // A tela inteira
    <View style={estilos.tela}>
      {/* Caixa do formulário (no computador, fica com largura de celular) */}
      <View style={estilos.caixa}>

        {/* Título */}
        <Text style={estilos.titulo}>Criar uma nova senha</Text>
        {/* Explicação, que muda conforme a etapa */}
        <Text style={estilos.explicacao}>{etapa === 'email' ? 'Digite o e-mail da sua conta. Vamos enviar um código de 6 números para você criar uma senha nova.' : `Se existir uma conta com ${email.trim()}, enviamos um código. Confira também a caixa de spam.`}</Text>

        {/* ETAPA 1: o campo de e-mail */}
        {etapa === 'email' && (
          // Caixa da etapa 1
          <View>
            {/* Rótulo */}
            <Text style={estilos.rotulo}>E-mail</Text>
            {/* Campo do e-mail */}
            <TextInput
              // Roupa + borda dourada se ativo
              style={[estilos.campo, campoAtivo === 'email' && estilos.campoAtivo]}
              // Exemplo
              placeholder="seuemail@exemplo.com"
              // Cor do exemplo
              placeholderTextColor={cores.apagado}
              // Mostra o post-it
              value={email}
              // Atualiza o post-it
              onChangeText={setEmail}
              // Marca como ativo
              onFocus={() => setCampoAtivo('email')}
              // Desmarca
              onBlur={() => setCampoAtivo(null)}
              // Teclado com @
              keyboardType="email-address"
              // Sem maiúscula automática
              autoCapitalize="none"
              // Sugere o e-mail salvo
              autoComplete="email"
            // Fecha o campo
            />
          {/* Fecha a caixa da etapa 1 */}
          </View>
        // Fecha a etapa 1
        )}

        {/* ETAPA 2: o código e a senha nova */}
        {etapa === 'codigo' && (
          // Caixa da etapa 2
          <View>
            {/* Rótulo do código */}
            <Text style={estilos.rotulo}>Código do e-mail</Text>
            {/* Campo do código */}
            <TextInput
              // Roupa + borda dourada se ativo + letra grande e espaçada
              style={[estilos.campo, estilos.campoCodigo, campoAtivo === 'codigo' && estilos.campoAtivo]}
              // Exemplo
              placeholder="000000"
              // Cor do exemplo
              placeholderTextColor={cores.apagado}
              // Mostra o post-it
              value={codigo}
              // Atualiza o post-it
              onChangeText={setCodigo}
              // Marca como ativo
              onFocus={() => setCampoAtivo('codigo')}
              // Desmarca
              onBlur={() => setCampoAtivo(null)}
              // Teclado só de números
              keyboardType="number-pad"
              // Deixa o celular preencher o código sozinho, se ele aparecer numa notificação
              autoComplete="one-time-code"
              // No máximo 10 números
              maxLength={10}
            // Fecha o campo
            />
            {/* Rótulo da senha nova */}
            <Text style={estilos.rotulo}>Senha nova</Text>
            {/* Campo da senha nova */}
            <TextInput
              // Roupa + borda dourada se ativo
              style={[estilos.campo, campoAtivo === 'senha' && estilos.campoAtivo]}
              // Exemplo
              placeholder="Mínimo de 6 caracteres"
              // Cor do exemplo
              placeholderTextColor={cores.apagado}
              // Mostra o post-it
              value={novaSenha}
              // Atualiza o post-it
              onChangeText={setNovaSenha}
              // Marca como ativo
              onFocus={() => setCampoAtivo('senha')}
              // Desmarca
              onBlur={() => setCampoAtivo(null)}
              // Esconde com bolinhas
              secureTextEntry
              // Avisa o celular que é uma senha NOVA (ele pode sugerir uma senha forte)
              autoComplete="new-password"
            // Fecha o campo
            />
          {/* Fecha a caixa da etapa 2 */}
          </View>
        // Fecha a etapa 2
        )}

        {/* Se tiver aviso, mostra em coral */}
        {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

        {/* O botão de ouro: "Enviar código" ou "Salvar nova senha" */}
        <Pressable onPress={etapa === 'email' ? enviarCodigo : salvarNovaSenha} disabled={carregando} style={({ pressed }) => [estilos.botaoToque, (pressed || carregando) && { opacity: 0.75 }]}>
          {/* O degradê dourado */}
          <LinearGradient colors={degradeOuro} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.botao}>
            {/* Rodinha ou texto */}
            {carregando ? <ActivityIndicator color={cores.ouroTinta} /> : <Text style={estilos.botaoTexto}>{etapa === 'email' ? 'Enviar código' : 'Salvar nova senha'}</Text>}
          {/* Fecha o degradê */}
          </LinearGradient>
        {/* Fecha o botão */}
        </Pressable>

        {/* Na etapa 2: link para pedir outro código (volta para a etapa 1) */}
        {etapa === 'codigo' && (
          // O link
          <Pressable onPress={() => { setEtapa('email'); setCodigo(''); setMensagem(''); }} hitSlop={8}>
            {/* Texto do link */}
            <Text style={estilos.link}>Não chegou? <Text style={estilos.linkDestaque}>Pedir outro código</Text></Text>
          {/* Fecha o link */}
          </Pressable>
        // Fecha o "só na etapa 2"
        )}

        {/* Link para voltar ao login */}
        <Pressable onPress={voltar} hitSlop={8}>
          {/* Texto do link */}
          <Text style={estilos.link}>Lembrou a senha? <Text style={estilos.linkDestaque}>Voltar para o login</Text></Text>
        {/* Fecha o link */}
        </Pressable>

      {/* Fecha a caixa do formulário */}
      </View>
    {/* Fecha a tela */}
    </View>
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
    // Conteúdo no meio, de cima para baixo
    justifyContent: 'center',
    // Espaço nas bordas
    padding: 24,
  // Fecha
  },
  // Caixa do formulário
  caixa: {
    // No computador, não passa de 420 de largura
    maxWidth: 420,
    // Ocupa a largura toda até o limite
    width: '100%',
    // Centralizada
    alignSelf: 'center',
  // Fecha
  },
  // Título
  titulo: {
    // Letra do painel da bolsa (títulos)
    fontFamily: fontes.marcaTitulo,
    // Grande
    fontSize: 34,
    // Marfim
    color: cores.marfim,
  // Fecha
  },
  // Explicação
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
    marginTop: 8,
    // Espaço abaixo
    marginBottom: 28,
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
    marginBottom: 6,
  // Fecha
  },
  // Campos de digitar
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
  // O campo do código: números grandes e espaçados
  campoCodigo: {
    // Letra do painel da bolsa
    fontFamily: fontes.marca,
    // Grande
    fontSize: 30,
    // Espaço entre os números
    letterSpacing: 6,
    // Centralizado
    textAlign: 'center',
  // Fecha
  },
  // Campo ativo
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
    // Espaço entre linhas
    lineHeight: 20,
  // Fecha
  },
  // Área de toque do botão
  botaoToque: {
    // Pontas arredondadas
    borderRadius: 14,
    // Corta o degradê nas pontas
    overflow: 'hidden',
    // Espaço acima
    marginTop: 4,
  // Fecha
  },
  // O degradê do botão
  botao: {
    // Espaço em cima e embaixo
    paddingVertical: 16,
    // Texto no meio
    alignItems: 'center',
  // Fecha
  },
  // Texto do botão
  botaoTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
    // Tinta escura
    color: cores.ouroTinta,
  // Fecha
  },
  // Links
  link: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Centralizado
    textAlign: 'center',
    // Espaço acima
    marginTop: 20,
  // Fecha
  },
  // Parte dourada dos links
  linkDestaque: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Dourado
    color: cores.ouro,
  // Fecha
  },
// Fecha os estilos
});