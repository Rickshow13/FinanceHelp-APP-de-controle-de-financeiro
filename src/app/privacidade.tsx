// ============ AS FERRAMENTAS ============
// Importa as peças da tela
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
// Importa o GPS do app
import { router } from 'expo-router';
// Importa a caixa de ícones
import Ionicons from '@expo/vector-icons/Ionicons';
// Importa o guarda-roupa
import { cores, fontes } from '../lib/tema';

// ============ PARTE 1: OS DADOS DE VOCÊS (PREENCHA AQUI!) ============
// ✏️ Quem cuida do app (coloque o sobrenome do Ítalo)
const RESPONSAVEIS = 'Henrique Gava e Ítalo [sobrenome]';
// ✏️ O e-mail para as pessoas falarem com vocês sobre os dados delas
const EMAIL_CONTATO = 'seu-email@exemplo.com';
// ✏️ A data da última mudança neste texto
const ATUALIZADA_EM = '22 de outubro de 2026';

// ============ PARTE 2: AS SEÇÕES (PERGUNTA E RESPOSTA) ============
// A lista de seções da política
const SECOES = [
  // Seção 1: quem é responsável
  { titulo: 'Quem cuida dos seus dados', texto: `O FinanceHelp é desenvolvido por ${RESPONSAVEIS}, que são os responsáveis pelos dados tratados no app. Para qualquer assunto sobre os seus dados, fale com a gente em ${EMAIL_CONTATO}.` },
  // Seção 2: o que é guardado
  { titulo: 'Quais dados guardamos', texto: 'Seu nome, seu e-mail e sua senha. A senha é guardada de forma criptografada: nem nós conseguimos ver. Também guardamos as movimentações que você registra: tipo (gasto ou entrada), valor, categoria, descrição e data.' },
  // Seção 3: para que serve
  { titulo: 'Para que usamos', texto: 'Para mostrar seus registros, gráficos e dicas, e para enviar o código de recuperação quando você esquece a senha. Não vendemos seus dados, não compartilhamos com anunciantes e não usamos para publicidade.' },
  // Seção 4: onde fica
  { titulo: 'Onde seus dados ficam', texto: 'Os dados ficam guardados no Supabase, um serviço de banco de dados, em servidores na região de São Paulo. Os e-mails de recuperação de senha são enviados pelo Brevo, que recebe apenas o seu endereço de e-mail para fazer a entrega.' },
  // Seção 5: quem pode ver
  { titulo: 'Quem pode ver', texto: 'No app, só você vê as suas movimentações: regras de segurança no banco de dados impedem que um usuário veja os dados de outro. Os responsáveis pelo app têm acesso técnico ao banco de dados e só o usam para manutenção e para resolver problemas.' },
  // Seção 6: direitos da pessoa (LGPD)
  { titulo: 'Seus direitos', texto: `Pela Lei Geral de Proteção de Dados (LGPD), você pode pedir para ver, corrigir ou apagar seus dados, e saber como eles são usados. Para apagar tudo, use o botão "Apagar minha conta" na aba Perfil. Para os outros pedidos, escreva para ${EMAIL_CONTATO}.` },
  // Seção 7: por quanto tempo
  { titulo: 'Por quanto tempo guardamos', texto: 'Enquanto a sua conta existir. Quando você apaga a conta, ela e todas as suas movimentações são apagadas na hora.' },
  // Seção 8: segurança
  { titulo: 'Como protegemos', texto: 'A comunicação entre o app e o banco de dados é criptografada, e cada usuário só tem acesso aos próprios dados. Nenhum sistema é 100% invulnerável, mas seguimos boas práticas de segurança e avisaremos você se algo grave acontecer.' },
  // Seção 9: menores de idade
  { titulo: 'Menores de idade', texto: 'Se você tem menos de 18 anos, use o FinanceHelp com o acompanhamento de um responsável.' },
  // Seção 10: mudanças no texto
  { titulo: 'Mudanças nesta política', texto: 'Se esta política mudar, vamos avisar dentro do app e atualizar a data no topo desta página.' },
// Fecha a lista
];

// ============ PARTE 3: O DESENHO ============
// Cria a tela da política de privacidade
export default function TelaPrivacidade() {
  // Volta para a tela anterior (ou para o início, se não tiver anterior)
  function voltar() {
    // Se tiver tela anterior, volta. Se não, vai para o início
    if (router.canGoBack()) router.back(); else router.replace('/');
  // Fecha
  }

  // Devolve o que aparece na tela
  return (
    // Caixa que rola (o texto é comprido!)
    <ScrollView style={estilos.tela} contentContainerStyle={estilos.conteudo}>

      {/* Botão de voltar */}
      <Pressable style={estilos.voltar} onPress={voltar} hitSlop={8} accessibilityLabel="Voltar">
        {/* Ícone da setinha para a esquerda */}
        <Ionicons name="chevron-back" size={20} color={cores.marfim} />
      {/* Fecha o botão de voltar */}
      </Pressable>

      {/* Título */}
      <Text style={estilos.titulo}>Política de privacidade</Text>
      {/* Data da última atualização */}
      <Text style={estilos.data}>Atualizada em {ATUALIZADA_EM}</Text>

      {/* Para cada seção da lista, um título e um texto */}
      {SECOES.map((secao) => (
        // A caixa de uma seção (o título serve de RG)
        <View key={secao.titulo} style={estilos.secao}>
          {/* A pergunta */}
          <Text style={estilos.secaoTitulo}>{secao.titulo}</Text>
          {/* A resposta */}
          <Text style={estilos.secaoTexto}>{secao.texto}</Text>
        {/* Fecha a seção */}
        </View>
      // Fecha a forma de biscoito
      ))}

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
    paddingTop: 52,
    // Espaço extra embaixo
    paddingBottom: 48,
    // No computador, não passa de 640 de largura (texto longo fica bom de ler assim)
    maxWidth: 640,
    // Ocupa a largura toda até o limite
    width: '100%',
    // Centralizado
    alignSelf: 'center',
  // Fecha
  },
  // Botão de voltar
  voltar: {
    // Largura
    width: 38,
    // Altura
    height: 38,
    // Redondo
    borderRadius: 19,
    // Fundo grafite
    backgroundColor: cores.grafite,
    // Ícone no meio (horizontal)
    alignItems: 'center',
    // Ícone no meio (vertical)
    justifyContent: 'center',
    // Espaço abaixo
    marginBottom: 16,
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
  // Data
  data: {
    // Letra simples
    fontFamily: fontes.texto,
    // Pequena
    fontSize: 13,
    // Prata
    color: cores.prata,
    // Espaço acima
    marginTop: 4,
    // Espaço abaixo
    marginBottom: 12,
  // Fecha
  },
  // Cada seção
  secao: {
    // Espaço acima, entre uma seção e outra
    marginTop: 20,
  // Fecha
  },
  // A pergunta
  secaoTitulo: {
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
  // A resposta
  secaoTexto: {
    // Letra simples
    fontFamily: fontes.texto,
    // Tamanho
    fontSize: 15,
    // Prata
    color: cores.prata,
    // Bastante espaço entre linhas (texto longo fica mais fácil de ler)
    lineHeight: 23,
  // Fecha
  },
// Fecha os estilos
});