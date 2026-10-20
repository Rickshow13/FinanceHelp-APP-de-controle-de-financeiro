// Importa o "Stack", que organiza as telas como uma pilha de cartas
import { Stack } from 'expo-router';
// Importa o controle da tela de abertura (a imagem que aparece enquanto o app carrega)
import * as SplashScreen from 'expo-splash-screen';
// Importa o carregador de letras
import { useFonts } from 'expo-font';
// Importa os 2 arquivos da letra do painel da bolsa (Big Shoulders): grossa e bem grossa
import { BigShoulders_700Bold, BigShoulders_800ExtraBold } from '@expo-google-fonts/big-shoulders';
// Importa os 4 arquivos da letra simples (Schibsted Grotesk), um para cada grossura
import { SchibstedGrotesk_400Regular, SchibstedGrotesk_500Medium, SchibstedGrotesk_600SemiBold, SchibstedGrotesk_700Bold } from '@expo-google-fonts/schibsted-grotesk';
// Importa a memória (useState) e o "faça isso assim que abrir" (useEffect)
import { useEffect, useState } from 'react';
// Importa a caixa e a rodinha de carregamento
import { ActivityIndicator, View } from 'react-native';
// Importa o formato do "crachá" de quem está logado
import type { Session } from '@supabase/supabase-js';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';
// Importa as cores do guarda-roupa
import { cores } from '../lib/tema';

// Cria o porteiro do app
export default function LayoutPrincipal() {
  // Post-it do crachá da pessoa logada. Começa vazio (ninguém logado)
  const [sessao, setSessao] = useState<Session | null>(null);
  // Post-it de "ainda estou conferindo o crachá?". Começa com sim
  const [carregando, setCarregando] = useState(true);
  // Carrega as letras e recebe duas respostas: "já carregou?" e "deu erro?"
  const [fontesProntas, erroFontes] = useFonts({
    // A letra do painel da bolsa, grossa (títulos)
    BigShoulders_700Bold,
    // A letra do painel da bolsa, bem grossa (nome do app e valores)
    BigShoulders_800ExtraBold,
    // A letra simples, normal
    SchibstedGrotesk_400Regular,
    // A letra simples, média
    SchibstedGrotesk_500Medium,
    // A letra simples, forte
    SchibstedGrotesk_600SemiBold,
    // A letra simples, negrito
    SchibstedGrotesk_700Bold,
  // Fecha a lista de letras
  });
  // Está tudo pronto? Crachá conferido E (letras carregadas OU deram erro, para o app nunca travar)
  const tudoPronto = !carregando && (fontesProntas || !!erroFontes);

  // Roda este bloco uma vez, assim que o app abre
  useEffect(() => {
    // Pergunta ao cofre: "tem alguém logado neste aparelho?"
    supabase.auth.getSession().then(({ data }) => {
      // Guarda a resposta no post-it
      setSessao(data.session);
      // Avisa que já terminou de conferir o crachá
      setCarregando(false);
    // Fecha a resposta do cofre
    });
    // Fica escutando o cofre: sempre que alguém entrar ou sair, ele avisa
    const { data: ouvinte } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      // Atualiza o crachá com a novidade
      setSessao(novaSessao);
    // Fecha o ouvinte
    });
    // Quando o app fechar, para de escutar
    return () => ouvinte.subscription.unsubscribe();
  // Rode só uma vez
  }, []);

  // Quando TUDO estiver pronto (crachá e letras), esconde a tela de abertura
  useEffect(() => {
    // Se tudo estiver pronto...
    if (tudoPronto) {
      // ...esconde a tela de abertura (o catch ignora o erro caso ela já tenha sumido)
      SplashScreen.hideAsync().catch(() => {});
    // Fecha o "se"
    }
  // Rode de novo sempre que o "tudoPronto" mudar
  }, [tudoPronto]);

  // Enquanto o crachá OU as letras não estiverem prontos...
  if (!tudoPronto) {
    // ...mostra uma rodinha girando
    return (
      // Caixa que ocupa a tela toda, com fundo preto ônix, e deixa a rodinha no meio
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: cores.onix }}>
        {/* A rodinha, dourada */}
        <ActivityIndicator size="large" color={cores.ouro} />
      {/* Fecha a caixa */}
      </View>
    // Fecha o return
    );
  // Fecha o "se"
  }

  // Depois que tudo estiver pronto, monta as telas
  return (
    // headerShown: false esconde a barra de título. contentStyle pinta o fundo de todas as telas de preto ônix
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: cores.onix } }}>
      {/* Portão 1: a área VIP só abre SE a pessoa tiver crachá */}
      <Stack.Protected guard={!!sessao}>
        {/* A área VIP: as abas */}
        <Stack.Screen name="(tabs)" />
        {/* A tela de nova transação, que sobe como um cartão (modal) */}
        <Stack.Screen name="nova-transacao" options={{ presentation: 'modal' }} />
      {/* Fecha o portão 1 */}
      </Stack.Protected>
      {/* Portão 2: a recepção só abre SE a pessoa NÃO tiver crachá */}
      <Stack.Protected guard={!sessao}>
        {/* A recepção (login) */}
        <Stack.Screen name="login" />
      {/* Fecha o portão 2 */}
      </Stack.Protected>
    {/* Fecha a pilha de telas */}
    </Stack>
  // Fecha o return
  );
// Fecha o porteiro
}