// Importa o "Stack", que organiza as telas como uma pilha de cartas
import { Stack } from 'expo-router';
// Importa o controle da tela de abertura (a imagem que aparece enquanto o app carrega)
import * as SplashScreen from 'expo-splash-screen';
// Importa a memória (useState) e o "faça isso assim que abrir" (useEffect)
import { useEffect, useState } from 'react';
// Importa a caixa e a rodinha de carregamento
import { ActivityIndicator, View } from 'react-native';
// Importa o formato do "crachá" de quem está logado
import type { Session } from '@supabase/supabase-js';
// Importa o telefone do cofre
import { supabase } from '../lib/supabase';

// Cria o porteiro do app
export default function LayoutPrincipal() {
  // Post-it do crachá da pessoa logada. Começa vazio (null), ou seja, ninguém logado
  const [sessao, setSessao] = useState<Session | null>(null);
  // Post-it de "ainda estou conferindo o crachá?". Começa com "sim" (true)
  const [carregando, setCarregando] = useState(true);
  
  // Roda este bloco uma vez, assim que o app abre
  useEffect(() => {
    // Pergunta ao cofre: "tem alguém logado neste aparelho?"
    supabase.auth.getSession().then(({ data }) => {
      // Guarda a resposta no post-it (o crachá, ou nada)
      setSessao(data.session);
      // Avisa que já terminou de conferir
      setCarregando(false);
      // Esconde a tela de abertura (o catch ignora o erro caso ela já tenha sumido)
      SplashScreen.hideAsync().catch(() => {});
    // Fecha a resposta do cofre
    });
    // Fica escutando o cofre: sempre que alguém entrar ou sair, ele avisa
    const { data: ouvinte } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      // Atualiza o post-it do crachá com a novidade
      setSessao(novaSessao);
    // Fecha o ouvinte
    });
    // Quando o app fechar, para de escutar (para não gastar bateria à toa)
    return () => ouvinte.subscription.unsubscribe();
  // Os colchetes vazios [] querem dizer "rode só uma vez"
  }, []);
  
  // Enquanto ainda está conferindo o crachá...
  if (carregando) {
    // ...mostra uma rodinha girando
    return (
      // Caixa que ocupa a tela toda e deixa a rodinha no meio
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0F1F17' }}>
        {/* A rodinha, grande e verde */}
        <ActivityIndicator size="large" color="#1E8E5A" />
      {/* Fecha a caixa */}
      </View>
    // Fecha o return
    );
  // Fecha o "se"
  }
  
  // Depois de conferir, monta as telas
  return (
    // headerShown: false esconde a barra de título padrão lá em cima
    <Stack screenOptions={{ headerShown: false }}>
      {/* Portão 1: a área VIP (as abas) só abre SE a pessoa tiver crachá */}
      <Stack.Protected guard={!!sessao}>
        {/* A área VIP: a pasta (tabs) */}
        <Stack.Screen name="(tabs)" />
      {/* Fecha o portão 1 */}
      </Stack.Protected>
      {/* Portão 2: a recepção só abre SE a pessoa NÃO tiver crachá */}
      <Stack.Protected guard={!sessao}>
        {/* A recepção: o arquivo login.tsx */}
        <Stack.Screen name="login" />
      {/* Fecha o portão 2 */}
      </Stack.Protected>
    {/* Fecha a pilha de telas */}
    </Stack>
  // Fecha o return
  );
// Fecha o porteiro
}