// Importa o useState: a "memória" da tela, para lembrar o que a pessoa digita
import { useState } from 'react';
// Importa as peças da tela: caixa, texto, campo de digitar, botão, rodinha e estilos
import { ActivityIndicator, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
// Importa o telefone do cofre (o "../" quer dizer "volta uma pasta": sai de app e entra em lib)
import { supabase } from '../lib/supabase';

// Função que traduz os erros do cofre (que vêm em inglês) para português
function traduzirErro(mensagem: string) {
  // Se o e-mail ou a senha estiverem errados...
  if (mensagem.includes('Invalid login credentials')) return 'E-mail ou senha incorretos.';
  // Se a senha for curta demais...
  if (mensagem.includes('Password should be')) return 'A senha precisa ter pelo menos 6 caracteres.';
  // Se o e-mail já tiver uma conta...
  if (mensagem.includes('already registered')) return 'Este e-mail já tem conta. Tente entrar.';
  // Se o e-mail estiver escrito errado...
  if (mensagem.includes('invalid')) return 'Confira se o e-mail está escrito certo.';
  // Para qualquer outro erro, mostra uma mensagem geral
  return 'Algo deu errado. Tente de novo.';
// Fecha a função de tradução
}

// Cria a tela de login. "export default" deixa o app encontrar esta tela
export default function TelaLogin() {
  // Post-it do e-mail digitado. Começa vazio
  const [email, setEmail] = useState('');
  // Post-it da senha digitada. Começa vazio
  const [senha, setSenha] = useState('');
  // Post-it de "está carregando?". Começa com "não" (false)
  const [carregando, setCarregando] = useState(false);
  // Post-it da mensagem de aviso. Começa vazio
  const [mensagem, setMensagem] = useState('');
  // Post-it de "está no modo criar conta?". Começa com "não", ou seja, no modo entrar
  const [modoCadastro, setModoCadastro] = useState(false);
  
  // Função que roda quando a pessoa aperta o botão principal
  async function enviar() {
    // Se o e-mail OU a senha estiverem vazios...
    if (!email || !senha) {
      // ...mostra um aviso
      setMensagem('Preencha o e-mail e a senha.');
      // ...e para por aqui
      return;
    // Fecha o "se"
    }
    // Liga a rodinha de carregamento
    setCarregando(true);
    // Apaga qualquer aviso antigo
    setMensagem('');
    // Liga para o cofre e guarda o erro, se houver
    const { error } = modoCadastro
      // SE estiver no modo cadastro: pede para criar conta (trim tira espaços sobrando no e-mail)
      ? await supabase.auth.signUp({ email: email.trim(), password: senha })
      // SE NÃO: pede para entrar
      : await supabase.auth.signInWithPassword({ email: email.trim(), password: senha });
    // Desliga a rodinha
    setCarregando(false);
    // Se o cofre respondeu com erro, mostra o erro traduzido
    if (error) setMensagem(traduzirErro(error.message));
  // Fecha a função enviar
  }
  
  // Devolve o que aparece na tela
  return (
    // Caixa da tela inteira
    <View style={estilos.tela}>

      {/* Emoji grande, servindo de logo por enquanto */}
      <Text style={estilos.logo}>💰</Text>

      {/* Título que muda conforme o modo */}
      <Text style={estilos.titulo}>{modoCadastro ? 'Criar conta' : 'Bem-vindo de volta'}</Text>

      {/* Subtítulo que também muda conforme o modo */}
      <Text style={estilos.subtitulo}>{modoCadastro ? 'Comece a organizar seu dinheiro hoje' : 'Entre para ver suas finanças'}</Text>

      {/* Campo para digitar o e-mail */}
      <TextInput
        // Aplica o estilo do campo
        style={estilos.campo}
        // Texto cinza que aparece quando o campo está vazio
        placeholder="Seu e-mail"
        // Cor desse texto cinza
        placeholderTextColor="#6B7F73"
        // O campo mostra o que está no post-it do e-mail
        value={email}
        // Cada letra digitada atualiza o post-it
        onChangeText={setEmail}
        // Abre o teclado que tem o @
        keyboardType="email-address"
        // Não deixa a primeira letra maiúscula automaticamente
        autoCapitalize="none"
        // Deixa o celular sugerir o e-mail que já está salvo nele
        autoComplete="email"
      // Fecha o campo de e-mail
      />

      {/* Campo para digitar a senha */}
      <TextInput
        // Mesmo estilo do campo de e-mail
        style={estilos.campo}
        // Texto cinza quando está vazio
        placeholder="Sua senha"
        // Cor do texto cinza
        placeholderTextColor="#6B7F73"
        // Mostra o que está no post-it da senha
        value={senha}
        // Cada letra digitada atualiza o post-it da senha
        onChangeText={setSenha}
        // Esconde a senha com bolinhas ●●●
        secureTextEntry
        // Deixa o celular sugerir a senha salva
        autoComplete="password"
      // Fecha o campo de senha
      />

      {/* Se tiver alguma mensagem de aviso, mostra ela (o && quer dizer "só se") */}
      {mensagem !== '' && <Text style={estilos.mensagem}>{mensagem}</Text>}

      {/* Botão principal */}
      <Pressable
        // Usa o estilo do botão e, se estiver carregando, deixa ele "apagadinho"
        style={[estilos.botao, carregando && estilos.botaoDesativado]}
        // Ao tocar, roda a função enviar (o cérebro do Pedaço 4)
        onPress={enviar}
        // Trava o botão enquanto carrega
        disabled={carregando}
      // Fecha a abertura do botão
      >
        {/* Se estiver carregando, mostra a rodinha. Se não, mostra o texto */}
        {carregando ? <ActivityIndicator color="#FFFFFF" /> : <Text style={estilos.botaoTexto}>{modoCadastro ? 'Criar conta' : 'Entrar'}</Text>}
      {/* Fecha o botão */}
      </Pressable>

      {/* Link para trocar de modo: inverte o post-it e apaga o aviso antigo */}
      <Pressable onPress={() => { setModoCadastro(!modoCadastro); setMensagem(''); }}>
        {/* Texto do link, que muda conforme o modo */}
        <Text style={estilos.link}>{modoCadastro ? 'Já tem conta? Entrar' : 'Não tem conta? Criar agora'}</Text>
      {/* Fecha o link */}
      </Pressable>

    {/* Fecha a caixa da tela */}
    </View>
  // Fecha o return
  );
// Fecha a tela de login
}

// Estilos: a "roupa" da tela
const estilos = StyleSheet.create({
  // Tela inteira
  tela: {
    // Ocupa a tela toda
    flex: 1,
    // Fundo verde bem escuro
    backgroundColor: '#0F1F17',
    // Espaço nas bordas
    padding: 24,
    // Coloca tudo no meio da tela, de cima para baixo
    justifyContent: 'center',
  // Fecha
  },
  // Emoji do logo
  logo: {
    // Bem grande
    fontSize: 56,
    // Centralizado
    textAlign: 'center',
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Título
  titulo: {
    // Letra grande
    fontSize: 28,
    // Negrito
    fontWeight: 'bold',
    // Branca
    color: '#FFFFFF',
    // Centralizado
    textAlign: 'center',
  // Fecha
  },
  // Subtítulo
  subtitulo: {
    // Letra média
    fontSize: 16,
    // Cinza clarinho
    color: '#A7B8AE',
    // Centralizado
    textAlign: 'center',
    // Espaço acima
    marginTop: 4,
    // Espaço abaixo, para afastar dos campos
    marginBottom: 32,
  // Fecha
  },
  // Campos de digitar
  campo: {
    // Fundo um pouco mais claro que a tela
    backgroundColor: '#1A2E23',
    // Cor da letra digitada
    color: '#FFFFFF',
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Tamanho da letra
    fontSize: 16,
    // Espaço entre um campo e outro
    marginBottom: 12,
    // Espessura da borda
    borderWidth: 1,
    // Cor da borda
    borderColor: '#2A4234',
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
  // Botão principal
  botao: {
    // Verde vivo
    backgroundColor: '#1E8E5A',
    // Espaço interno
    padding: 16,
    // Pontas arredondadas
    borderRadius: 14,
    // Centraliza o texto do botão
    alignItems: 'center',
    // Espaço acima
    marginTop: 8,
  // Fecha
  },
  // Botão enquanto carrega
  botaoDesativado: {
    // Meio transparente
    opacity: 0.6,
  // Fecha
  },
  // Texto do botão
  botaoTexto: {
    // Branco
    color: '#FFFFFF',
    // Negrito
    fontWeight: 'bold',
    // Tamanho
    fontSize: 16,
  // Fecha
  },
  // Link de trocar de modo
  link: {
    // Verde claro
    color: '#4ADE80',
    // Centralizado
    textAlign: 'center',
    // Espaço acima
    marginTop: 20,
    // Tamanho
    fontSize: 15,
  // Fecha
  },
// Fecha os estilos
});