// ============ PARTE 1: AS FERRAMENTAS ============
// Importa a memória da tela (os post-its)
import { useState } from 'react';
// Importa as peças da tela
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o pincel de degradê (para o botão de ouro)
import { LinearGradient } from 'expo-linear-gradient';
// Importa o GPS do app (para ir até a tela de recuperar a senha)
import { router } from 'expo-router';
// Importa o logo (o @/ é um atalho que quer dizer "a partir da pasta src")
// Importa o GPS do app (para ir até a tela de recuperar a senha)
import Logo from '@/components/logo';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa o guarda-roupa
import { cores, degradeOuro, fontes } from '../lib/tema';

// ============ PARTE 2: O TRADUTOR DE ERROS ============
// Traduz os erros do cofre (em inglês) para português, explicando o que fazer
function traduzirErro(mensagem: string) {
  // E-mail ou senha errados
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos. Confira e tente de novo.';
  // Senha curta demais
  if (mensagem.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
  // E-mail já cadastrado
  if (mensagem.includes('already registered')) return 'Este e-mail já tem conta. Toque em "Entrar" lá embaixo.';
  // E-mail escrito errado
  if (mensagem.includes('invalid')) return 'Confira se o e-mail está escrito certo.';
  // Qualquer outro erro
  return 'Não foi possível entrar agora. Confira sua internet e tente de novo.';
// Fecha o tradutor
}

// ============ PARTE 3: AS MEMÓRIAS E O CÉREBRO ============
// Cria a tela de login
export default function TelaLogin() {
  // 🆕 Post-it do nome digitado (só usado no cadastro)
  const [nome, setNome] = useState('');
  // Post-it do e-mail digitado
  const [email, setEmail] = useState('');
  // Post-it da senha digitada
  const [senha, setSenha] = useState('');
  // Post-it de "está carregando?"
  const [carregando, setCarregando] = useState(false);
  // Post-it da mensagem de aviso
  const [mensagem, setMensagem] = useState('');
  // Post-it de "está no modo criar conta?"
  const [modoCadastro, setModoCadastro] = useState(false);
  // 🆕 Post-it de "em qual campo a pessoa está digitando?" (agora também pode ser o nome)
  const [campoAtivo, setCampoAtivo] = useState<'nome' | 'email' | 'senha' | null>(null);

  // Função que roda quando aperta o botão de ouro
  async function enviar() {
    // 🆕 No cadastro, se o nome tiver menos de 2 letras...
    if (modoCadastro && nome.trim().length < 2) {
      // ...avisa
      setMensagem('Digite seu nome para a gente saber como te chamar.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Se faltou e-mail ou senha...
    if (!email || !senha) {
      // ...avisa
      setMensagem('Preencha o e-mail e a senha.');
      // ...e para
      return;
    // Fecha o "se"
    }
    // Liga a rodinha
    setCarregando(true);
    // Apaga avisos antigos
    setMensagem('');
    // Pede ao cofre: criar conta (se modo cadastro) ou entrar (se não)
    const { error } = modoCadastro
      // 🆕 Criar conta, guardando o nome no "bolsinho" do crachá (user_metadata)
      ? await supabase.auth.signUp({ email: email.trim(), password: senha, options: { data: { nome: nome.trim() } } })
      // Entrar
      : await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    // Desliga a rodinha
    setCarregando(false);
    // Se deu erro, mostra traduzido (se deu certo, o porteiro leva a pessoa para dentro)
    if (error) setMensagem(traduzirErro(error.message));
  // Fecha a função enviar
  }

  // ============ PARTE 4: O DESENHO DA TELA ============
  // Devolve o que aparece na tela
  return (
    // A tela inteira
    <View style={estilos.tela}>
      {/* Caixa do formulário (no computador, fica com largura de celular) */}
      <View style={estilos.caixa}>

        {/* O logo, no meio */}
        <View style={estilos.logo}>
          {/* A peça de Lego do logo */}
          <Logo tamanho={96} />
        {/* Fecha o logo */}
        </View>

        {/* O nome: "Finance" em marfim e "Help" em ouro */}
        <Text style={estilos.marca}>Finance<Text style={{ color: cores.ouro }}>Help</Text></Text>
        {/* O slogan */}
        <Text style={estilos.slogan}>Cada real no seu lugar.</Text>

        {/* 🆕 O campo de nome: SÓ aparece no modo cadastro */}
        {modoCadastro && (
          // Caixa do campo de nome
          <View>
            {/* Rótulo do nome */}
            <Text style={estilos.rotulo}>Seu nome</Text>
            {/* Campo do nome */}
            <TextInput
              // Roupa do campo + borda dourada se estiver digitando aqui
              style={[estilos.campo, campoAtivo === 'nome' && estilos.campoAtivo]}
              // Exemplo quando vazio
              placeholder="Como você quer ser chamado"
              // Cor do exemplo
              placeholderTextColor={cores.apagado}
              // Mostra o post-it
              value={nome}
              // Atualiza o post-it
              onChangeText={setNome}
              // Quando tocar no campo, marca como ativo
              onFocus={() => setCampoAtivo('nome')}
              // Quando sair, desmarca
              onBlur={() => setCampoAtivo(null)}
              // Primeira letra de cada palavra maiúscula (bom para nomes)
              autoCapitalize="words"
              // Sugere o nome salvo no celular (Android)
              autoComplete="name"
              // Sugere o nome salvo no celular (iPhone)
              textContentType="name"
            // Fecha o campo do nome
            />
          {/* Fecha a caixa do campo de nome */}
          </View>
        // Fecha o "só no modo cadastro"
        )}

        {/* Rótulo do e-mail */}
        <Text style={estilos.rotulo}>E-mail</Text>
        {/* Campo do e-mail */}
        <TextInput
          // Roupa do campo + borda dourada se estiver digitando aqui
          style={[estilos.campo, campoAtivo === 'email' && estilos.campoAtivo]}
          // Exemplo quando vazio
          placeholder="seuemail@exemplo.com"
          // Cor do exemplo
          placeholderTextColor={cores.apagado}
          // Mostra o post-it
          value={email}
          // Atualiza o post-it
          onChangeText={setEmail}
          // Quando tocar no campo, marca como ativo
          onFocus={() => setCampoAtivo('email')}
          // Quando sair, desmarca
          onBlur={() => setCampoAtivo(null)}
          // Teclado com @
          keyboardType="email-address"
          // Sem letra maiúscula automática
          autoCapitalize="none"
          // Sugere o e-mail salvo (Android)
          autoComplete="email"
          // Sugere o e-mail salvo (iPhone)
          textContentType="emailAddress"
        // Fecha o campo do e-mail
        />

        {/* Rótulo da senha */}
        <Text style={estilos.rotulo}>Senha</Text>
        {/* Campo da senha */}
        <TextInput
          // Roupa do campo + borda dourada se estiver digitando aqui
          style={[estilos.campo, campoAtivo === 'senha' && estilos.campoAtivo]}
          // Exemplo quando vazio
          placeholder="Mínimo de 6 caracteres"
          // Cor do exemplo
          placeholderTextColor={cores.apagado}
          // Mostra o post-it
          value={senha}
          // Atualiza o post-it
          onChangeText={setSenha}
          // Quando tocar no campo, marca como ativo
          onFocus={() => setCampoAtivo('senha')}
          // Quando sair, desmarca
          onBlur={() => setCampoAtivo(null)}
          // Esconde a senha com bolinhas
          secureTextEntry
          // Sugere a senha salva (Android)
          autoComplete="password"
          // Sugere a senha salva (iPhone)
          textContentType="password"
        // Fecha o campo da senha
        />

               {/* Link "Esqueci minha senha": SÓ aparece no modo entrar */}
        {!modoCadastro && (
          // O link, alinhado à direita
          <Pressable onPress={() => router.push('/esqueci-senha')} hitSlop={8} style={estilos.esqueciToque}>
            {/* Texto do link */}
            <Text style={estilos.esqueci}>Esqueci minha senha</Text>
          {/* Fecha o link */}
          </Pressable>
        // Fecha o "só no modo entrar"
        )}
        {/* Se tiver aviso, mostra em coral */}
        {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

        {/* O botão de ouro: fica mais transparente enquanto o dedo aperta */}
        <Pressable onPress={enviar} disabled={carregando} style={({ pressed }) => [estilos.botaoToque, (pressed || carregando) && { opacity: 0.75 }]}>
          {/* O degradê dourado, na diagonal */}
          <LinearGradient colors={degradeOuro} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={estilos.botao}>
            {/* Rodinha (se carregando) ou o texto do botão */}
            {carregando ? <ActivityIndicator color={cores.ouroTinta} /> : <Text style={estilos.botaoTexto}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>}
          {/* Fecha o degradê */}
          </LinearGradient>
        {/* Fecha o botão */}
        </Pressable>

        {/* Link para trocar de modo (e apaga o aviso antigo) */}
        <Pressable onPress={() => { setModoCadastro(!modoCadastro); setMensagem(''); }} hitSlop={8}>
          {/* A pergunta em prata e a ação em ouro */}
          <Text style={estilos.link}>{modoCadastro ? 'Já tem conta? ' : 'Ainda não tem conta? '}<Text style={estilos.linkDestaque}>{modoCadastro ? 'Entrar' : 'Criar conta'}</Text></Text>
        {/* Fecha o link */}
        </Pressable>

      {/* Fecha a caixa do formulário */}
      </View>
    {/* Fecha a tela */}
    </View>
  // Fecha o return
  );
// Fecha a tela de login
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
    // Ocupa a largura toda até esse limite
    width: '100%',
    // Fica centralizada
    alignSelf: 'center',
  // Fecha
  },
  // Lugar do logo
  logo: {
    // Logo no meio
    alignItems: 'center',
    // Espaço abaixo
    marginBottom: 14,
  // Fecha
  },
  // O nome do app
  marca: {
    // Letra do painel da bolsa, bem grossa
    fontFamily: fontes.marca,
    // Grande
    fontSize: 44,
    // Marfim
    color: cores.marfim,
    // Centralizado
    textAlign: 'center',
  // Fecha
  },
  // O slogan
  slogan: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 16,
    // Prata
    color: cores.prata,
    // Centralizado
    textAlign: 'center',
    // Espaço abaixo, para afastar do formulário
    marginBottom: 32,
  // Fecha
  },
  // Rótulos dos campos
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
    // Cor da letra digitada
    color: cores.marfim,
    // Tamanho da letra
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
  // Campo onde a pessoa está digitando
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
  // A área de toque do botão
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
  // Texto do botão de ouro
  botaoTexto: {
    // Letra simples, negrito
    fontFamily: fontes.textoNegrito,
    // Tamanho
    fontSize: 16,
    // Tinta escura
    color: cores.ouroTinta,
  // Fecha
  },
  // O link de trocar de modo
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
    marginTop: 22,
  // Fecha
  },
  // A parte dourada do link
  linkDestaque: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Dourado
    color: cores.ouro,
  // Fecha
  },
  // Área de toque do "Esqueci minha senha"
  esqueciToque: {
    // Alinhado à direita
    alignSelf: 'flex-end',
    // Sobe um pouquinho, para ficar mais perto do campo de senha
    marginTop: -6,
    // Espaço abaixo
    marginBottom: 16,
  // Fecha
  },
  // Texto do "Esqueci minha senha"
  esqueci: {
    // Letra simples, forte
    fontFamily: fontes.textoForte,
    // Tamanho
    fontSize: 14,
    // Dourado
    color: cores.ouro,
  // Fecha
  },
  // Fecha os estilos
});