// Importa as peças da tela: caixa, texto, botão e estilos
import { Pressable, StyleSheet, Text, View } from 'react-native';
// Importa o telefone do cofre (volta 2 pastas: sai de (tabs), sai de app, e entra em lib)
import { supabase } from '../../lib/supabase';

// Cria a tela inicial. "export default" deixa o app encontrar esta tela
export default function TelaInicial() {
  // Devolve o que aparece na tela
  return (
    // Caixa da tela inteira
    <View style={estilos.tela}>

      {/* Título de boas-vindas */}
      <Text style={estilos.titulo}>Olá, Ítalo! 💰</Text>

      {/* Subtítulo */}
      <Text style={estilos.subtitulo}>Vamos cuidar do seu dinheiro hoje?</Text>

      {/* Cartão do saldo */}
      <View style={estilos.cartao}>
        {/* Texto pequeno em cima do valor */}
        <Text style={estilos.cartaoRotulo}>Saldo do mês</Text>
        {/* Valor do saldo (por enquanto fixo, no Passo 4 ele vai calcular sozinho) */}
        <Text style={estilos.cartaoValor}>R$ 0,00</Text>
      {/* Fecha o cartão */}
      </View>

      {/* Botão de sair: ao tocar, pede ao cofre para jogar fora o crachá */}
      <Pressable style={estilos.botaoSair} onPress={() => supabase.auth.signOut()}>
        {/* Texto do botão */}
        <Text style={estilos.botaoSairTexto}>Sair da conta</Text>
      {/* Fecha o botão */}
      </Pressable>

    {/* Fecha a caixa da tela */}
    </View>
  // Fecha o return
  );
// Fecha a tela inicial
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
    // Espaço extra em cima, por causa do relógio do celular
    paddingTop: 80,
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
  // Fecha
  },
  // Subtítulo
  subtitulo: {
    // Letra média
    fontSize: 16,
    // Cinza clarinho
    color: '#A7B8AE',
    // Espaço acima
    marginTop: 4,
    // Espaço abaixo, para afastar do cartão
    marginBottom: 32,
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
  // Texto "Saldo do mês"
  cartaoRotulo: {
    // Letra pequena
    fontSize: 14,
    // Branco um pouco transparente
    color: 'rgba(255,255,255,0.8)',
  // Fecha
  },
  // Valor em reais
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
  // 🆕 Botão de sair
  botaoSair: {
    // Espaço acima, para ficar longe do cartão
    marginTop: 32,
    // Espaço interno
    padding: 14,
    // Pontas arredondadas
    borderRadius: 14,
    // Borda fina
    borderWidth: 1,
    // Cor da borda: vermelho suave
    borderColor: '#FF8A80',
    // Centraliza o texto
    alignItems: 'center',
  // Fecha
  },
  // 🆕 Texto do botão de sair
  botaoSairTexto: {
    // Vermelho suave
    color: '#FF8A80',
    // Negrito
    fontWeight: 'bold',
  // Fecha
  },
// Fecha os estilos
});